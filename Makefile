.PHONY: all dev build test clean

all:
	cd server && npm install
	cd client && npm install

dev:
	@echo "Lancement du serveur et du client en mode dev..."
	@cd server && npm run dev & \
	cd client && npm start

build:
	@echo "Build client..."
	cd client && npm run build
	@echo "Lancement du serveur..."
	cd server && NODE_ENV=production npm start

test:
	cd server && npm run test:coverage
	cd client && npm run test:coverage

clean:
	cd server && rm -rf node_modules
	cd client && rm -rf node_modules
	@echo "Nettoyage terminé."
