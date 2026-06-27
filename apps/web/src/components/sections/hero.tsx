import { ArrowRight, FileText, Mic, PenLine, Youtube } from 'lucide-react';

const INPUTS = [
  { icon: FileText, label: 'PDF & Word' },
  { icon: PenLine, label: 'El yazısı' },
  { icon: Mic, label: 'Ses kaydı' },
  { icon: Youtube, label: 'YouTube' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Sıfır halüsinasyon · Tamamen ücretsiz
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Ne yüklersen yükle,
            <br />
            <span className="text-gradient">öğrenilebilir bilgiye</span> dönüşsün.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            PDF, taranmış el yazısı, amfi ses kaydı veya YouTube dersi — Studfy hepsini saniyeler
            içinde <strong className="text-foreground">özet, test, flashcard ve podcaste</strong>{' '}
            çevirir. Yapay zeka yalnızca <strong className="text-foreground">senin verinden</strong>{' '}
            konuşur.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#basla"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Hemen Başla <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#nasil-calisir"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Nasıl Çalışır?
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {INPUTS.map((i) => (
              <span
                key={i.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
              >
                <i.icon className="h-3.5 w-3.5 text-accent" /> {i.label}
              </span>
            ))}
          </div>
        </div>

        <div className="glow mx-auto mt-16 max-w-4xl animate-fade-up rounded-2xl border border-border bg-card p-2 shadow-2xl">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

function AppMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-muted-foreground">studfy · Çalışma Alanı</span>
      </div>
      <div className="grid grid-cols-12 gap-px bg-border text-left">
        <div className="col-span-3 hidden space-y-2 bg-card p-4 sm:block">
          <p className="text-xs font-medium text-muted-foreground">📁 İleri Matematik</p>
          <div className="space-y-1.5">
            <div className="rounded-md bg-accent/10 px-2 py-1.5 text-xs text-foreground">
              Türev.pdf ✓
            </div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">İntegral.pdf ✓</div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Ders3.mp3 ⏳</div>
          </div>
          <p className="pt-2 text-xs font-medium text-muted-foreground">📁 Hukuk</p>
        </div>
        <div className="col-span-12 space-y-3 bg-background p-5 sm:col-span-6">
          <div className="flex gap-2 text-xs">
            <span className="rounded-md bg-accent px-2 py-1 font-medium text-accent-foreground">
              ⚡ Hızlı Bakış
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              📚 Akademik
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
              🧸 Analoji
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-3/4 rounded bg-muted" />
            <div className="h-2.5 w-full rounded bg-muted" />
            <div className="h-2.5 w-5/6 rounded bg-muted" />
            <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-muted-foreground">
              📄 Kaynak: <span className="text-foreground">Türev.pdf · s.14 · ¶3</span>
            </div>
          </div>
        </div>
        <div className="col-span-3 hidden space-y-2 bg-card p-4 sm:block">
          <p className="text-xs font-medium text-muted-foreground">💬 Asistan</p>
          <div className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
            sin(2x) açılımı nedir?
          </div>
          <div className="rounded-lg border border-border p-2 text-xs text-foreground">
            2·sinx·cosx <span className="text-accent">[s.14]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
