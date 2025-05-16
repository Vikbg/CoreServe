# Architecture du projet CoreServe

## Vue d'ensemble

CoreServe est un backend Node.js structuré selon une architecture modulaire basée sur le modèle MVC (Modèle-Vue-Contrôleur). Cette organisation facilite la maintenance, l’évolution et la compréhension du code.

---

## Structure des dossiers principaux

- **controllers/**  
  Contient la logique métier et la gestion des requêtes HTTP. Chaque contrôleur correspond à une ressource ou fonctionnalité.

- **models/**  
  Définit les schémas de données et interactions avec la base de données.

- **routes/**  
  Définit les endpoints API et associe les routes aux contrôleurs correspondants.

- **middlewares/**  
  Fonctions intermédiaires exécutées avant ou après les routes (ex: authentification, validation).

- **tests/**  
  Contient les tests unitaires et d’intégration pour assurer la qualité du code.

---

## Point d’entrée

Le fichier `index.js` initialise l’application, configure les middlewares globaux, connecte la base de données, et monte les routes.

---

## Gestion de la base de données

La connexion à la base de données est configurée dans `db.js` via des variables d’environnement. Ce module exporte la connexion pour être utilisée dans les modèles.

---

## Flux des requêtes

1. Une requête HTTP arrive sur un endpoint défini dans `routes/`.
2. Le routeur redirige vers le contrôleur approprié.
3. Le contrôleur traite la logique métier et interagit avec la base de données via les modèles.
4. Le contrôleur retourne une réponse JSON au client.

---

N’hésite pas à consulter les autres fichiers de documentation pour plus de détails sur l’API ou le déploiement.