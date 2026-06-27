import { z } from 'zod';
import {
  ContentLayer,
  FileModality,
  FileStatus,
  ModerationStatus,
  QuestionType,
  QuizMode,
} from './enums';

const zEnum = <T extends Record<string, string>>(obj: T) =>
  z.enum(Object.values(obj) as [string, ...string[]]);

/** Kaynak konum — derin link için (PDF sayfası/paragrafı veya ses saniyesi). */
export const LocatorSchema = z.union([
  z.object({ page: z.number().int().positive(), paragraph: z.number().int().positive().optional() }),
  z.object({ startSec: z.number().nonnegative(), endSec: z.number().nonnegative().optional() }),
]);
export type Locator = z.infer<typeof LocatorSchema>;

/** Her AI iddiasının taşıması zorunlu olan atıf (zero-hallucination). */
export const CitationSchema = z.object({
  chunkId: z.string().uuid(),
  fileId: z.string().uuid(),
  locator: LocatorSchema,
  quote: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const ClassificationResultSchema = z.object({
  course: z.string(),
  topic: z.string(),
  subtopic: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  language: z.string().default('tr'),
  confidence: z.number().min(0).max(1),
});
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

export const GeneratedQuestionSchema = z.object({
  type: zEnum(QuestionType),
  stem: z.string().min(1),
  options: z.array(z.string()).optional(),
  answer: z.unknown(),
  explanation: z.string(),
  sourceChunkId: z.string().uuid(),
  sourceLocator: LocatorSchema,
  topic: z.string(),
  difficulty: z.number().min(0).max(1),
});
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

/** Verifier LLM'in soru-kaynak eşleşmesi kararı. */
export const VerifierVerdictSchema = z.object({
  grounded: z.boolean(),
  evidenceSpan: z.string().nullable(),
  reason: z.string(),
});
export type VerifierVerdict = z.infer<typeof VerifierVerdictSchema>;

export const FileUploadInitSchema = z.object({
  workspaceId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
});
export type FileUploadInit = z.infer<typeof FileUploadInitSchema>;

export const FileStatusEventSchema = z.object({
  fileId: z.string().uuid(),
  status: zEnum(FileStatus),
  modality: zEnum(FileModality).optional(),
  progress: z.number().min(0).max(1).optional(),
});
export type FileStatusEvent = z.infer<typeof FileStatusEventSchema>;

export const ContentLayerRequestSchema = z.object({
  fileId: z.string().uuid(),
  layer: zEnum(ContentLayer),
});
export type ContentLayerRequest = z.infer<typeof ContentLayerRequestSchema>;

/** Hibrit aramaya verilen sorgu. */
export const SearchQuerySchema = z.object({
  workspaceId: z.string().uuid(),
  query: z.string().min(1),
  scope: z.enum(['workspace', 'folder', 'file']).default('workspace'),
  topK: z.number().int().min(1).max(50).default(10),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const LibraryShareSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  content: z.string().min(1),
  course: z.string(),
  topic: z.string(),
  tags: z.array(z.string()).default([]),
  anonymous: z.boolean().default(false),
  license: z.string().default('CC-BY'),
  moderationStatus: zEnum(ModerationStatus).default(ModerationStatus.Pending),
});
export type LibraryShare = z.infer<typeof LibraryShareSchema>;

export const QuizGenerateSchema = z.object({
  workspaceId: z.string().uuid(),
  sourceFileIds: z.array(z.string().uuid()).min(1),
  mode: zEnum(QuizMode).default(QuizMode.Practice),
  questionCount: z.number().int().min(1).max(50).default(10),
  types: z.array(zEnum(QuestionType)).default([QuestionType.Mcq]),
});
export type QuizGenerate = z.infer<typeof QuizGenerateSchema>;

/** FSRS değerlendirme puanı: 1=again, 2=hard, 3=good, 4=easy. */
export const ReviewRatingSchema = z.number().int().min(1).max(4);
export type ReviewRating = z.infer<typeof ReviewRatingSchema>;
