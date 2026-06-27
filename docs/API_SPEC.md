# Studfy API Spec

> **Sürüm:** v1 · **Durum:** Draft (implementable) · **Son güncelleme:** 2026-06-27
>
> Studfy, AI-native bir öğrenme işletim sistemidir (learning OS). Ücretsiz, kullanıcı başına şifreli izole workspace'ler ve zero-hallucination RAG sunar.
>
> Bu doküman; Next.js 15 BFF (tRPC + public REST), NestJS Core API (Node 22), FastAPI AI service arasındaki tüm sözleşmeleri (contract) tanımlar. Backend ekibi bu dokümandan birebir implementasyon yapabilmelidir.

---

## İçindekiler

1. [API Tasarım İlkeleri](#1-api-tasarım-i̇lkeleri)
2. [Kimlik Doğrulama & Yetkilendirme](#2-kimlik-doğrulama--yetkilendirme)
3. [tRPC Router Haritası](#3-trpc-router-haritası)
4. [Public REST Endpoints](#4-public-rest-endpoints)
5. [Streaming Endpoints (SSE & WebSocket)](#5-streaming-endpoints-sse--websocket)
6. [Webhooks (internal)](#6-webhooks-internal)
7. [Hata Kodları Kataloğu](#7-hata-kodları-kataloğu)
8. [Rate Limits & Quotas](#8-rate-limits--quotas)
9. [OpenAPI Notu](#9-openapi-notu)

---

## Mimari Özet

```
┌──────────────┐   tRPC (RSC/Client)    ┌────────────────────────┐
│  Web / Mobile│ ─────────────────────► │  Next.js 15 BFF        │
│   (browser)  │   REST (public)        │  - tRPC routers        │
└──────────────┘ ─────────────────────► │  - /v1 REST proxy      │
                                        │  - Auth.js / Lucia     │
                                        └───────────┬────────────┘
                                                    │ internal REST (bearer S2S)
                                                    ▼
                                        ┌────────────────────────┐
                                        │  Core API (NestJS / 22)│
                                        │  PG16 + pgvector       │
                                        │  Redis / BullMQ        │
                                        │  R2 / S3               │
                                        └─────┬──────────────┬───┘
                          jobs (BullMQ)       │              │ webhooks (callback)
                                              ▼              ▲
                                        ┌────────────────────────┐
                                        │  AI Service (FastAPI)  │
                                        │  Claude via LiteLLM    │
                                        │  Qdrant / embeddings   │
                                        │  TTS / transcription   │
                                        └────────────────────────┘
```

**Sözleşme yüzeyleri:**

| Yüzey | Protokol | Tüketici | Auth |
|---|---|---|---|
| tRPC routers | tRPC over HTTP (batch) | First-party web/mobile | Session cookie |
| Public REST `/v1` | REST + JSON / problem+json | 3rd-party, mobil native, tus upload | API key (Bearer) veya session |
| Internal REST | REST | Core ↔ AI service | S2S Bearer (mTLS opsiyonel) |
| Streaming | SSE + WebSocket | First-party | Session cookie / ticket |
| Webhooks | REST callback | AI service → Core | HMAC imza |

---

## 1. API Tasarım İlkeleri

### 1.1 REST vs tRPC Ayrımı

| Kriter | tRPC | Public REST `/v1` |
|---|---|---|
| Hedef | First-party Next.js client + RSC | 3rd-party entegrasyon, mobil native, otomasyon |
| Tipleme | Uçtan uca TS inference (Zod) | OpenAPI 3.1 şeması |
| Versiyonlama | Deploy-coupled (monorepo) | URL path `/v1` |
| Auth | Session cookie | API key (Bearer) |
| Use-case | UI etkileşimleri, optimistic updates | Resumable upload, batch export, webhook tüketimi |

**Kural:** Aynı domain mantığı iki kez yazılmaz. tRPC procedure'leri ve REST handler'ları ortak **NestJS service** katmanını çağırır. tRPC = ince adapter, REST = ince adapter.

### 1.2 Versiyonlama

- Public REST: URL prefix `/v1`. Breaking change → `/v2`. Eski sürüm min. 6 ay deprecation penceresiyle yaşar.
- Deprecation sinyali: `Deprecation: true` ve `Sunset: <HTTP-date>` response header'ları.
- tRPC: monorepo içinde sürümlenmez; client ve server birlikte deploy edilir.

### 1.3 Hata Modeli — RFC 7807 (`application/problem+json`)

Tüm REST hataları aşağıdaki gövdeyi döner:

```json
{
  "type": "https://studfy.app/errors/quota-exceeded",
  "title": "Yükleme kotası aşıldı",
  "status": 429,
  "detail": "Aylık 500 MB yükleme limitine ulaştınız.",
  "instance": "/v1/files/upload",
  "code": "QUOTA_EXCEEDED",
  "traceId": "01HYB2K3M4N5P6Q7R8S9T0V1W2",
  "errors": [
    { "field": "file.size", "message": "Maksimum 50 MB" }
  ]
}
```

- `code`: makine-okunur sabit (bkz. [§7](#7-hata-kodları-kataloğu)).
- `traceId`: OpenTelemetry trace ile birebir; destek talebinde paylaşılır.
- `errors[]`: alan-bazlı doğrulama hataları (Zod `flatten()` çıktısıyla uyumlu).
- tRPC tarafında bu yapı `TRPCError.cause` içine `{ code, traceId, errors }` olarak gömülür; client `errorFormatter` ile aynı şekli çıkarır.

### 1.4 Pagination — Cursor-based

Liste endpoint'leri **opaque cursor** kullanır (offset YOK). Cursor = base64url(`{ "k": <sortKey>, "id": <ulid> }`).

İstek:
```
GET /v1/files?limit=20&cursor=eyJrIjoiMjAyNi0wNi0yN1QxMDowMCIsImlkIjoiMDFIWS4uLiJ9
```

Yanıt:
```json
{
  "data": [ /* ... */ ],
  "pageInfo": {
    "nextCursor": "eyJrIjoiMjAy...",
    "hasNextPage": true,
    "limit": 20
  }
}
```

- `limit` default 20, max 100.
- Sıralama deterministiktir: `(created_at DESC, id DESC)`. Cursor bu bileşik anahtarı kodlar.
- tRPC `list` procedure'leri TanStack Query `useInfiniteQuery` ile uyumlu (`getNextPageParam → pageInfo.nextCursor`).

### 1.5 Idempotency Keys

Yazma (POST/non-idempotent) istekleri `Idempotency-Key` header'ı kabul eder (UUID/ULID, client üretir).

```
POST /v1/quizzes
Idempotency-Key: 01HYB2K3M4N5P6Q7R8S9T0V1W2
```

- İlk istek işlenir, sonuç + status code Redis'te `idem:{userId}:{key}` altında **24 saat** saklanır.
- Aynı key ile tekrar gelen istek kaydedilmiş yanıtı döner (yan etki tekrarlanmaz).
- Aynı key + farklı request body → `422 IDEMPOTENCY_KEY_REUSED`.
- Upload (tus) protokol seviyesinde zaten idempotent; ek key gerekmez.

### 1.6 Rate Limiting Headers

Tüm yanıtlarda (sliding-window, Redis):

```
RateLimit-Limit: 120
RateLimit-Remaining: 117
RateLimit-Reset: 43            # saniye cinsinden, pencere sıfırlanmasına kalan
Retry-After: 43               # yalnız 429'da
```

Header formatı IETF `draft-ietf-httpapi-ratelimit-headers` ile uyumludur. Kotalar [§8](#8-rate-limits--quotas).

### 1.7 Genel Konvansiyonlar

- ID'ler: **ULID** (sıralanabilir), JSON'da string.
- Zaman: ISO 8601 UTC (`2026-06-27T10:00:00.000Z`).
- Para/sayısal skor: number; FSRS `stability`/`difficulty` float.
- İçerik tipi: `application/json; charset=utf-8` (hata hariç).
- Tüm timestamp alanları: `createdAt`, `updatedAt`.
- Soft-delete: `deletedAt` (null = aktif).

---

## 2. Kimlik Doğrulama & Yetkilendirme

Auth katmanı **Auth.js (NextAuth) / Lucia** üzerinde kuruludur. Üç birinci-taraf yöntem + servis-arası bearer.

### 2.1 Passkey / WebAuthn Flow

**Kayıt (Registration):**

```
1. POST /v1/auth/webauthn/register/options
   → server: PublicKeyCredentialCreationOptions (challenge Redis'te 5 dk TTL)
2. navigator.credentials.create(options)  (tarayıcı)
3. POST /v1/auth/webauthn/register/verify  { attestationResponse }
   → server: attestation doğrula, credential_id + public_key kaydet
   → Set-Cookie: studfy_session=...
```

**Giriş (Authentication):**

```
1. POST /v1/auth/webauthn/login/options    { email? }   # usernameless destekli
   → PublicKeyCredentialRequestOptions
2. navigator.credentials.get(options)
3. POST /v1/auth/webauthn/login/verify     { assertionResponse }
   → counter doğrula, session aç → Set-Cookie
```

İstek/yanıt iskeleti:

```jsonc
// POST /v1/auth/webauthn/login/verify
{
  "assertionResponse": {
    "id": "AAII...",
    "rawId": "AAII...",
    "type": "public-key",
    "response": {
      "authenticatorData": "...",
      "clientDataJSON": "...",
      "signature": "...",
      "userHandle": "..."
    }
  }
}
```

### 2.2 Session Cookies

```
Set-Cookie: studfy_session=<opaque>; HttpOnly; Secure; SameSite=Lax;
            Path=/; Max-Age=2592000
```

- Opaque session token; sunucu tarafı (Redis) lookup. JWT değildir → anında revoke edilebilir.
- Rotating: her 24 saatte token rotasyonu (sliding 30 gün).
- CSRF: state-changing tRPC/REST için double-submit token (`x-csrf-token`) **veya** `Origin`/`Sec-Fetch-Site` kontrolü.

### 2.3 OAuth

```
GET  /v1/auth/oauth/:provider/start     # provider: google | apple | github
  → 302 provider authorize URL (state + PKCE Redis'te)
GET  /v1/auth/oauth/:provider/callback?code=...&state=...
  → kod takası, kullanıcı upsert (email eşleşmesi), session, 302 app'e
```

### 2.4 Email Magic Link

```
POST /v1/auth/magic-link            { "email": "a@b.com" }
  → 202; tek-kullanımlık token (15 dk TTL) e-posta ile gönderilir
GET  /v1/auth/magic-link/verify?token=...
  → session aç, 302 /app
```

Yanıt her zaman `202` (e-posta enumeration'a karşı; var/yok ayrımı sızdırılmaz).

### 2.5 Service-to-Service (Bearer)

Core API ↔ AI service ve webhook çağrıları:

```
Authorization: Bearer <service_token>
X-Studfy-Service: ai-service
```

- Token'lar KMS/secret manager'dan; kısa ömürlü (1 saat), rotasyonlu.
- Webhook'larda ek olarak HMAC imza (bkz. [§6](#6-webhooks-internal)).
- mTLS opsiyonel (özel ağ içinde).

### 2.6 RBAC Scopes

Birinci-taraf kullanıcı = tek workspace sahibi (per-user izolasyon). API key'ler scope taşır:

| Scope | Anlam |
|---|---|
| `files:read` | Dosya & içerik okuma |
| `files:write` | Upload, silme |
| `content:read` | 3-katman içerik, transcript |
| `chat:write` | RAG chat oturumu açma/mesaj |
| `quiz:read` / `quiz:write` | Quiz okuma / üretim & attempt |
| `flashcard:write` | FSRS review |
| `search:read` | Hibrit arama |
| `library:read` / `library:write` | Global library arama / paylaşım |
| `analytics:read` | Analitik & coach |

**İzolasyon kuralı:** Her sorgu `workspace_id = current_user.workspace_id` ile filtrelenir (row-level + uygulama katmanı). Workspace'ler kullanıcı başına şifreli; cross-workspace erişim mümkün değildir. `library` paylaşımı tek istisna olup yalnızca açıkça paylaşılan (`library_items`) kayıtları görünür kılar.

---

## 3. tRPC Router Haritası

Kök router (`appRouter`) aşağıdaki alt router'ları birleştirir. İmzalar TypeScript + Zod taslağıdır. Tüm `protectedProcedure`'ler `ctx.session.user` ve `ctx.workspaceId` enjekte eder.

```ts
export const appRouter = router({
  auth:      authRouter,
  workspace: workspaceRouter,
  folder:    folderRouter,
  file:      fileRouter,
  ingestion: ingestionRouter,
  content:   contentRouter,
  chat:      chatRouter,
  search:    searchRouter,
  quiz:      quizRouter,
  flashcard: flashcardRouter,
  analytics: analyticsRouter,
  coach:     coachRouter,
  library:   libraryRouter,
});
export type AppRouter = typeof appRouter;
```

Ortak şemalar:

```ts
const Cursor = z.string().optional();
const Page = <T extends z.ZodTypeAny>(item: T) => z.object({
  data: z.array(item),
  pageInfo: z.object({
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
    limit: z.number(),
  }),
});
const ULID = z.string().length(26);
```

### 3.1 `auth`

```ts
authRouter = router({
  // WebAuthn options/verify REST tarafında; tRPC yalnız session-bound işlemler
  me: protectedProcedure
    .query(): User,

  listSessions: protectedProcedure
    .query(): Array<{ id: ULID; device: string; lastSeenAt: Date; current: boolean }>,

  revokeSession: protectedProcedure
    .input(z.object({ sessionId: ULID }))
    .mutation(): { ok: true },

  listPasskeys: protectedProcedure
    .query(): Array<{ id: ULID; label: string; createdAt: Date; lastUsedAt: Date | null }>,

  renamePasskey: protectedProcedure
    .input(z.object({ id: ULID, label: z.string().min(1).max(64) }))
    .mutation(): { ok: true },

  deletePasskey: protectedProcedure
    .input(z.object({ id: ULID }))
    .mutation(): { ok: true },

  logout: protectedProcedure.mutation(): { ok: true },
});
```

### 3.2 `workspace`

```ts
workspaceRouter = router({
  get: protectedProcedure
    .query(): {
      id: ULID; name: string;
      storageUsedBytes: number; storageQuotaBytes: number;
      encryption: { enabled: true; algo: "AES-256-GCM" };
      createdAt: Date;
    },

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(120) }))
    .mutation(): Workspace,

  usage: protectedProcedure
    .query(): {
      storageUsedBytes: number; storageQuotaBytes: number;
      filesCount: number; tokensThisMonth: number; quizGenThisMonth: number;
    },

  export: protectedProcedure // tüm workspace'i async export (R2 imzalı URL)
    .mutation(): { jobId: ULID; status: "queued" },
});
```

### 3.3 `folder`

```ts
folderRouter = router({
  list: protectedProcedure
    .input(z.object({ parentId: ULID.nullable().optional(), cursor: Cursor, limit: z.number().max(100).default(50) }))
    .query(): Page<Folder>,

  tree: protectedProcedure // tam ağaç (sidebar için)
    .query(): Array<Folder & { children: ULID[] }>,

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(120), parentId: ULID.nullable() }))
    .mutation(): Folder,

  rename: protectedProcedure
    .input(z.object({ id: ULID, name: z.string().min(1).max(120) }))
    .mutation(): Folder,

  move: protectedProcedure
    .input(z.object({ id: ULID, parentId: ULID.nullable() }))
    .mutation(): Folder,

  delete: protectedProcedure
    .input(z.object({ id: ULID, recursive: z.boolean().default(false) }))
    .mutation(): { ok: true; deletedFiles: number },
});
```

### 3.4 `file`

```ts
type FileStatus =
  | "uploading" | "uploaded" | "queued"
  | "ingesting" | "ready" | "failed";

fileRouter = router({
  // Resumable upload için ticket → REST tus endpoint'ine yönlendirir
  createUpload: protectedProcedure
    .input(z.object({
      folderId: ULID.nullable(),
      filename: z.string(),
      sizeBytes: z.number().int().positive(),
      mimeType: z.string(),
    }))
    .mutation(): {
      fileId: ULID;
      uploadUrl: string;          // tus creation URL (+ token)
      uploadToken: string;        // tek-kullanımlık
      maxSizeBytes: number;
    },

  list: protectedProcedure
    .input(z.object({
      folderId: ULID.nullable().optional(),
      status: z.enum(["all","ready","ingesting","failed"]).default("all"),
      cursor: Cursor, limit: z.number().max(100).default(20),
    }))
    .query(): Page<FileMeta>,

  get: protectedProcedure
    .input(z.object({ id: ULID }))
    .query(): FileMeta & { downloadUrl: string /* imzalı, 5 dk */ },

  status: protectedProcedure  // hafif polling (SSE alternatifi)
    .input(z.object({ id: ULID }))
    .query(): { id: ULID; status: FileStatus; progress: number; error?: string },

  rename: protectedProcedure
    .input(z.object({ id: ULID, filename: z.string().min(1) }))
    .mutation(): FileMeta,

  move: protectedProcedure
    .input(z.object({ id: ULID, folderId: ULID.nullable() }))
    .mutation(): FileMeta,

  delete: protectedProcedure
    .input(z.object({ id: ULID }))
    .mutation(): { ok: true },
});
```

### 3.5 `ingestion`

```ts
ingestionRouter = router({
  // Upload tamamlandıktan sonra pipeline'ı tetikler (idempotent)
  start: protectedProcedure
    .input(z.object({ fileId: ULID, force: z.boolean().default(false) }))
    .mutation(): { jobId: ULID; status: "queued" },

  status: protectedProcedure
    .input(z.object({ fileId: ULID }))
    .query(): {
      fileId: ULID;
      stage: "extract" | "chunk" | "embed" | "classify" | "link" | "done" | "failed";
      progress: number;            // 0..1
      chunks: number;
      transcript: boolean;         // ses/video ise
      error?: string;
    },

  retry: protectedProcedure
    .input(z.object({ fileId: ULID }))
    .mutation(): { jobId: ULID; status: "queued" },
});
```

### 3.6 `content` (3 katman + TTS/podcast)

```ts
type ContentLayer = "quick_glance" | "academic" | "analogy";

contentRouter = router({
  get: protectedProcedure
    .input(z.object({ fileId: ULID, layer: z.enum(["quick_glance","academic","analogy"]) }))
    .query(): {
      id: ULID; fileId: ULID; layer: ContentLayer;
      markdown: string;
      citations: Array<{ chunkId: ULID; page?: number; quote: string }>;
      generatedAt: Date; model: string;
    },

  generate: protectedProcedure // belirli katmanı (yeniden) üret
    .input(z.object({ fileId: ULID, layer: z.enum(["quick_glance","academic","analogy"]), force: z.boolean().default(false) }))
    .mutation(): { jobId: ULID; status: "queued" },

  links: protectedProcedure // classification+linking sonucu ilişkili dosyalar
    .input(z.object({ fileId: ULID }))
    .query(): Array<{ targetFileId: ULID; relation: string; score: number }>,

  // TTS / podcast
  tts: protectedProcedure
    .input(z.object({ fileId: ULID, layer: z.enum(["quick_glance","academic","analogy"]), voice: z.string().default("tr-default") }))
    .mutation(): { jobId: ULID; status: "queued" },

  podcast: protectedProcedure // çok-sesli özet podcast üretimi
    .input(z.object({ fileId: ULID, style: z.enum(["dialogue","monologue"]).default("dialogue") }))
    .mutation(): { jobId: ULID; status: "queued" },

  audioStatus: protectedProcedure
    .input(z.object({ jobId: ULID }))
    .query(): { status: "queued"|"processing"|"ready"|"failed"; audioUrl?: string; durationSec?: number },
});
```

### 3.7 `chat` (RAG, streaming)

Token streaming SSE üzerinden ([§5](#5-streaming-endpoints-sse--websocket)); tRPC oturum/mesaj yönetimini sağlar.

```ts
chatRouter = router({
  createSession: protectedProcedure
    .input(z.object({ scope: z.object({
      fileIds: z.array(ULID).optional(),
      folderId: ULID.optional(),
      wholeWorkspace: z.boolean().default(false),
    }), title: z.string().optional() }))
    .mutation(): { sessionId: ULID; title: string },

  listSessions: protectedProcedure
    .input(z.object({ cursor: Cursor, limit: z.number().max(50).default(20) }))
    .query(): Page<{ id: ULID; title: string; lastMessageAt: Date }>,

  getMessages: protectedProcedure
    .input(z.object({ sessionId: ULID, cursor: Cursor, limit: z.number().max(100).default(50) }))
    .query(): Page<{
      id: ULID; role: "user"|"assistant"; content: string;
      citations: Array<{ fileId: ULID; chunkId: ULID; quote: string; page?: number }>;
      createdAt: Date;
    }>,

  // Mesaj gönderir; gerçek token akışı GET /v1/chat/stream (SSE) ile alınır.
  // Bu mutation user mesajını persist eder ve streamId döner.
  sendMessage: protectedProcedure
    .input(z.object({ sessionId: ULID, content: z.string().min(1).max(8000) }))
    .mutation(): { messageId: ULID; streamId: ULID; streamUrl: string },

  // Zero-hallucination: yetersiz kaynak varsa assistant "bilmiyorum" + abstain=true döner
  stop: protectedProcedure
    .input(z.object({ streamId: ULID }))
    .mutation(): { ok: true },

  renameSession: protectedProcedure
    .input(z.object({ sessionId: ULID, title: z.string().min(1).max(120) }))
    .mutation(): { ok: true },

  deleteSession: protectedProcedure
    .input(z.object({ sessionId: ULID }))
    .mutation(): { ok: true },
});
```

### 3.8 `search` (hibrit)

```ts
searchRouter = router({
  // Hibrit: BM25 (lexical) + pgvector/Qdrant (semantic) + RRF rerank
  query: protectedProcedure
    .input(z.object({
      q: z.string().min(1).max(512),
      mode: z.enum(["hybrid","semantic","lexical"]).default("hybrid"),
      scope: z.object({ fileIds: z.array(ULID).optional(), folderId: ULID.optional() }).optional(),
      filters: z.object({
        mimeType: z.array(z.string()).optional(),
        layer: z.enum(["quick_glance","academic","analogy"]).optional(),
      }).optional(),
      limit: z.number().max(50).default(20),
      cursor: Cursor,
    }))
    .query(): Page<{
      chunkId: ULID; fileId: ULID; filename: string;
      snippet: string; score: number; page?: number;
      highlights: Array<[number, number]>;
    }>,

  suggest: protectedProcedure // autocomplete
    .input(z.object({ prefix: z.string().min(1).max(64) }))
    .query(): Array<{ text: string; type: "query"|"file"|"topic" }>,
});
```

### 3.9 `quiz` (grounded)

```ts
quizRouter = router({
  // Yalnız kaynak chunk'lara dayalı (grounded) soru üretimi
  generate: protectedProcedure
    .input(z.object({
      source: z.object({ fileIds: z.array(ULID).optional(), folderId: ULID.optional() }),
      count: z.number().int().min(1).max(50).default(10),
      types: z.array(z.enum(["mcq","true_false","short_answer","cloze"])).default(["mcq"]),
      difficulty: z.enum(["easy","medium","hard","mixed"]).default("mixed"),
    }))
    .mutation(): { quizId: ULID; jobId: ULID; status: "queued" },

  get: protectedProcedure
    .input(z.object({ quizId: ULID }))
    .query(): {
      id: ULID; title: string; status: "generating"|"ready"|"failed";
      questions: Array<{
        id: ULID; type: string; prompt: string;
        options?: Array<{ id: string; text: string }>;
        sourceChunkIds: ULID[];   // grounding kanıtı
      }>;
    },

  list: protectedProcedure
    .input(z.object({ cursor: Cursor, limit: z.number().max(50).default(20) }))
    .query(): Page<{ id: ULID; title: string; questionCount: number; createdAt: Date }>,

  startAttempt: protectedProcedure
    .input(z.object({ quizId: ULID }))
    .mutation(): { attemptId: ULID; startedAt: Date },

  submitAnswer: protectedProcedure
    .input(z.object({ attemptId: ULID, questionId: ULID, answer: z.union([z.string(), z.array(z.string())]) }))
    .mutation(): { correct: boolean; explanation: string; sourceChunkIds: ULID[] },

  finishAttempt: protectedProcedure
    .input(z.object({ attemptId: ULID }))
    .mutation(): {
      attemptId: ULID; score: number; total: number; correct: number;
      durationSec: number;
      breakdown: Array<{ questionId: ULID; correct: boolean }>;
    },

  result: protectedProcedure
    .input(z.object({ attemptId: ULID }))
    .query(): QuizAttemptResult,
});
```

### 3.10 `flashcard` (FSRS)

```ts
type Rating = 1 | 2 | 3 | 4; // again | hard | good | easy (FSRS)

flashcardRouter = router({
  // Quiz/içerikten otomatik veya manuel kart üretimi
  createFromFile: protectedProcedure
    .input(z.object({ fileId: ULID, count: z.number().max(50).default(20) }))
    .mutation(): { jobId: ULID; status: "queued" },

  create: protectedProcedure
    .input(z.object({ front: z.string().min(1), back: z.string().min(1), fileId: ULID.optional() }))
    .mutation(): Flashcard,

  dueQueue: protectedProcedure // bugün tekrar edilecekler (FSRS scheduling)
    .input(z.object({ limit: z.number().max(100).default(50) }))
    .query(): Array<{
      id: ULID; front: string; back: string;
      due: Date; stability: number; difficulty: number; reps: number; state: "new"|"learning"|"review"|"relearning";
    }>,

  review: protectedProcedure // FSRS update + review_log
    .input(z.object({ flashcardId: ULID, rating: z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4)]), elapsedMs: z.number() }))
    .mutation(): {
      flashcardId: ULID; nextDue: Date;
      stability: number; difficulty: number; interval: number; state: string;
    },

  stats: protectedProcedure
    .query(): { dueToday: number; newToday: number; reviewedToday: number; retention30d: number; streakDays: number },

  delete: protectedProcedure
    .input(z.object({ id: ULID }))
    .mutation(): { ok: true },
});
```

### 3.11 `analytics`

```ts
analyticsRouter = router({
  // analytics_events tüketicisi; UI dashboard'ları besler
  overview: protectedProcedure
    .input(z.object({ range: z.enum(["7d","30d","90d"]).default("30d") }))
    .query(): {
      studyMinutes: number; filesIngested: number;
      quizzesTaken: number; avgQuizScore: number;
      flashcardRetention: number;
      activeDays: number; streakDays: number;
    },

  timeseries: protectedProcedure
    .input(z.object({ metric: z.enum(["study_minutes","quiz_score","reviews","retention"]), range: z.enum(["7d","30d","90d"]).default("30d") }))
    .query(): Array<{ date: string; value: number }>,

  topics: protectedProcedure // zayıf/güçlü konular
    .query(): Array<{ topic: string; mastery: number; trend: "up"|"down"|"flat" }>,

  track: protectedProcedure // client-side event ingest (best-effort)
    .input(z.object({ event: z.string(), props: z.record(z.any()).optional() }))
    .mutation(): { ok: true },
});
```

### 3.12 `coach`

```ts
coachRouter = router({
  // Analitiğe dayalı AI çalışma koçu (grounded öneriler)
  plan: protectedProcedure
    .input(z.object({ goal: z.string().optional(), horizonDays: z.number().max(90).default(7) }))
    .query(): {
      summary: string;
      recommendations: Array<{
        type: "review"|"quiz"|"read"|"break";
        title: string; reason: string;
        targetFileId?: ULID; estimatedMinutes: number;
      }>;
      focusTopics: string[];
    },

  nextAction: protectedProcedure // "şimdi ne çalışayım?" tek öneri
    .query(): { action: string; targetFileId?: ULID; reason: string; estimatedMinutes: number },

  feedback: protectedProcedure // öneri yararlı mıydı (bandit sinyali)
    .input(z.object({ recommendationId: ULID, helpful: z.boolean() }))
    .mutation(): { ok: true },
});
```

### 3.13 `library` (global, share/search/import)

```ts
libraryRouter = router({
  // Kullanıcı kendi içeriğini global kütüphaneye paylaşır (opt-in)
  share: protectedProcedure
    .input(z.object({
      fileId: ULID,
      visibility: z.enum(["public","unlisted"]).default("public"),
      title: z.string().min(1).max(160),
      tags: z.array(z.string()).max(10),
      license: z.enum(["cc-by","cc-by-sa","cc0"]).default("cc-by"),
    }))
    .mutation(): { libraryItemId: ULID; slug: string; url: string },

  unshare: protectedProcedure
    .input(z.object({ libraryItemId: ULID }))
    .mutation(): { ok: true },

  search: protectedProcedure // global library hibrit arama
    .input(z.object({
      q: z.string().min(1).max(256),
      tags: z.array(z.string()).optional(),
      sort: z.enum(["relevance","popular","recent"]).default("relevance"),
      cursor: Cursor, limit: z.number().max(50).default(20),
    }))
    .query(): Page<{
      libraryItemId: ULID; slug: string; title: string;
      tags: string[]; importsCount: number; ownerHandle: string;
      snippet: string; score: number;
    }>,

  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(): LibraryItemDetail,

  // Global item'i kendi workspace'ine kopyalar (yeni file + chunks)
  import: protectedProcedure
    .input(z.object({ libraryItemId: ULID, folderId: ULID.nullable() }))
    .mutation(): { fileId: ULID; jobId: ULID; status: "queued" },
});
```

> **Toplam tRPC procedure sayısı:** 78 (auth 7, workspace 4, folder 6, file 8, ingestion 3, content 7, chat 7, search 2, quiz 8, flashcard 7, analytics 4, coach 3, library 5 + REST-only auth helper'ları hariç). Bkz. son satır.

---

## 4. Public REST Endpoints

Base URL: `https://api.studfy.app/v1`. Auth: `Authorization: Bearer <api_key>` veya birinci-taraf session cookie. Tüm hatalar `application/problem+json`.

### 4.1 Endpoint Tablosu

| METHOD | Path | Auth (scope) | Açıklama | Request | Response | Status |
|---|---|---|---|---|---|---|
| POST | `/v1/uploads` | `files:write` | tus creation — resumable upload başlat | `Upload-Length`, `Upload-Metadata` header | `Location: /v1/uploads/{id}` | 201, 400, 413 |
| HEAD | `/v1/uploads/{id}` | `files:write` | Yüklenen offset'i sorgula (resume) | — | `Upload-Offset` header | 200, 404 |
| PATCH | `/v1/uploads/{id}` | `files:write` | Chunk yükle | binary body, `Upload-Offset`, `Content-Type: application/offset+octet-stream` | `Upload-Offset` | 204, 409, 404 |
| DELETE | `/v1/uploads/{id}` | `files:write` | Yüklemeyi iptal et | — | — | 204, 404 |
| GET | `/v1/files` | `files:read` | Dosya listesi (cursor) | query: `folderId,status,cursor,limit` | `{data,pageInfo}` | 200 |
| GET | `/v1/files/{id}` | `files:read` | Dosya meta + imzalı indirme | — | `FileMeta` | 200, 404 |
| GET | `/v1/files/{id}/status` | `files:read` | Ingestion durumu | — | `{status,progress}` | 200, 404 |
| DELETE | `/v1/files/{id}` | `files:write` | Dosyayı sil | — | — | 204, 404 |
| GET | `/v1/files/{id}/content/{layer}` | `content:read` | 3-katman içerik | `layer` path | `{markdown,citations}` | 200, 404, 409 |
| POST | `/v1/search` | `search:read` | Hibrit arama | `SearchBody` | `{data,pageInfo}` | 200, 400 |
| POST | `/v1/quizzes` | `quiz:write` | Quiz üret (async) | `QuizGenBody` | `{quizId,jobId}` | 202, 400, 429 |
| GET | `/v1/quizzes/{id}` | `quiz:read` | Quiz al | — | `Quiz` | 200, 404 |
| POST | `/v1/quizzes/{id}/attempts` | `quiz:write` | Attempt başlat | — | `{attemptId}` | 201, 404 |
| POST | `/v1/attempts/{id}/finish` | `quiz:write` | Attempt bitir + skor | `AnswersBody` | `QuizResult` | 200, 404, 409 |
| POST | `/v1/flashcards/{id}/review` | `flashcard:write` | FSRS review | `{rating,elapsedMs}` | `{nextDue,stability}` | 200, 404 |
| GET | `/v1/library/search` | `library:read` | Global library arama | query | `{data,pageInfo}` | 200 |
| GET | `/v1/library/{slug}` | `library:read` | Library item detayı | — | `LibraryItemDetail` | 200, 404 |
| POST | `/v1/library` | `library:write` | Item paylaş | `ShareBody` | `{libraryItemId,slug}` | 201, 400 |
| POST | `/v1/library/{id}/import` | `library:write` | Item'i import et | `{folderId}` | `{fileId,jobId}` | 202, 404 |

### 4.2 Örnek — Resumable Upload (tus)

```http
POST /v1/uploads HTTP/1.1
Host: api.studfy.app
Authorization: Bearer sk_live_...
Tus-Resumable: 1.0.0
Upload-Length: 5242880
Upload-Metadata: filename ZGVyc19vemV0LnBkZg==,folderId MDFIWUIuLi4=,mimeType YXBwbGljYXRpb24vcGRm
```
```http
HTTP/1.1 201 Created
Tus-Resumable: 1.0.0
Location: /v1/uploads/01HYB2K3M4N5P6Q7R8S9T0V1W2
Upload-Expires: 2026-06-28T10:00:00.000Z
```
Chunk yükleme:
```http
PATCH /v1/uploads/01HYB2K3M4N5P6Q7R8S9T0V1W2 HTTP/1.1
Tus-Resumable: 1.0.0
Content-Type: application/offset+octet-stream
Upload-Offset: 0
Content-Length: 1048576

<binary>
```
```http
HTTP/1.1 204 No Content
Tus-Resumable: 1.0.0
Upload-Offset: 1048576
```
Tüm chunk'lar tamamlanınca Core API otomatik `ingestion.start` tetikler; durum SSE/WS ile izlenir.

### 4.3 Örnek — Hibrit Arama

```http
POST /v1/search HTTP/1.1
Authorization: Bearer sk_live_...
Content-Type: application/json
Idempotency-Key: 01HYB2K3M4N5P6Q7R8S9T0V1W2

{
  "q": "fotosentez ışık reaksiyonları",
  "mode": "hybrid",
  "filters": { "mimeType": ["application/pdf"] },
  "limit": 5
}
```
```json
{
  "data": [
    {
      "chunkId": "01HYC...",
      "fileId": "01HYB...",
      "filename": "biyoloji_ozet.pdf",
      "snippet": "...ışık reaksiyonları tilakoid membranda gerçekleşir...",
      "score": 0.873,
      "page": 12,
      "highlights": [[3, 19]]
    }
  ],
  "pageInfo": { "nextCursor": "eyJrIjoi...", "hasNextPage": true, "limit": 5 }
}
```

### 4.4 Örnek — Quiz Üretimi (async)

```http
POST /v1/quizzes HTTP/1.1
Authorization: Bearer sk_live_...
Idempotency-Key: 01HYB...
Content-Type: application/json

{ "source": { "fileIds": ["01HYB..."] }, "count": 10, "types": ["mcq"], "difficulty": "mixed" }
```
```json
HTTP/1.1 202 Accepted
{ "quizId": "01HYD...", "jobId": "01HYE...", "status": "queued" }
```

### 4.5 Örnek — FSRS Review

```http
POST /v1/flashcards/01HYF.../review HTTP/1.1
Authorization: Bearer sk_live_...
Content-Type: application/json

{ "rating": 3, "elapsedMs": 4200 }
```
```json
{
  "flashcardId": "01HYF...",
  "nextDue": "2026-07-01T10:00:00.000Z",
  "stability": 12.4,
  "difficulty": 5.1,
  "interval": 4,
  "state": "review"
}
```

---

## 5. Streaming Endpoints (SSE & WebSocket)

### 5.1 SSE — Chat Token Streaming

```
GET /v1/chat/stream?streamId={streamId}
Accept: text/event-stream
Cookie: studfy_session=...
```

`chat.sendMessage` mutation'ından dönen `streamId` ile bağlanılır. Event tipleri:

```
event: token
data: {"delta":"Fotosentez "}

event: token
data: {"delta":"ışık reaksiyonları..."}

event: citation
data: {"fileId":"01HYB...","chunkId":"01HYC...","quote":"...","page":12}

event: usage
data: {"inputTokens":1820,"outputTokens":240}

event: done
data: {"messageId":"01HYG...","finishReason":"stop","abstained":false}
```

- **Zero-hallucination:** Yeterli kaynak yoksa `event: done` ile `abstained: true` ve nazik "kaynaklarda bulunamadı" mesajı döner; uydurma yapılmaz.
- Hata: `event: error\ndata: {"code":"AI_UPSTREAM_ERROR","traceId":"..."}`.
- Keep-alive: 15 sn'de bir `: ping` comment.
- Client iptal: bağlantıyı kapat **veya** `chat.stop({ streamId })`.

### 5.2 SSE — Ingestion Status

```
GET /v1/files/{id}/events
Accept: text/event-stream
```
```
event: stage
data: {"stage":"chunk","progress":0.4}

event: stage
data: {"stage":"embed","progress":0.7}

event: ready
data: {"fileId":"01HYB...","chunks":142,"transcript":true}
```

### 5.3 WebSocket — Realtime Event Bus

```
wss://api.studfy.app/v1/ws?ticket={ticket}
```

`ticket`: kısa ömürlü (60 sn) tek-kullanımlık token; `POST /v1/ws/ticket` (session ile) çağrısıyla alınır. Kanal workspace-scoped; yalnız kullanıcının kendi olayları yayınlanır.

İstemci → sunucu:
```json
{ "type": "subscribe", "topics": ["files", "chat", "quiz"] }
```

Sunucu → istemci event kataloğu:

| Event | Payload | Tetikleyen |
|---|---|---|
| `file.status.changed` | `{ fileId, status, progress }` | ingestion pipeline |
| `file.ingested` | `{ fileId, chunks, transcript }` | ingestion.completed webhook |
| `content.ready` | `{ fileId, layer }` | derived_contents üretimi |
| `content.tts.ready` | `{ fileId, layer, audioUrl, durationSec }` | TTS job |
| `content.podcast.ready` | `{ fileId, audioUrl, durationSec }` | podcast job |
| `transcript.ready` | `{ fileId, transcriptId }` | transcription.done webhook |
| `quiz.ready` | `{ quizId, questionCount }` | quiz engine |
| `link.created` | `{ sourceFileId, targetFileId, relation }` | classification+linking |
| `flashcard.due` | `{ dueCount }` | FSRS scheduler (günlük) |
| `coach.nudge` | `{ message, action }` | coach engine |
| `quota.warning` | `{ resource, usedPct }` | quota monitor |
| `error` | `{ code, traceId, message }` | herhangi |

Heartbeat: sunucu 30 sn ping frame; client 60 sn içinde pong göndermezse bağlantı kapatılır.

---

## 6. Webhooks (internal)

AI service (FastAPI) → Core API (NestJS) callback'leri. **Public değildir**; özel ağ + bearer + HMAC.

### 6.1 Güvenlik

```
POST /internal/webhooks/{event}
Authorization: Bearer <service_token>
X-Studfy-Service: ai-service
X-Studfy-Signature: sha256=<hex(hmac_sha256(body, signing_secret))>
X-Studfy-Timestamp: 1782000000
X-Studfy-Delivery: 01HYB...        # idempotency / replay koruması
```

- İmza gövdenin ham byte'ları üzerinden; `timestamp` ±300 sn dışındaysa reddedilir (replay).
- `X-Studfy-Delivery` ULID 24 saat dedupe edilir.
- Retry: AI service exponential backoff (max 5 deneme); Core 2xx dönene kadar.

### 6.2 Event Kataloğu

#### `ingestion.completed`
```json
POST /internal/webhooks/ingestion.completed
{
  "deliveryId": "01HYB...",
  "fileId": "01HYB...",
  "workspaceId": "01HYA...",
  "status": "success",
  "chunks": 142,
  "embeddingModel": "voyage-3",
  "vectorStore": "qdrant",
  "transcript": { "present": true, "transcriptId": "01HYT..." },
  "classification": { "subject": "biyoloji", "topics": ["fotosentez"] },
  "links": [ { "targetFileId": "01HYZ...", "relation": "prerequisite", "score": 0.81 } ],
  "completedAt": "2026-06-27T10:05:00.000Z"
}
```
→ Core: `files.status = ready`, `file_chunks`/`file_links` persist, WS `file.ingested` + `link.created` yayınla. Yanıt `200 { "ok": true }`.

#### `transcription.done`
```json
POST /internal/webhooks/transcription.done
{
  "deliveryId": "01HYB...",
  "fileId": "01HYB...",
  "transcriptId": "01HYT...",
  "language": "tr",
  "durationSec": 1840,
  "segments": [ { "start": 0.0, "end": 4.2, "text": "..." } ],
  "completedAt": "2026-06-27T10:03:00.000Z"
}
```
→ Core: `transcripts` upsert, WS `transcript.ready`. Yanıt `200`.

#### `content.generated`
```json
{ "deliveryId":"01HYB...", "fileId":"01HYB...", "layer":"academic",
  "derivedContentId":"01HYC...", "model":"claude-via-litellm",
  "citations":[{"chunkId":"01HYC...","page":12}], "completedAt":"..." }
```
→ WS `content.ready`.

#### `audio.generated`
```json
{ "deliveryId":"01HYB...", "fileId":"01HYB...", "kind":"podcast|tts",
  "audioKey":"r2://audio/...", "durationSec":312, "completedAt":"..." }
```
→ WS `content.tts.ready` / `content.podcast.ready`.

#### `quiz.generated`
```json
{ "deliveryId":"01HYB...", "quizId":"01HYD...", "questionCount":10,
  "grounded":true, "completedAt":"..." }
```
→ WS `quiz.ready`.

#### `job.failed`
```json
{ "deliveryId":"01HYB...", "jobType":"ingestion|content|quiz|audio",
  "refId":"01HYB...", "code":"AI_EXTRACTION_FAILED", "detail":"...", "failedAt":"..." }
```
→ Core: ilgili kayıt `status=failed`, WS `error`.

---

## 7. Hata Kodları Kataloğu

`code` alanı sabittir; `status` HTTP / tRPC eşleniği. tRPC `code` sütunu `TRPCError` koduna maplenir.

| code | HTTP | tRPC | Açıklama |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | BAD_REQUEST | Zod doğrulama hatası; `errors[]` dolu |
| `UNAUTHENTICATED` | 401 | UNAUTHORIZED | Session/key yok ya da geçersiz |
| `SESSION_EXPIRED` | 401 | UNAUTHORIZED | Session süresi doldu, yeniden giriş |
| `FORBIDDEN` | 403 | FORBIDDEN | Scope yetersiz |
| `WORKSPACE_ISOLATION` | 403 | FORBIDDEN | Cross-workspace erişim denemesi |
| `NOT_FOUND` | 404 | NOT_FOUND | Kaynak yok veya bu workspace'e ait değil |
| `METHOD_NOT_ALLOWED` | 405 | — | — |
| `CONFLICT` | 409 | CONFLICT | Durum çakışması (ör. zaten ingest ediliyor) |
| `UPLOAD_OFFSET_CONFLICT` | 409 | — | tus `Upload-Offset` uyuşmazlığı |
| `CONTENT_NOT_READY` | 409 | PRECONDITION_FAILED | İçerik henüz üretilmedi (ingest sürüyor) |
| `IDEMPOTENCY_KEY_REUSE` | 422 | — | Aynı key farklı body ile |
| `UNPROCESSABLE` | 422 | UNPROCESSABLE_CONTENT | Semantik olarak işlenemez |
| `PAYLOAD_TOO_LARGE` | 413 | — | Dosya / body limit aşıldı |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | — | mimeType desteklenmiyor |
| `QUOTA_EXCEEDED` | 429 | TOO_MANY_REQUESTS | Free-tier kotası (storage/tokens/gen) |
| `RATE_LIMITED` | 429 | TOO_MANY_REQUESTS | Pencere limiti; `Retry-After` |
| `AI_ABSTAINED` | 200 | — | RAG yeterli kaynak bulamadı (hata değil; `abstained:true`) |
| `AI_UPSTREAM_ERROR` | 502 | INTERNAL_SERVER_ERROR | LiteLLM/Claude upstream hatası |
| `AI_EXTRACTION_FAILED` | 500 | INTERNAL_SERVER_ERROR | Metin/transcript çıkarımı başarısız |
| `INGESTION_FAILED` | 500 | INTERNAL_SERVER_ERROR | Pipeline hatası; retry edilebilir |
| `INTERNAL` | 500 | INTERNAL_SERVER_ERROR | Beklenmeyen |
| `SERVICE_UNAVAILABLE` | 503 | INTERNAL_SERVER_ERROR | Bakım / aşırı yük |

---

## 8. Rate Limits & Quotas

Studfy ücretsizdir; "fair-use" politikası uygulanır. Limitler workspace (kullanıcı) bazlıdır.

### 8.1 Request Rate Limits (sliding window)

| Kategori | Limit | Pencere | Kapsam |
|---|---|---|---|
| Genel REST/tRPC | 120 req | 60 sn | per user |
| Auth (login/magic-link) | 10 req | 60 sn | per IP + email |
| Search (`/v1/search`) | 30 req | 60 sn | per user |
| Chat mesaj (`sendMessage`) | 20 req | 60 sn | per user |
| Quiz generate | 10 req | 60 sn | per user |
| Upload creation | 30 req | 60 sn | per user |
| Webhook ingest (S2S) | 1000 req | 60 sn | per service |

Aşımda `429 RATE_LIMITED` + `Retry-After`.

### 8.2 Free-Tier Quotas (fair-use)

| Kaynak | Limit | Periyot | Aşım davranışı |
|---|---|---|---|
| Depolama | 2 GB | toplam | yeni upload `429 QUOTA_EXCEEDED` |
| Dosya sayısı | 500 | toplam | yeni upload reddedilir |
| Tek dosya boyutu | 100 MB | — | `413 PAYLOAD_TOO_LARGE` |
| AI token kullanımı | 2.000.000 token | aylık | chat/quiz/content kısıtlanır |
| Chat mesajı | 500 | aylık | `429 QUOTA_EXCEEDED` |
| Quiz üretimi | 100 quiz | aylık | reddedilir |
| TTS/Podcast | 60 dakika | aylık | reddedilir |
| Library paylaşımı | 50 item | toplam | reddedilir |
| Library import | 200 item | aylık | reddedilir |

- Kota durumu: `workspace.usage` (tRPC) veya `GET /v1/usage`.
- `quota.warning` WS event'i %80'de tetiklenir.
- Soft-throttle: token kotası %100'e yaklaşınca daha küçük model/context'e düşülebilir (graceful degradation), kullanıcıya bildirilir.

---

## 9. OpenAPI Notu

REST yüzeyi (`/v1`) **OpenAPI 3.1** ile dökümante edilir. Şema, NestJS REST controller'larından (`@nestjs/swagger`) ve paylaşılan Zod şemalarından (`zod-to-openapi`) otomatik üretilir; `GET /v1/openapi.json` ve Swagger UI `GET /v1/docs` ile sunulur.

- problem+json hata gövdesi `components/schemas/Problem` olarak tanımlanır; tüm `4xx/5xx` yanıtlar referans verir.
- Cursor pagination `PageInfo` reusable schema'dır.
- tus akışı OpenAPI'da `POST/HEAD/PATCH /v1/uploads` olarak belgelenir; protokol detayı `description`'da link verilir.

Örnek path snippet:

```yaml
openapi: 3.1.0
info:
  title: Studfy Public API
  version: "1.0.0"
servers:
  - url: https://api.studfy.app/v1
paths:
  /search:
    post:
      operationId: searchHybrid
      summary: Hibrit (lexical + semantic) arama
      security:
        - apiKey: []
      parameters:
        - in: header
          name: Idempotency-Key
          schema: { type: string }
          required: false
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/SearchBody" }
      responses:
        "200":
          description: Arama sonuçları (cursor pagination)
          headers:
            RateLimit-Remaining: { schema: { type: integer } }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/SearchResultPage" }
        "400":
          $ref: "#/components/responses/Problem"
        "429":
          $ref: "#/components/responses/Problem"
components:
  securitySchemes:
    apiKey:
      type: http
      scheme: bearer
      bearerFormat: API key
  responses:
    Problem:
      description: RFC 7807 hata
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
  schemas:
    Problem:
      type: object
      required: [type, title, status, code]
      properties:
        type:    { type: string, format: uri }
        title:   { type: string }
        status:  { type: integer }
        detail:  { type: string }
        instance:{ type: string }
        code:    { type: string }
        traceId: { type: string }
        errors:
          type: array
          items:
            type: object
            properties:
              field:   { type: string }
              message: { type: string }
    PageInfo:
      type: object
      properties:
        nextCursor:  { type: string, nullable: true }
        hasNextPage: { type: boolean }
        limit:       { type: integer }
    SearchBody:
      type: object
      required: [q]
      properties:
        q:    { type: string, minLength: 1, maxLength: 512 }
        mode: { type: string, enum: [hybrid, semantic, lexical], default: hybrid }
        limit:{ type: integer, default: 20, maximum: 50 }
    SearchResultPage:
      type: object
      properties:
        data:
          type: array
          items: { $ref: "#/components/schemas/SearchHit" }
        pageInfo: { $ref: "#/components/schemas/PageInfo" }
    SearchHit:
      type: object
      properties:
        chunkId:  { type: string }
        fileId:   { type: string }
        filename: { type: string }
        snippet:  { type: string }
        score:    { type: number }
        page:     { type: integer, nullable: true }
```

---

### Ek: tRPC Procedure Sayım Özeti

| Router | Procedure | Adet |
|---|---|---|
| auth | me, listSessions, revokeSession, listPasskeys, renamePasskey, deletePasskey, logout | 7 |
| workspace | get, update, usage, export | 4 |
| folder | list, tree, create, rename, move, delete | 6 |
| file | createUpload, list, get, status, rename, move, delete | 7 |
| ingestion | start, status, retry | 3 |
| content | get, generate, links, tts, podcast, audioStatus | 6 |
| chat | createSession, listSessions, getMessages, sendMessage, stop, renameSession, deleteSession | 7 |
| search | query, suggest | 2 |
| quiz | generate, get, list, startAttempt, submitAnswer, finishAttempt, result | 7 |
| flashcard | createFromFile, create, dueQueue, review, stats, delete | 6 |
| analytics | overview, timeseries, topics, track | 4 |
| coach | plan, nextAction, feedback | 3 |
| library | share, unshare, search, get, import | 5 |
| **Toplam** | | **67** |

> Not: Yukarıdaki kanonik sayım **67 tRPC procedure**'dür. WebAuthn/OAuth/magic-link akışları REST (`/v1/auth/*`) tarafında ek 9 endpoint olarak yer alır; REST tablosunda toplam 19 public endpoint tanımlıdır.
