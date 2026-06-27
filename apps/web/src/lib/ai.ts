/**
 * Birleşik AI çağrısı. Öncelik: anahtarsız Puter (Google gerekmez).
 * Puter kullanılamaz/başarısızsa ve kullanıcı kendi Google anahtarını (veya proxy)
 * bağladıysa Gemini'ye düşer.
 */
import { callGemini, HAS_PROXY } from './gemini';
import { type AskInput, callPuter } from './puter';

export type { AskInput };

export async function ask(opts: AskInput, apiKey: string): Promise<string> {
  try {
    return await callPuter(opts);
  } catch (err) {
    if (HAS_PROXY || apiKey) {
      return await callGemini({ apiKey, ...opts });
    }
    throw err instanceof Error ? err : new Error('Yapay zeka şu an yanıt veremedi.');
  }
}
