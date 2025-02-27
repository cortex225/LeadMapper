# Google Maps Lead Extractor

Une application React qui utilise l'API Google Maps Places pour trouver des entreprises potentielles qui pourraient avoir besoin de services de création ou de refonte de site web.

## Fonctionnalités

- Recherche d'entreprises par type et localisation
- Filtrage des résultats pour afficher uniquement les entreprises sans site web
- Exportation des leads au format CSV
- Interface utilisateur moderne avec Tailwind CSS

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec votre clé API Google Maps :

```
VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_google_maps
```

## Utilisation

Pour lancer l'application en mode développement avec le serveur proxy :

```bash
npm run dev:full
```

Cela lancera :

- Le serveur de développement Vite sur http://localhost:5173
- Le serveur proxy Express sur http://localhost:3001

## Structure du projet

- `src/` - Code source de l'application
  - `components/` - Composants React
  - `services/` - Services pour les API
  - `server/` - Serveur proxy pour éviter les problèmes CORS
  - `types.ts` - Types TypeScript

## Déploiement

Pour construire l'application pour la production :

```bash
npm run build
```

Pour démarrer le serveur en production :

```bash
npm start
```

## Technologies utilisées

- React
- TypeScript
- Tailwind CSS
- Vite
- Express (serveur proxy)
- API Google Maps Places
