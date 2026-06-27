/**
 * Tarayıcıdan doğrudan Google Gemini (Generative Language API) çağrısı.
 * Anahtar kullanıcınındır (BYOK) ve yalnızca tarayıcıda saklanır; istek
 * doğrudan Google'a gider, aradaki hiçbir sunucuya uğramaz.
 */

export const GEMINI_MODEL = 'gemini-2.0-flash';
export const API_KEY_STORAGE = 'studfy_gemini_key';
export const API_KEY_URL = 'https://aistudio.google.com/app/apikey';

export interface GeminiFile {
  mimeType: string;
  base64: string;
}

interface Part {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

export async function callGemini(opts: {
  apiKey: string;
  prompt: string;
  file?: GeminiFile;
  text?: string;
  temperature?: number;
}): Promise<string> {
  const parts: Part[] = [{ text: opts.prompt }];
  if (opts.text) {
    parts.push({ text: '\n\n--- BELGE İÇERİĞİ ---\n' + opts.text });
  }
  if (opts.file) {
    parts.push({ inline_data: { mime_type: opts.file.mimeType, data: opts.file.base64 } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    opts.apiKey,
  )}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: opts.temperature ?? 0.4 },
      }),
    });
  } catch {
    throw new Error('İnternet bağlantısı yok ya da istek engellendi.');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(body)) {
      throw new Error('API anahtarı geçersiz görünüyor. Ayarlardan tekrar kontrol et.');
    }
    if (res.status === 429) {
      throw new Error('Ücretsiz kullanım sınırına ulaşıldı. Birkaç dakika sonra tekrar dene.');
    }
    if (res.status === 403) {
      throw new Error('Erişim reddedildi. Anahtarın doğru ve etkin olduğundan emin ol.');
    }
    throw new Error(`Yapay zeka hatası (${res.status}). Lütfen tekrar dene.`);
  }

  const json: unknown = await res.json();
  const text = extractText(json);
  if (!text.trim()) {
    throw new Error('Yapay zeka boş yanıt döndü. Tekrar dener misin?');
  }
  return text;
}

function extractText(json: unknown): string {
  const root = json as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  if (root?.promptFeedback?.blockReason) {
    throw new Error('İçerik güvenlik filtresine takıldı. Farklı bir belge dene.');
  }
  const parts = root?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? '')
    .filter(Boolean)
    .join('');
}

/** Modelin döndürdüğü JSON metnini güvenli biçimde ayrıştırır. */
export function parseJsonLoose<T>(text: string): T {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
