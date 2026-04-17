.PHONY: install dev run test lint migrate seed-vector-store

install:
	pip install -e ".[dev]"

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
test:
	pytest tests/ -v --cov=app --cov-report=term-missing

# Lint + format
lint:
	ruff check app/ tests/
	ruff format --check app/ tests/

format:
	ruff format app/ tests/
	ruff check --fix app/ tests/

# Database migrations
migrate-init:
	alembic revision --autogenerate -m "initial_schema"

migrate:
	alembic upgrade head

migrate-down:
	alembic downgrade -1

# Dev database (no migrations, just create tables)
init-db:
	python scripts/init_db.py

# Build / rebuild FAISS vector store
seed-vector-store:
	python scripts/build_vector_store.py

rebuild-vector-store:
	python scripts/build_vector_store.py --force

# Docker
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f api
