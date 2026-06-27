import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
            Bir ders fotoğrafı, PDF veya not yükle; Studfy onu saniyeler içinde nota, teste ve
            yanıtlanabilir bilgiye çevirsin. Tamamen ücretsiz.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Aracı Aç
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Nasıl Çalışır? <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
