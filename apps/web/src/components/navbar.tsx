'use client';

import { GraduationCap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/cn';

const LINKS = [
  { href: '#ozellikler', label: 'Özellikler' },
  { href: '#nasil-calisir', label: 'Nasıl Çalışır' },
  { href: '#katmanlar', label: 'Anlatım' },
  { href: '#sss', label: 'SSS' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Studfy</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/app"
            className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 sm:inline-flex"
          >
            Hemen Başla
          </Link>
          <button
            type="button"
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <div className={cn('border-t border-border md:hidden', open ? 'block' : 'hidden')}>
        <div className="space-y-1 px-4 py-3">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/app"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground"
          >
            Hemen Başla
          </Link>
        </div>
      </div>
    </header>
  );
}
