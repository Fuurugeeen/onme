# ========================================
# OnMe - Git Worktree Parallel Development
# ========================================
# Usage:
#   make infra     - Start shared infrastructure (run once)
#   make app       - Start app for this worktree (auto port)
#   make app-down  - Stop app for this worktree
#   make status    - Show all running instances
#   make logs      - Show logs for this worktree's app
#   make clean     - Clean up everything

.PHONY: infra infra-down app app-down status logs logs-backend logs-frontend \
        clean clean-all backend frontend shell-backend shell-db migrate help

# ========================================
# Configuration
# ========================================
SHELL := /bin/bash
PORT_FILE := .app_port
PORT_REGISTRY := $(HOME)/.onme_ports
BACKEND_BASE_PORT := 8080
BACKEND_MAX_PORT := 8099
FRONTEND_BASE_PORT := 5173
FRONTEND_MAX_PORT := 5199
NETWORK_NAME := onme-shared-network
VOLUME_NAME := onme-postgres-data
PROJECT_PREFIX := onme

# ========================================
# Infrastructure (shared across worktrees)
# ========================================
infra:
	@echo "=== Starting shared infrastructure ==="
	@docker network create $(NETWORK_NAME) 2>/dev/null || echo "Network $(NETWORK_NAME) already exists"
	@docker volume create $(VOLUME_NAME) 2>/dev/null || echo "Volume $(VOLUME_NAME) already exists"
	@docker compose --profile infra up -d
	@echo ""
	@echo "Infrastructure is ready:"
	@echo "  - PostgreSQL: localhost:5432"
	@echo ""

infra-down:
	@echo "=== Stopping shared infrastructure ==="
	@docker compose --profile infra down
	@echo "Infrastructure stopped"

# ========================================
# Application (per worktree)
# ========================================
app:
	@# Check if already running
	@if [ -f $(PORT_FILE) ]; then \
		PORTS=$$(cat $(PORT_FILE)); \
		BACKEND_PORT=$$(echo $$PORTS | cut -d: -f1); \
		FRONTEND_PORT=$$(echo $$PORTS | cut -d: -f2); \
		if [ "$$BACKEND_PORT" != "-" ] && lsof -i :$$BACKEND_PORT -t >/dev/null 2>&1; then \
			echo "Already running:"; \
			echo "  - Backend:  http://localhost:$$BACKEND_PORT"; \
			echo "  - Frontend: http://localhost:$$FRONTEND_PORT"; \
			exit 0; \
		fi; \
	fi; \
	\
	# Find free backend port \
	BACKEND_PORT=""; \
	for port in $$(seq $(BACKEND_BASE_PORT) $(BACKEND_MAX_PORT)); do \
		if ! lsof -i :$$port -t >/dev/null 2>&1; then \
			BACKEND_PORT=$$port; \
			break; \
		fi; \
	done; \
	\
	# Find free frontend port \
	FRONTEND_PORT=""; \
	for port in $$(seq $(FRONTEND_BASE_PORT) $(FRONTEND_MAX_PORT)); do \
		if ! lsof -i :$$port -t >/dev/null 2>&1; then \
			FRONTEND_PORT=$$port; \
			break; \
		fi; \
	done; \
	\
	if [ -z "$$BACKEND_PORT" ] || [ -z "$$FRONTEND_PORT" ]; then \
		echo "Error: No free ports available"; \
		exit 1; \
	fi; \
	\
	# Save ports \
	echo "$$BACKEND_PORT:$$FRONTEND_PORT" > $(PORT_FILE); \
	\
	# Determine project name from worktree \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	\
	# Register in port registry (remove old entry first) \
	grep -v "$$PROJECT_NAME" $(PORT_REGISTRY) > $(PORT_REGISTRY).tmp 2>/dev/null || true; \
	mv $(PORT_REGISTRY).tmp $(PORT_REGISTRY) 2>/dev/null || true; \
	echo "$$PROJECT_NAME|$$BACKEND_PORT|$$FRONTEND_PORT|$$(pwd)" >> $(PORT_REGISTRY); \
	\
	# Start app \
	echo "=== Starting app ($$PROJECT_NAME) ==="; \
	BACKEND_PORT=$$BACKEND_PORT FRONTEND_PORT=$$FRONTEND_PORT \
		docker compose -p $$PROJECT_NAME --profile app up -d; \
	\
	echo ""; \
	echo "App started:"; \
	echo "  - Backend:  http://localhost:$$BACKEND_PORT"; \
	echo "  - Frontend: http://localhost:$$FRONTEND_PORT"; \
	echo ""

app-down:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 0; \
	fi; \
	\
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	\
	echo "=== Stopping app ($$PROJECT_NAME) ==="; \
	# Stop all profiles (app, backend, frontend) to handle any startup method \
	docker compose -p $$PROJECT_NAME --profile app --profile backend --profile frontend down; \
	rm -f $(PORT_FILE); \
	\
	# Remove from registry \
	if [ -f $(PORT_REGISTRY) ]; then \
		grep -v "$$PROJECT_NAME" $(PORT_REGISTRY) > $(PORT_REGISTRY).tmp 2>/dev/null || true; \
		mv $(PORT_REGISTRY).tmp $(PORT_REGISTRY) 2>/dev/null || true; \
	fi; \
	echo "App stopped"

# ========================================
# Status & Monitoring
# ========================================
status:
	@echo "=== OnMe Instance Status ==="
	@echo ""
	@echo "Infrastructure:"
	@# Check for compose container pattern: project-db-N or project-service-db-N
	@if docker ps --format '{{.Names}}' | grep -qE "(^|-)db-[0-9]+$$"; then \
		echo "  [RUNNING] PostgreSQL - localhost:5432"; \
	elif lsof -i :5432 -t >/dev/null 2>&1; then \
		echo "  [RUNNING] PostgreSQL - localhost:5432 (external)"; \
	else \
		echo "  [STOPPED] PostgreSQL"; \
	fi
	@echo ""
	@echo "Applications:"
	@if [ -f $(PORT_REGISTRY) ]; then \
		while IFS='|' read -r project backend frontend path; do \
			if [ -n "$$project" ]; then \
				BE_RUNNING="no"; FE_RUNNING="no"; \
				if [ "$$backend" != "-" ] && lsof -i :$$backend -t >/dev/null 2>&1; then BE_RUNNING="yes"; fi; \
				if [ "$$frontend" != "-" ] && lsof -i :$$frontend -t >/dev/null 2>&1; then FE_RUNNING="yes"; fi; \
				if [ "$$BE_RUNNING" = "yes" ] || [ "$$FE_RUNNING" = "yes" ]; then \
					echo "  [RUNNING] $$project"; \
					if [ "$$backend" != "-" ]; then echo "            Backend:  http://localhost:$$backend"; fi; \
					if [ "$$frontend" != "-" ]; then echo "            Frontend: http://localhost:$$frontend"; fi; \
					echo "            Path:     $$path"; \
				else \
					echo "  [STOPPED] $$project ($$path)"; \
				fi; \
			fi; \
		done < $(PORT_REGISTRY); \
	else \
		echo "  No registered instances"; \
	fi
	@echo ""

logs:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 1; \
	fi; \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	docker compose -p $$PROJECT_NAME logs -f

logs-backend:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 1; \
	fi; \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	docker compose -p $$PROJECT_NAME logs -f backend

logs-frontend:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 1; \
	fi; \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	docker compose -p $$PROJECT_NAME logs -f frontend

# ========================================
# Cleanup
# ========================================
clean:
	@echo "=== Cleaning up ==="
	@# Stop this worktree's app
	@$(MAKE) -s app-down 2>/dev/null || true
	@echo "Cleanup complete"

clean-all:
	@echo "=== Cleaning up everything ==="
	@# Stop all registered apps (all profiles)
	@if [ -f $(PORT_REGISTRY) ]; then \
		while IFS='|' read -r project backend frontend path; do \
			if [ -n "$$project" ]; then \
				echo "Stopping $$project..."; \
				docker compose -p $$project --profile app --profile backend --profile frontend down 2>/dev/null || true; \
			fi; \
		done < $(PORT_REGISTRY); \
		rm -f $(PORT_REGISTRY); \
	fi
	@# Stop infrastructure
	@$(MAKE) -s infra-down 2>/dev/null || true
	@# Remove network and volumes
	@docker network rm $(NETWORK_NAME) 2>/dev/null || true
	@docker volume rm $(VOLUME_NAME) 2>/dev/null || true
	@rm -f $(PORT_FILE)
	@echo "Full cleanup complete"

# ========================================
# Individual Services (BE/FE separate)
# ========================================
backend:
	@# Check if already running
	@if [ -f $(PORT_FILE) ]; then \
		PORTS=$$(cat $(PORT_FILE)); \
		BACKEND_PORT=$$(echo $$PORTS | cut -d: -f1); \
		if [ "$$BACKEND_PORT" != "-" ] && lsof -i :$$BACKEND_PORT -t >/dev/null 2>&1; then \
			echo "Backend already running: http://localhost:$$BACKEND_PORT"; \
			exit 0; \
		fi; \
	fi; \
	\
	# Find free port \
	BACKEND_PORT=""; \
	for port in $$(seq $(BACKEND_BASE_PORT) $(BACKEND_MAX_PORT)); do \
		if ! lsof -i :$$port -t >/dev/null 2>&1; then \
			BACKEND_PORT=$$port; \
			break; \
		fi; \
	done; \
	if [ -z "$$BACKEND_PORT" ]; then \
		echo "Error: No free port available"; \
		exit 1; \
	fi; \
	\
	# Get existing frontend port or set placeholder \
	if [ -f $(PORT_FILE) ]; then \
		FRONTEND_PORT=$$(cat $(PORT_FILE) | cut -d: -f2); \
	else \
		FRONTEND_PORT="-"; \
	fi; \
	echo "$$BACKEND_PORT:$$FRONTEND_PORT" > $(PORT_FILE); \
	\
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	\
	# Register in port registry \
	grep -v "$$PROJECT_NAME" $(PORT_REGISTRY) > $(PORT_REGISTRY).tmp 2>/dev/null || true; \
	mv $(PORT_REGISTRY).tmp $(PORT_REGISTRY) 2>/dev/null || true; \
	echo "$$PROJECT_NAME|$$BACKEND_PORT|$$FRONTEND_PORT|$$(pwd)" >> $(PORT_REGISTRY); \
	\
	echo "=== Starting backend only ($$PROJECT_NAME) ==="; \
	BACKEND_PORT=$$BACKEND_PORT docker compose -p $$PROJECT_NAME --profile backend up -d; \
	echo "Backend: http://localhost:$$BACKEND_PORT"

frontend:
	@# Check if already running
	@if [ -f $(PORT_FILE) ]; then \
		PORTS=$$(cat $(PORT_FILE)); \
		FRONTEND_PORT=$$(echo $$PORTS | cut -d: -f2); \
		if [ "$$FRONTEND_PORT" != "-" ] && lsof -i :$$FRONTEND_PORT -t >/dev/null 2>&1; then \
			echo "Frontend already running: http://localhost:$$FRONTEND_PORT"; \
			exit 0; \
		fi; \
	fi; \
	\
	# Find free port \
	FRONTEND_PORT=""; \
	for port in $$(seq $(FRONTEND_BASE_PORT) $(FRONTEND_MAX_PORT)); do \
		if ! lsof -i :$$port -t >/dev/null 2>&1; then \
			FRONTEND_PORT=$$port; \
			break; \
		fi; \
	done; \
	if [ -z "$$FRONTEND_PORT" ]; then \
		echo "Error: No free port available"; \
		exit 1; \
	fi; \
	\
	# Get existing backend port or set placeholder \
	if [ -f $(PORT_FILE) ]; then \
		BACKEND_PORT=$$(cat $(PORT_FILE) | cut -d: -f1); \
	else \
		BACKEND_PORT="-"; \
	fi; \
	echo "$$BACKEND_PORT:$$FRONTEND_PORT" > $(PORT_FILE); \
	\
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	\
	# Register in port registry \
	grep -v "$$PROJECT_NAME" $(PORT_REGISTRY) > $(PORT_REGISTRY).tmp 2>/dev/null || true; \
	mv $(PORT_REGISTRY).tmp $(PORT_REGISTRY) 2>/dev/null || true; \
	echo "$$PROJECT_NAME|$$BACKEND_PORT|$$FRONTEND_PORT|$$(pwd)" >> $(PORT_REGISTRY); \
	\
	echo "=== Starting frontend only ($$PROJECT_NAME) ==="; \
	FRONTEND_PORT=$$FRONTEND_PORT docker compose -p $$PROJECT_NAME --profile frontend up -d; \
	echo "Frontend: http://localhost:$$FRONTEND_PORT"

# ========================================
# Development Helpers
# ========================================
shell-backend:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 1; \
	fi; \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	docker compose -p $$PROJECT_NAME exec backend /bin/bash

shell-db:
	@docker compose --profile infra exec db psql -U postgres -d onme

migrate:
	@if [ ! -f $(PORT_FILE) ]; then \
		echo "No app running in this worktree"; \
		exit 1; \
	fi; \
	WORKTREE_NAME=$$(basename $$(pwd)); \
	PROJECT_NAME="$(PROJECT_PREFIX)-$$WORKTREE_NAME"; \
	docker compose -p $$PROJECT_NAME exec backend alembic upgrade head

# ========================================
# Help
# ========================================
help:
	@echo "OnMe - Git Worktree Parallel Development"
	@echo ""
	@echo "Usage:"
	@echo "  make infra         Start shared infrastructure (DB)"
	@echo "  make infra-down    Stop shared infrastructure"
	@echo "  make app           Start FE+BE for this worktree"
	@echo "  make backend       Start BE only for this worktree"
	@echo "  make frontend      Start FE only for this worktree"
	@echo "  make app-down      Stop app for this worktree"
	@echo "  make status        Show all running instances"
	@echo "  make logs          Show logs (all services)"
	@echo "  make logs-backend  Show backend logs"
	@echo "  make logs-frontend Show frontend logs"
	@echo "  make shell-backend Enter backend container"
	@echo "  make shell-db      Enter database shell"
	@echo "  make migrate       Run database migrations"
	@echo "  make clean         Stop this worktree's app"
	@echo "  make clean-all     Stop everything and remove volumes"
	@echo ""
	@echo "Workflow:"
	@echo "  1. make infra      # Once, to start shared DB"
	@echo "  2. make app        # FE+BE together"
	@echo "     or"
	@echo "     make backend    # BE only"
	@echo "     make frontend   # FE only"
	@echo "  3. make status     # Check what's running"
	@echo "  4. make app-down   # When done"
