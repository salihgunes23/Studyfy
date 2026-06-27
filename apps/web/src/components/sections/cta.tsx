import { ArrowRight, Github } from 'lucide-react';

const GITHUB_URL = 'https://github.com/salihgunes23/Studyfy';

export function Cta() {
  return (
    <section id="basla" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="glow relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Öğrenme şeklini değiştirmeye hazır mısın?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Studfy açık geliştiriliyor. Vizyonu, mimariyi ve yol haritasını incele; gelişmeleri
            takip et.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              <Github className="h-4 w-4" /> GitHub’da İncele
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/docs/PRD.md`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Ürün Dokümanını Oku <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
