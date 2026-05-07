.PHONY: help restore build test run clean migration-add migration-apply up down logs reset

SOLUTION       := Fintech.Billetera.slnx
INFRA_PROJECT  := src/Fintech.Billetera.Infrastructure/Fintech.Billetera.Infrastructure.csproj
API_PROJECT    := src/Fintech.Billetera.API/Fintech.Billetera.API.csproj
COMPOSE        := docker compose

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

restore: ## Restore NuGet packages
	dotnet restore

build: ## Build solution
	dotnet build --no-restore

test: ## Run domain tests
	dotnet test --no-build

run: ## Run API locally
	dotnet run --project $(API_PROJECT)

clean: ## Clean build outputs
	dotnet clean
	rm -rf src/*/bin src/*/obj tests/*/bin tests/*/obj

migration-add: ## Create EF migration: make migration-add NAME=MyMigration
	dotnet ef migrations add $(NAME) --project $(INFRA_PROJECT) --startup-project $(API_PROJECT) -o Persistence/Migrations

migration-apply: ## Apply migrations
	dotnet ef database update --project $(INFRA_PROJECT) --startup-project $(API_PROJECT)

up: ## Start docker stack
	$(COMPOSE) up -d --build

down: ## Stop docker stack
	$(COMPOSE) down

logs: ## Tail docker logs
	$(COMPOSE) logs -f

reset: ## Wipe docker stack + volumes
	$(COMPOSE) down -v
