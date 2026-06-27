'use client';

import {
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ApiKeyDialog } from '@/components/app/api-key-dialog';
import { Markdown } from '@/components/app/markdown';
import { FlashcardView } from '@/components/app/flashcard-view';
import { QuizView } from '@/components/app/quiz-view';
import { cn } from '@/lib/cn';
import { deleteDoc, getAllDocs, putDoc } from '@/lib/db';
import { newId, readFile } from '@/lib/file';
import { ask, askStream } from '@/lib/ai';
import { API_KEY_STORAGE, parseJsonLoose, type GeminiFile } from '@/lib/gemini';
import {
  CHAT_PROMPT,
  customPrompt,
  flashcardsPrompt,
  NOTES_PROMPT,
  questionsPrompt,
  SUMMARY_PROMPT,
} from '@/lib/prompts';
import type { Flashcard, QuizQuestion, StudyDoc } from '@/lib/types';

type Tab = 'custom' | 'notes' | 'summary' | 'quiz' | 'cards' | 'chat' | 'source';

const ACCEPT = 'image/*,application/pdf,.txt,.md,.csv';

const QUICK_PRESETS = [
  'Kavram haritası çıkar',
  'Önemli tanımlar ve formüller',
  'Konuyu basitçe, örneklerle anlat',
  'Sık yapılan hatalar',
  'Kronolojik / adım adım tablo',
  '10 soruluk test üret',
];

export function StudyApp() {
  const [docs, setDocs] = useState<StudyDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [tab, setTab] = useState<Tab>('notes');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [count, setCount] = useState(5);
  const [cardCount, setCardCount] = useState(8);
  const [customReq, setCustomReq] = useState('');
  const [stream, setStream] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem(API_KEY_STORAGE) ?? '');
    getAllDocs()
      .then((list) => {
        setDocs(list);
        if (list[0]) setActiveId(list[0].id);
      })
      .catch(() => setError('Yerel veriler yüklenemedi.'));
  }, []);

  const active = docs.find((d) => d.id === activeId) ?? null;

  function saveKey(key: string) {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowKey(false);
  }

  async function persist(updated: StudyDoc) {
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    await putDoc(updated);
  }

  async function onAddFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const added: StudyDoc[] = [];
    for (const file of Array.from(files)) {
      try {
        const r = await readFile(file);
        added.push({
          id: newId(),
          name: file.name,
          kind: r.kind,
          mimeType: r.mimeType,
          data: r.data,
          createdAt: Date.now(),
          chat: [],
        });
      } catch {
        setError(`"${file.name}" okunamadı.`);
      }
    }
    if (added.length === 0) return;
    for (const d of added) await putDoc(d);
    setDocs((prev) => [...added, ...prev]);
    const first = added[0];
    if (first) {
      setActiveId(first.id);
      setTab('notes');
    }
  }

  async function remove(id: string) {
    await deleteDoc(id);
    const remaining = docs.filter((d) => d.id !== id);
    setDocs(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? null);
  }

  function fileArg(doc: StudyDoc): { file?: GeminiFile; text?: string } {
    if (doc.kind === 'text') return { text: doc.data };
    return { file: { mimeType: doc.mimeType, base64: doc.data } };
  }

  function requireKey(): boolean {
    // Anahtarsız Puter motoru var; AI her zaman hazır.
    return true;
  }

  async function run<T>(label: string, fn: () => Promise<T>) {
    setError(null);
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setBusy(null);
    }
  }

  async function genNotes(doc: StudyDoc) {
    if (!requireKey()) return;
    setTab('notes');
    setStream('');
    await run('notes', async () => {
      const out = await askStream({ prompt: NOTES_PROMPT, ...fileArg(doc) }, apiKey, setStream);
      await persist({ ...doc, notes: out });
      setStream('');
    });
  }

  async function genSummary(doc: StudyDoc) {
    if (!requireKey()) return;
    setTab('summary');
    setStream('');
    await run('summary', async () => {
      const out = await askStream({ prompt: SUMMARY_PROMPT, ...fileArg(doc) }, apiKey, setStream);
      await persist({ ...doc, summary: out });
      setStream('');
    });
  }

  async function genQuiz(doc: StudyDoc) {
    if (!requireKey()) return;
    setTab('quiz');
    await run('quiz', async () => {
      const out = await ask(
        { prompt: questionsPrompt(count), temperature: 0.6, ...fileArg(doc) },
        apiKey,
      );
      const parsed = parseJsonLoose<{ questions: QuizQuestion[] }>(out);
      if (!parsed.questions || parsed.questions.length === 0) {
        throw new Error('Soru üretilemedi, tekrar dene.');
      }
      await persist({ ...doc, questions: parsed.questions });
    });
  }

  async function genFlashcards(doc: StudyDoc) {
    if (!requireKey()) return;
    setTab('cards');
    await run('cards', async () => {
      const out = await ask(
        { prompt: flashcardsPrompt(cardCount), temperature: 0.5, ...fileArg(doc) },
        apiKey,
      );
      const parsed = parseJsonLoose<{ cards: Flashcard[] }>(out);
      if (!parsed.cards || parsed.cards.length === 0) {
        throw new Error('Kart üretilemedi, tekrar dene.');
      }
      await persist({ ...doc, flashcards: parsed.cards });
    });
  }

  async function runCustom(doc: StudyDoc) {
    const request = customReq.trim();
    if (!request) return;
    if (!requireKey()) return;
    setStream('');
    await run('custom', async () => {
      const out = await askStream(
        { prompt: customPrompt(request), ...fileArg(doc) },
        apiKey,
        setStream,
      );
      await persist({ ...doc, custom: { request, result: out } });
      setStream('');
    });
  }

  async function sendChat(doc: StudyDoc) {
    const q = chatInput.trim();
    if (!q) return;
    if (!requireKey()) return;
    setChatInput('');
    setStream('');
    const withUser: StudyDoc = { ...doc, chat: [...doc.chat, { role: 'user', content: q }] };
    await persist(withUser);
    await run('chat', async () => {
      const out = await askStream(
        { prompt: `${CHAT_PROMPT}\n\nÖĞRENCİNİN SORUSU: ${q}`, ...fileArg(doc) },
        apiKey,
        setStream,
      );
      await persist({ ...withUser, chat: [...withUser.chat, { role: 'ai', content: out }] });
      setStream('');
    });
  }

  return (
    <div className="min-h-screen">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void onAddFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {showKey && (
        <ApiKeyDialog current={apiKey} onSave={saveKey} onClose={() => setShowKey(false)} />
      )}

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight">Studfy</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKey(true)}
              title="Gelişmiş: kendi Google anahtarını bağla (isteğe bağlı)"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted"
            >
              <span className="h-2 w-2 rounded-full bg-green-500" /> Yapay zeka hazır
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Belge Ekle
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Telefondan galeri/kamera, bilgisayardan dosya seç. Görsel, PDF veya metin. Dosyaların
          cihazından çıkmaz; yalnızca tarayıcında saklanır.
        </p>

        {docs.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
            {docs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                  d.id === activeId
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {d.kind === 'image' ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="max-w-[10rem] truncate">{d.name}</span>
              </button>
            ))}
          </div>
        )}

        {!active ? (
          <EmptyState onAdd={() => fileRef.current?.click()} hasKey onKey={() => setShowKey(true)} />
        ) : (
          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="truncate text-lg font-semibold">{active.name}</h1>
              <button
                type="button"
                onClick={() => remove(active.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-red-500/50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Sil
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                label="Nota Çevir"
                running={busy === 'notes'}
                disabled={busy !== null}
                onClick={() => genNotes(active)}
              />
              <ActionButton
                label="Hızlı Özet"
                running={busy === 'summary'}
                disabled={busy !== null}
                onClick={() => genSummary(active)}
              />
              <ActionButton
                label="Test Üret"
                running={busy === 'quiz'}
                disabled={busy !== null}
                onClick={() => genQuiz(active)}
              />
              <ActionButton
                label="Flash Kart"
                running={busy === 'cards'}
                disabled={busy !== null}
                onClick={() => genFlashcards(active)}
              />
            </div>

            <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
              {(
                [
                  ['custom', '✨ İstediğini Yaptır'],
                  ['notes', 'Notlar'],
                  ['summary', 'Özet'],
                  ['quiz', 'Test'],
                  ['cards', 'Kartlar'],
                  ['chat', 'Soru Sor'],
                  ['source', 'Kaynak'],
                ] as Array<[Tab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    'shrink-0 border-b-2 px-3 py-2 text-sm transition',
                    tab === key
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {tab === 'custom' && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bu belgeden ne istersen yaz; ya da hazır komutlardan seç:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomReq(p)}
                        disabled={busy !== null}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/50 hover:text-foreground disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={customReq}
                      onChange={(e) => setCustomReq(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') runCustom(active);
                      }}
                      disabled={busy !== null}
                      placeholder="Örn: Bu konunun kavram haritasını çıkar"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => runCustom(active)}
                      disabled={busy !== null || !customReq.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
                    >
                      {busy === 'custom' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Yaptır
                    </button>
                  </div>
                  {busy === 'custom' && stream ? (
                    <div className="mt-6">
                      <StreamingView text={stream} />
                    </div>
                  ) : (
                    active.custom && (
                      <div className="mt-6">
                        <p className="mb-2 text-xs text-muted-foreground">
                          İstek: “{active.custom.request}”
                        </p>
                        <Markdown>{active.custom.result}</Markdown>
                      </div>
                    )
                  )}
                </div>
              )}

              {tab === 'notes' &&
                (busy === 'notes' && stream ? (
                  <StreamingView text={stream} />
                ) : (
                  <TabBody
                    empty={!active.notes}
                    emptyLabel="Bu belgeyi düzenli notlara çevir."
                    action={() => genNotes(active)}
                    actionLabel="Nota Çevir"
                    running={busy === 'notes'}
                    disabled={busy !== null}
                  >
                    {active.notes && <Markdown>{active.notes}</Markdown>}
                  </TabBody>
                ))}

              {tab === 'summary' &&
                (busy === 'summary' && stream ? (
                  <StreamingView text={stream} />
                ) : (
                  <TabBody
                    empty={!active.summary}
                    emptyLabel="Sınav öncesi hızlı özet çıkar."
                    action={() => genSummary(active)}
                    actionLabel="Özet Çıkar"
                    running={busy === 'summary'}
                    disabled={busy !== null}
                  >
                    {active.summary && <Markdown>{active.summary}</Markdown>}
                  </TabBody>
                ))}

              {tab === 'quiz' && (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Soru sayısı:</span>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      {[3, 5, 10, 15].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => genQuiz(active)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
                    >
                      {busy === 'quiz' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {active.questions ? 'Yeniden üret' : 'Test Üret'}
                    </button>
                  </div>
                  {active.questions ? (
                    <QuizView questions={active.questions} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Henüz test yok. Yukarıdan üret.
                    </p>
                  )}
                </div>
              )}

              {tab === 'cards' && (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Kart sayısı:</span>
                    <select
                      value={cardCount}
                      onChange={(e) => setCardCount(Number(e.target.value))}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      {[5, 8, 12, 20].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => genFlashcards(active)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
                    >
                      {busy === 'cards' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {active.flashcards ? 'Yeniden üret' : 'Kart Üret'}
                    </button>
                  </div>
                  {active.flashcards ? (
                    <FlashcardView cards={active.flashcards} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz kart yok. Yukarıdan üret.</p>
                  )}
                </div>
              )}

              {tab === 'chat' && (
                <ChatPanel
                  doc={active}
                  input={chatInput}
                  setInput={setChatInput}
                  onSend={() => sendChat(active)}
                  running={busy === 'chat'}
                  streaming={stream}
                  disabled={busy !== null}
                />
              )}

              {tab === 'source' && <SourcePreview doc={active} />}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ActionButton({
  label,
  running,
  disabled,
  onClick,
}: {
  label: string;
  running: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running || disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-accent/50 hover:bg-muted disabled:opacity-50"
    >
      {running ? (
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
      ) : (
        <Sparkles className="h-4 w-4 text-accent" />
      )}
      {label}
    </button>
  );
}

function TabBody({
  empty,
  emptyLabel,
  action,
  actionLabel,
  running,
  disabled,
  children,
}: {
  empty: boolean;
  emptyLabel: string;
  action: () => void;
  actionLabel: string;
  running: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        <button
          type="button"
          onClick={action}
          disabled={running || disabled}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {actionLabel}
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function ChatPanel({
  doc,
  input,
  setInput,
  onSend,
  running,
  streaming,
  disabled,
}: {
  doc: StudyDoc;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  running: boolean;
  streaming: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="space-y-3">
        {doc.chat.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Bu belge hakkında soru sor — yapay zeka yalnızca bu belgeye dayanarak yanıtlar.
          </p>
        )}
        {doc.chat.map((t, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-sm',
              t.role === 'user'
                ? 'ml-auto bg-accent text-accent-foreground'
                : 'border border-border bg-card',
            )}
          >
            {t.role === 'ai' ? <Markdown>{t.content}</Markdown> : t.content}
          </div>
        ))}
        {running && streaming ? (
          <div className="max-w-[85%] rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <Markdown>{streaming}</Markdown>
          </div>
        ) : running ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yazıyor…
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend();
          }}
          disabled={disabled}
          placeholder="Sorunu yaz…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !input.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 text-accent-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StreamingView({ text }: { text: string }) {
  return (
    <div>
      <Markdown>{text}</Markdown>
      <span className="mt-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-accent align-middle" />
    </div>
  );
}

function SourcePreview({ doc }: { doc: StudyDoc }) {
  if (doc.kind === 'image') {
    return (
      <img
        src={`data:${doc.mimeType};base64,${doc.data}`}
        alt={doc.name}
        className="max-h-[28rem] w-auto rounded-xl border border-border"
      />
    );
  }
  if (doc.kind === 'text') {
    return (
      <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm">
        {doc.data}
      </pre>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <FileText className="h-5 w-5 text-accent" /> PDF belgesi: {doc.name} (yapay zeka tarafından
      okunur)
    </div>
  );
}

function EmptyState({
  onAdd,
  hasKey,
  onKey,
}: {
  onAdd: () => void;
  hasKey: boolean;
  onKey: () => void;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Plus className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">İlk belgeni ekle</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Defterinin fotoğrafını çek, ders PDF'ini ya da notunu seç. Studfy onu nota çevirir, sana
        test üretir ve sorularını yanıtlar.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Belge Ekle
      </button>
      {!hasKey && (
        <p className="mt-4 text-xs text-muted-foreground">
          Yapay zeka özellikleri için{' '}
          <button type="button" onClick={onKey} className="font-medium text-accent hover:underline">
            ücretsiz anahtarını bağla
          </button>
          .
        </p>
      )}
    </div>
  );
}
