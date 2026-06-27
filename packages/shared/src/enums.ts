/** Kanonik enum'lar — DB şeması (docs/DATABASE.md) ile birebir uyumlu. */

export const FileModality = {
  Document: 'document',
  Image: 'image',
  Handwriting: 'handwriting',
  Audio: 'audio',
  Video: 'video',
} as const;
export type FileModality = (typeof FileModality)[keyof typeof FileModality];

export const FileStatus = {
  Queued: 'queued',
  Extracting: 'extracting',
  Embedding: 'embedding',
  Ready: 'ready',
  Failed: 'failed',
} as const;
export type FileStatus = (typeof FileStatus)[keyof typeof FileStatus];

/** Üç katmanlı bilgi mimarisi. */
export const ContentLayer = {
  QuickGlance: 'quick_glance',
  Academic: 'academic',
  Analogy: 'analogy',
} as const;
export type ContentLayer = (typeof ContentLayer)[keyof typeof ContentLayer];

export const QuestionType = {
  Mcq: 'mcq',
  TrueFalse: 'true_false',
  FillBlank: 'fill_blank',
  Match: 'match',
  Open: 'open',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const QuizMode = {
  Practice: 'practice',
  Exam: 'exam',
} as const;
export type QuizMode = (typeof QuizMode)[keyof typeof QuizMode];

/** FSRS kart durumları. */
export const CardState = {
  New: 'new',
  Learning: 'learning',
  Review: 'review',
  Relearning: 'relearning',
} as const;
export type CardState = (typeof CardState)[keyof typeof CardState];

export const LinkRelation = {
  Supports: 'supports',
  Contradicts: 'contradicts',
  Extends: 'extends',
  Duplicate: 'duplicate',
} as const;
export type LinkRelation = (typeof LinkRelation)[keyof typeof LinkRelation];

export const ModerationStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;
export type ModerationStatus = (typeof ModerationStatus)[keyof typeof ModerationStatus];
