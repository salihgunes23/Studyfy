'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { QuizQuestion } from '@/lib/types';

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <QuestionCard key={i} q={q} index={i} />
      ))}
    </div>
  );
}

function QuestionCard({ q, index }: { q: QuizQuestion; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-medium">
        <span className="text-muted-foreground">{index + 1}.</span> {q.stem}
      </p>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answerIndex;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition',
                !answered && 'border-border hover:border-accent/50 hover:bg-muted',
                answered && isCorrect && 'border-green-500/50 bg-green-500/10',
                answered && isPicked && !isCorrect && 'border-red-500/50 bg-red-500/10',
                answered && !isCorrect && !isPicked && 'border-border opacity-60',
              )}
            >
              <span className="font-medium text-muted-foreground">
                {String.fromCharCode(65 + i)})
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {answered && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {picked === q.answerIndex ? '✅ Doğru! ' : '❌ Doğru cevap: ' +
              String.fromCharCode(65 + q.answerIndex) + ') '}
          </span>
          {q.explanation}
        </div>
      )}
    </div>
  );
}
