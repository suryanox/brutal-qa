.PHONY: dev fe be

dev: fe be

fe:
	cd packages/frontend && npm run dev

be:
	cd packages/backend && npm run dev
