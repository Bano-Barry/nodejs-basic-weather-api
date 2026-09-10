# Weather API Wrapper Service

Une API RESTful développée en Node.js et Express agissant comme un service intermédiaire (wrapper) pour l'API tierce Visual Crossing. Ce projet met en œuvre des concepts avancés d'architecture backend, notamment la mise en cache en mémoire avec Redis pour minimiser la latence et les coûts d'API, ainsi qu'un limiteur de requêtes pour prévenir les abus (DDoS).

Ce projet répond aux spécifications de l'exercice [Weather API Wrapper Service](https://roadmap.sh/projects/weather-api-wrapper-service) de roadmap.sh.

## Fonctionnalités

- **Consommation d'API Tierce :** Interrogation asynchrone du service Visual Crossing via `axios`.
- **Mise en Cache (Redis) :** Stockage temporaire (12 heures) des réponses météorologiques pour drastiquement réduire les temps de réponse (Cache Hit vs Cache Miss).
- **Rate Limiting :** Protection de l'API avec un blocage strict fixé à 5 requêtes par minute par adresse IP (Erreur HTTP 429).
- **Sécurisation des Secrets :** Isolation de la clé API tierce via les variables d'environnement (`dotenv`).
- **Gestion des Erreurs :** Traitement structuré des erreurs de requêtes (villes introuvables, pannes réseau, limites atteintes).

## Stack Technique

- **Runtime :** Node.js
- **Framework :** Express.js
- **Client HTTP :** Axios
- **Base de données / Cache :** Redis (Serveur local) & client `redis` npm
- **Sécurité :** `express-rate-limit`, `dotenv`

## Structure du Projet

```text
📁 weather-api/
├── .env                  # Variables d'environnement (Clé API, Port)
├── .gitignore            # Exclusion de node_modules et .env
├── server.js             # Point d'entrée de l'application et définition des routes
├── package.json          # Dépendances (express, axios, redis, etc.)
└── README.md
```

## Prérequis et Installation
Serveur Redis : Un serveur Redis physique doit être installé et actif sur la machine hôte (ex: via sudo apt install redis-server sous Ubuntu).

Clé API : Un compte gratuit sur Visual Crossing Weather pour générer une clé.

Installation :

Bash
```
#### Cloner le dépôt
git clone <ton-url-de-depot>
cd weather-api

#### Installer les dépendances
npm install

#### Créer le fichier d'environnement
touch .env
```
Ajoutez vos paramètres dans le fichier .env :

```
PORT=3000
WEATHER_API_KEY=votre_cle_api_visual_crossing
```

#### Utilisation
Démarrer le serveur de développement :

Bash
```
node --watch server.js
```

#### Endpoints disponibles :

```
GET /
```

```
Réponse : {"status": "success", "message": "Bienvenue sur l'API Météo !"}
```

```
Récupérer la météo d'une ville :

GET /api/weather/:city
```

#### Exemple : http://localhost:3000/api/weather/conakry

#### Réponse attendue (Code 200) :

```
{
    "ville": "Conakry, Guinea",
    "temperature_celsius": 26.5,
    "conditions": "Partially cloudy",
    "description": "Partly cloudy throughout the day."
}
```

```
Réponse de limite (Code 429) : {"error": "Vous avez dépassé la limite de requêtes. Veuillez réessayer dans une minute."}
```