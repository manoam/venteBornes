# Vente Bornes - Frontend

Frontend React + Vite + Tailwind pour la gestion des ventes (refonte CRM Selfizee).

API backend : https://github.com/manoam/api-vente-bornes

## Développement local

```bash
npm install

# Config - créer .env
echo "VITE_API_URL=http://localhost:3002/api" > .env

npm run dev              # http://localhost:5173
```

## Déploiement Coolify

**Source** : Public Repository `https://github.com/manoam/venteBornes`
**Build Pack** : Docker Compose
**Compose file** : `docker-compose.yml`

Variable d'env :
```
VITE_API_URL=https://<domaine-api>/api
WEB_PORT=80
```
