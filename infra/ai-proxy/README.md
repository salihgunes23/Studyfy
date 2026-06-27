# Studfy AI Proxy (Cloudflare Worker)

Bu Worker, Gemini API anahtarını **gizli** tutarak siteye "herkeste çalışan dahili
yapay zeka" kazandırır. Kullanıcılar **anahtar girmez**; site bu Worker'ı çağırır,
Worker anahtarı ekleyip Google'a iletir.

> ⚠️ Anahtarı asla koda yazma, repoya commit etme. Yalnızca Worker'a **secret**
> olarak gir. Sızan anahtar Google tarafından otomatik iptal edilir.

## A) Panelden kurulum (CLI gerekmez — önerilen)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Create Worker**.
2. Bir ad ver (örn. `studfy-ai`) → **Deploy** (varsayılan kodla).
3. **Edit code** → açılan editöre `worker.js` içeriğini **olduğu gibi** yapıştır → **Deploy**.
4. Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Name: `GEMINI_API_KEY`
   - Value: Google AI Studio'dan aldığın anahtar (https://aistudio.google.com/app/apikey — `AIza...` ile başlar)
   - **Encrypt** (secret) seçeneğini işaretle → kaydet.
5. Worker'ın adresini kopyala (örn. `https://studfy-ai.<hesabın>.workers.dev`).

## B) Siteye bağla

Worker adresini siteye tanıt; iki yol var:

- **Repo değişkeni (kolay):** GitHub → repo **Settings → Secrets and variables → Actions →
  Variables → New repository variable**:
  - Name: `AI_PROXY_URL`
  - Value: Worker adresin
  Sonra `main`'e herhangi bir push (ya da Actions'tan "Deploy site" → Re-run) → site
  artık anahtarsız çalışır.

- **Ya da** adresi bana ver; ben workflow'a gömüp push edeyim.

## Test
```bash
curl -X POST https://studfy-ai.<hesabın>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"merhaba"}]}]}'
```
JSON yanıt geliyorsa hazır.

## Notlar
- Ücretsiz Cloudflare planı günde 100.000 istek verir — okul/sınıf kullanımı için fazlasıyla yeter.
- Tek bir Google anahtarını paylaştığın için Google'ın ücretsiz kotası tüm kullanıcılar
  arasında ortaktır. Yoğun kullanımda kota için Google tarafında faturalandırma açabilirsin.
- Güvenlik: `Access-Control-Allow-Origin` `*`'tır. İstersen yalnızca kendi site adresine
  kısıtlayabilirsin (worker.js içindeki CORS sabitinde).
