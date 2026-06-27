'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const FAQS = [
  {
    q: 'Studfy gerçekten ücretsiz mi?',
    a: 'Evet. Çekirdek özellikler tamamen ücretsizdir ve her kullanıcının kendi izole, şifreli çalışma alanı vardır.',
  },
  {
    q: 'Yapay zeka yanlış bilgi (halüsinasyon) verir mi?',
    a: 'Hayır olacak şekilde tasarlandı. AI yalnızca senin yüklediğin dökümanlardan konuşur ve her iddiaya kaynak atfı ekler. Kaynakta yoksa "bilgi yok" der.',
  },
  {
    q: 'Hangi dosya türlerini yükleyebilirim?',
    a: 'PDF, Word, Excel, TXT, EPUB; el yazısı/tahta fotoğrafları (JPEG, PNG, HEIC); ses kayıtları (MP3, WAV, M4A); video ve YouTube linkleri.',
  },
  {
    q: 'El yazısı notlarımı okuyabiliyor mu?',
    a: 'Evet. Gelişmiş görsel OCR ile defter ve tahta fotoğraflarındaki el yazısını metne çevirip işler.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Kullanıcı bazında şifreleme, katı veri izolasyonu (her kullanıcı yalnızca kendi verisini görür) ve KVKK/GDPR uyumu hedeflenir.',
  },
  {
    q: 'Bu site çalışan uygulama mı?',
    a: 'Bu sayfa ürün önizlemesidir. Çekirdek platform geliştirme aşamasındadır; teknik dokümantasyon ve mimari GitHub deposunda açıktır.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="sss" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sık sorulan sorular</h2>
      </div>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
              >
                {f.q}
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 text-muted-foreground transition', isOpen && 'rotate-180')}
                />
              </button>
              {isOpen && <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
