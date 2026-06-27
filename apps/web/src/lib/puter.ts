/**
 * Puter.js motoru — anahtarsız, ücretsiz, tarayıcıdan AI (GPT-4o-mini, görsel
 * destekli). Google veya geliştirici anahtarı GEREKMEZ. Script layout'ta yüklenir.
 */

const MODEL = 'gpt-4o-mini';

export interface AskInput {
  prompt: string;
  text?: string;
  file?: { mimeType: string; base64: string };
  temperature?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Puter global'i script yüklenince window.puter olarak gelir.
/* eslint-disable @typescript-eslint/no-explicit-any */
async function ensurePuter(): Promise<any> {
  const w = window as any;
  for (let i = 0; i < 50; i++) {
    if (w.puter?.ai?.chat) return w.puter;
    await sleep(100);
  }
  throw new Error('Yapay zeka motoru yüklenemedi. Sayfayı yenileyip tekrar dene.');
}

export function puterAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).puter?.ai?.chat);
}

export async function callPuter(opts: AskInput): Promise<string> {
  const puter = await ensurePuter();

  let prompt = opts.prompt;
  if (opts.text) {
    prompt += '\n\n--- BELGE İÇERİĞİ ---\n' + opts.text;
  }

  let resp: any;
  if (opts.file) {
    if (opts.file.mimeType === 'application/pdf') {
      throw new Error(
        'PDF bu motorda okunamıyor. Görsel/metin kullan ya da sağ üstten Google anahtarı bağla.',
      );
    }
    const dataUrl = `data:${opts.file.mimeType};base64,${opts.file.base64}`;
    resp = await puter.ai.chat(prompt, dataUrl, false, { model: MODEL });
  } else {
    resp = await puter.ai.chat(prompt, { model: MODEL });
  }

  const text = extractText(resp);
  if (!text.trim()) {
    throw new Error('Yapay zeka boş yanıt döndü. Tekrar dener misin?');
  }
  return text;
}

function extractText(resp: any): string {
  if (typeof resp === 'string') return resp;
  const content = resp?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((p: any) => (p?.text ?? '') as string).join('');
  }
  if (typeof resp?.text === 'string') return resp.text;
  const s = String(resp ?? '');
  return s === '[object Object]' ? '' : s;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
