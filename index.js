require('dotenv').config();
const express = require('express');
const app = express();
const playerRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

// Middleware pour parser le JSON
app.use(express.json());

// Routes
app.use('/players', playerRoutes);
app.use('/scores', scoreRoutes);

// Port du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;