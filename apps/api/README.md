# @studfy/api

Studfy core API — **NestJS (Node 22, TS) + Fastify**. İş mantığı, CRUD, RBAC,
çok-kiracılı izolasyon (Postgres RLS), BullMQ iş kuyrukları ve AI servisine köprü.

## Geliştirme
```bash
pnpm db:generate                 # Prisma client
pnpm --filter @studfy/api dev    # http://localhost:4001
```

## Yapı
- `src/modules/` — domain modülleri (auth, workspace, file, ingestion, quiz, …).
- `src/common/` — guard, interceptor, filtre, sağlık kontrolü.
- `prisma/schema.prisma` — veri modeli (bkz. [docs/DATABASE.md](../../docs/DATABASE.md)).

API sözleşmesi: [docs/API_SPEC.md](../../docs/API_SPEC.md).
