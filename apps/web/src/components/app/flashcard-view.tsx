'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Flashcard } from '@/lib/types';

export function FlashcardView({ cards }: { cards: Flashcard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => (
        <Card key={i} card={c} />
      ))}
    </div>
  );
}

function Card({ card }: { card: Flashcard }) {
  const [showBack, setShowBack] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setShowBack((v) => !v)}
      className="flex min-h-[7.5rem] flex-col rounded-xl border border-border bg-card p-4 text-left transition hover:border-accent/50"
    >
      <span className="text-xs text-muted-foreground">
        {showBack ? 'Cevap' : 'Soru'} · çevirmek için tıkla
      </span>
      <span className={cn('mt-2 text-sm', showBack ? 'text-foreground' : 'font-medium')}>
        {showBack ? card.back : card.front}
      </span>
    </button>
  );
}
