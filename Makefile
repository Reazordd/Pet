.PHONY: up down logs build restart reset

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

restart:
	docker compose down && docker compose up -d --build

build:
	docker compose build --no-cache

reset:
	docker compose down -v
	docker compose up -d --build
