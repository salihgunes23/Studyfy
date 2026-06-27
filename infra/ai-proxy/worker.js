/**
 * Studfy AI Proxy — Cloudflare Worker.
 *
 * Amaç: Gemini API anahtarını HERKESE AÇIK sitede ifşa etmeden, tüm
 * kullanıcılara "dahili yapay zeka" sağlamak. Anahtar yalnızca burada,
 * gizli ortam değişkeni (secret) olarak durur: GEMINI_API_KEY.
 *
 * Site, generateContent gövdesini ({contents, generationConfig}) bu Worker'a
 * POST eder; Worker anahtarı ekleyip Google'a iletir ve yanıtı CORS ile döner.
 *
 * Kurulum: infra/ai-proxy/README.md
 */

const MODEL = 'gemini-2.0-flash';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Yalnızca POST destekleniyor.' }, 405);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Sunucuda GEMINI_API_KEY tanımlı değil.' }, 500);
    }

    const body = await request.text();
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent` +
      `?key=${env.GEMINI_API_KEY}`;

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
