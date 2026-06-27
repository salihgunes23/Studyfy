'use client';

import { ExternalLink, KeyRound, X } from 'lucide-react';
import { useState } from 'react';
import { API_KEY_URL } from '@/lib/gemini';

export function ApiKeyDialog({
  current,
  onSave,
  onClose,
}: {
  current: string;
  onSave: (key: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(current);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <KeyRound className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold">Yapay zekayı bağla</h2>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Google'ın <strong className="text-foreground">ücretsiz</strong> yapay zekasını kullanmak
          için tek seferlik bir anahtar gerekiyor. Anahtar yalnızca{' '}
          <strong className="text-foreground">senin tarayıcında</strong> saklanır.
        </p>

        <ol className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="font-semibold text-accent">1.</span>
            <span>
              <a
                href={API_KEY_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
              >
                Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>{' '}
              sayfasını aç (Google hesabınla giriş yap).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-accent">2.</span>
            <span>
              <strong className="text-foreground">"Create API key"</strong> de ve oluşan anahtarı
              kopyala.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-accent">3.</span>
            <span>Anahtarı aşağıya yapıştır ve kaydet.</span>
          </li>
        </ol>

        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza... ile başlayan anahtarını yapıştır"
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={!value.trim()}
            onClick={() => onSave(value.trim())}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Kaydet ve başla
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Anahtarın sunucumuza gönderilmez; istekler doğrudan Google'a gider.
        </p>
      </div>
    </div>
  );
}
