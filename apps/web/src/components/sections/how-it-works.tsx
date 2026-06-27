import { Sparkles, Upload, Wand2 } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Yükle',
    desc: 'PDF, defter fotoğrafı, ses kaydı, YouTube linki — ne olursa. Dosya türü fark etmez.',
  },
  {
    icon: Wand2,
    step: '02',
    title: 'AI işler',
    desc: 'OCR, ses-yazı dökümü ve LLM motorları içeriği okur; özetler, tasnif eder, bağ kurar.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Öğren & Test ol',
    desc: 'Özet oku, soru sor, test çöz, flashcard tekrarla, podcast dinle. Hepsi tek yerde.',
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Üç adımda öğrenme</h2>
          <p className="mt-4 text-muted-foreground">
            Kaynaktan sınava hazır bilgiye giden yol, dakikalar değil saniyeler sürer.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="absolute right-5 top-5 text-4xl font-bold text-muted/60">
                {s.step}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
