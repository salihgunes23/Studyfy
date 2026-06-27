# Studfy — geliştirici kısayolları
.DEFAULT_GOAL := help
COMPOSE := docker compose -f infra/docker/docker-compose.yml

.PHONY: help
help: ## Komutları listele
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Bağımlılıkları kur ve .env oluştur
	cp -n .env.example .env || true
	pnpm install

.PHONY: up
up: ## Altyapıyı başlat (postgres, redis, qdrant, minio, litellm)
	$(COMPOSE) up -d

.PHONY: down
down: ## Altyapıyı durdur
	$(COMPOSE) down

.PHONY: dev
dev: ## Tüm uygulamaları geliştirme modunda çalıştır
	pnpm dev

.PHONY: migrate
migrate: ## Veritabanı migrasyonlarını uygula
	pnpm db:migrate

.PHONY: lint test typecheck
lint: ## Lint
	pnpm lint
test: ## Test
	pnpm test
typecheck: ## Tip kontrolü
	pnpm typecheck

.PHONY: ai-dev
ai-dev: ## AI servisini çalıştır (FastAPI)
	cd services/ai && uvicorn app.main:app --reload --port 8000
