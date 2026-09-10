// Charge les variables du fichier .env dans process.env
require('dotenv').config(); 
const express = require('express');

const app = express();
// Sécurisation du port : on lit le .env, ou on utilise 3000 par défaut
const PORT = process.env.PORT || 3000;

// Middleware pour parser automatiquement le JSON entrant
app.use(express.json());

// Route GET d'accueil
app.get('/', (req, res) => {
    // res.json gère automatiquement le Content-Type, le JSON.stringify et le res.end()
    res.json({ 
        status: 'success',
        message: "Bienvenue sur l'API Météo !" 
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur Express en écoute sur le port ${PORT}`);
});