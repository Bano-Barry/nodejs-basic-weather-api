require('dotenv').config(); 
const express = require('express');
const axios = require('axios');
const redis = require('redis'); // Import du client Redis
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisation et connexion asynchrone au serveur Redis local
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Erreur Redis :', err));
redisClient.connect().catch(console.error);

app.use(express.json());

// Configuration du limiteur de requêtes
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Fenêtre de 1 minute
    max: 5, // Limite chaque IP à 5 requêtes par fenêtre de temps
    message: {
        error: "Vous avez dépassé la limite de requêtes. Veuillez réessayer dans une minute."
    },
    standardHeaders: true, // Renvoie les infos de limite dans les en-têtes `RateLimit-*`
    legacyHeaders: false, // Désactive les anciens en-têtes `X-RateLimit-*`
});

// Application du middleware UNIQUEMENT sur la route API
app.use('/api/', apiLimiter);

app.get('/api/weather/:city', async (req, res) => {
    // Normalisation en minuscules pour éviter que "Conakry" et "conakry" créent deux caches différents
    const city = req.params.city.toLowerCase(); 
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Clé API serveur manquante." });

    try {
        // ÉTAPE A : Vérifier si la ville est déjà dans le cache Redis
        const cachedWeather = await redisClient.get(city);

        if (cachedWeather) {
            console.log(`CACHE HIT : Renvoi instantané pour ${city}`);
            // On retransforme la chaîne JSON stockée dans Redis en objet JavaScript
            return res.json(JSON.parse(cachedWeather));
        }

        // ÉTAPE B : CACHE MISS. On appelle l'API de Visual Crossing
        console.log(`CACHE MISS : Appel à l'API tierce pour ${city}`);
        const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}`;
        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        const responseToClient = {
            ville: weatherData.resolvedAddress,
            temperature_celsius: weatherData.currentConditions.temp,
            conditions: weatherData.currentConditions.conditions,
            description: weatherData.description
        };

        // ÉTAPE C : Sauvegarde dans Redis avec expiration (EX)
        // 43200 secondes = 12 heures
        await redisClient.setEx(city, 43200, JSON.stringify(responseToClient));

        res.json(responseToClient);

    } catch (error) {
        if (error.response && error.response.status === 400) {
            res.status(404).json({ error: `La ville '${city}' est introuvable.` });
        } else {
            console.error(error.message);
            res.status(500).json({ error: "Erreur lors de la communication avec le service météo tiers." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Express en écoute sur le port ${PORT}`);
});