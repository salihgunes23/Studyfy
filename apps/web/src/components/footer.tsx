import { Github, GraduationCap } from 'lucide-react';

const GITHUB_URL = 'https://github.com/salihgunes23/Studyfy';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            Studfy
          </div>
          <p className="text-center text-sm text-muted-foreground">
            AI-Native Öğrenme İşletim Sistemi · Sıfır halüsinasyon · Tamamen ücretsiz
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 Studfy · MIT Lisansı · Bu bir ürün önizleme sitesidir.
        </p>
      </div>
    </footer>
  );
}
