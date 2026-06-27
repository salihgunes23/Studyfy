-- Yerel geliştirme veritabanı ilk açılışında gerekli eklentileri kurar.
-- Üretim migrasyonu: infra/db/migrations/0001_init.sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
