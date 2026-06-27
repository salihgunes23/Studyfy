export type DocKind = 'image' | 'pdf' | 'text';

export interface QuizQuestion {
  stem: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ChatTurn {
  role: 'user' | 'ai';
  content: string;
}

export interface StudyDoc {
  id: string;
  name: string;
  kind: DocKind;
  mimeType: string;
  /** Görsel/PDF için base64 (önek olmadan), metin için ham içerik. */
  data: string;
  createdAt: number;
  notes?: string;
  summary?: string;
  questions?: QuizQuestion[];
  chat: ChatTurn[];
}
