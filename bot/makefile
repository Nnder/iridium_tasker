THIS_FILE := $(lastword $(MAKEFILE_LIST))
.PHONY: npm-i dev dev-clean

dev:
 	docker compose --env-file .env.dev up -d --no-log-prefix traefik postgresdb pgadmin bot bot_web
	
dev-clean:
	docker compose --env-file .env.dev down -v --rmi local
