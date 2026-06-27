import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            Studfy
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            AI-Native Öğrenme İşletim Sistemi · Sıfır halüsinasyon · Tamamen ücretsiz
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Hemen Başla
          </Link>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">© 2026 Studfy · MIT Lisansı</p>
      </div>
    </footer>
  );
}
