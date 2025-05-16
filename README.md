Presque, il te manque juste les balises de code (bash, env, js) pour bien formater les blocs dans le README.md, sinon ça rendra tout collé et difficile à lire.

Je te corrige ça, en gardant ta structure :

# Backend-Triangle

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)  
[![Build Status](https://img.shields.io/github/actions/workflow/status/Vikbg/backend-triangle/nodejs.yml?branch=main)](https://github.com/Vikbg/backend-triangle/actions)

---

## 🚀 Présentation

**Backend-Triangle** est un backend Node.js modulaire et léger, conçu pour fournir une base solide à des projets nécessitant une API REST bien organisée et maintenable.

Il inclut une architecture claire avec séparation des responsabilités (routes, contrôleurs, modèles, middlewares) ainsi qu’un système simple de gestion de la base de données.

---

## ⚙️ Fonctionnalités

- Architecture MVC modulaire  
- Gestion propre des routes et middlewares  
- Connexion configurable à une base de données via `.env`  
- Tests unitaires intégrés  
- Support des variables d'environnement  
- Facile à étendre et personnaliser  

---

## 🛠️ Installation

1. Clone le dépôt

```bash
git clone https://github.com/Vikbg/backend-triangle.git
cd backend-triangle

2. Installe les dépendances avec pnpm (ou npm si tu préfères)



pnpm install

3. Configure les variables d’environnement



Crée un fichier .env à la racine (exemple minimal) :

DB_HOST=localhost
DB_USER=root
DB_PASS=motdepasse
DB_NAME=triangle_db
PORT=3000

4. Lance le serveur



pnpm start

Le serveur écoute alors sur le port configuré (ex: http://localhost:3000).


---

🧩 Structure du projet

backend-triangle/
├── controllers/        # Logique métier et gestion des requêtes
├── middlewares/        # Fonctions middleware pour requêtes HTTP
├── models/             # Modèles de données (ex: schémas DB)
├── routes/             # Définition des routes de l’API
├── tests/              # Tests unitaires et d’intégration
├── .env                # Variables d’environnement (non versionné)
├── db.js               # Configuration et connexion à la base de données
├── index.js            # Point d’entrée de l’application
├── package.json        # Dépendances & scripts
└── README.md           # Documentation principale (tu es ici)


---

🧪 Tests

Pour lancer les tests (basés sur Jest ou autre framework selon ton choix) :

pnpm test


---

📚 Utilisation

Tu peux étendre les routes, ajouter des modèles, et créer des middlewares personnalisés dans leurs dossiers respectifs.

Exemple rapide pour ajouter une route dans routes/example.js :

const express = require('express');
const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Backend-Triangle!' });
});

module.exports = router;

Et dans index.js tu importes et utilises cette route :

const exampleRoutes = require('./routes/example');
app.use('/api', exampleRoutes);


---

💡 Contributions

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork ce repo


2. Crée ta branche (git checkout -b feature/ma-fonctionnalite)


3. Commit tes changements (git commit -m 'Ajout de fonctionnalité')


4. Push sur ta branche (git push origin feature/ma-fonctionnalite)


5. Ouvre une Pull Request




---

📜 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.


---

🤝 Remerciements

Merci d'utiliser Backend-Triangle. Pour toute question, n’hésite pas à ouvrir une issue ou me contacter.


---

Viktor
Backend-Triangle | 2025

---