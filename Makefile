.PHONY: all

all:
	cd server && npm install
	cd client && npm install
	@echo "Lancement du serveur et du client..."
	@cd server && npm run dev & \
	cd client && npm start

test:
	cd server && npm run test:coverage
	cd client && npm run test:coverage

clean:
	cd server && rm -rf node_modules
	cd client && rm -rf node_modules
	@echo "Nettoyage terminé."