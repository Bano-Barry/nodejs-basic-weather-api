require('dotenv').config(); 
const express = require('express');
const axios = require('axios'); // Nouvel import

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'success', message: "Bienvenue sur l'API Météo !" });
});

// Nouvelle route dynamique pour la météo
app.get('/api/weather/:city', async (req, res) => {
    // Récupération du nom de la ville tapée dans l'URL
    const city = req.params.city;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Clé API serveur manquante." });
    }

    try {
        // Construction de l'URL vers Visual Crossing (unitGroup=metric pour les Celsius)
        const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}`;
        
        // Requête HTTP GET vers le service externe
        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        // On ne renvoie au client que les données essentielles
        res.json({
            ville: weatherData.resolvedAddress,
            temperature_celsius: weatherData.currentConditions.temp,
            conditions: weatherData.currentConditions.conditions,
            description: weatherData.description
        });

    } catch (error) {
        // Gestion propre des erreurs (ex: ville mal orthographiée)
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