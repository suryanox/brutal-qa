PATH := $(shell npm bin -g 2>/dev/null):/opt/homebrew/bin:$(PATH)
SHELL := /bin/zsh

.PHONY: dev fe be

dev:
	@echo "Starting frontend (port 5173) and backend (port 3001)..."
	cd packages/frontend && npm run dev &
	cd packages/backend && npm run dev

fe:
	cd packages/frontend && npm run dev

be:
	cd packages/backend && npm run dev
