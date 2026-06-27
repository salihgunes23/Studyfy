/** Uygulama geneli sabitler. */

export const EMBEDDING_DIM = 1024;

/** Desteklenen yükleme MIME tipleri (Anything-to-Data). */
export const SUPPORTED_MIME_TYPES = [
  // Doküman
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/rtf',
  'application/epub+zip',
  // Görsel / el yazısı
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  // Ses
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/ogg',
  // Video
  'video/mp4',
  'video/quicktime',
] as const;

/** Retrieval boş/zayıfsa üretimi durduran eşik (cosine benzerlik). */
export const RETRIEVAL_MIN_SCORE = 0.2;

/** WebSocket olay adları. */
export const WS_EVENTS = {
  FileStatusChanged: 'file.status.changed',
  ContentReady: 'content.ready',
  QuizReady: 'quiz.ready',
  IngestionProgress: 'ingestion.progress',
} as const;
