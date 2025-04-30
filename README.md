# Chicken Nation Dashboard

Interface d'administration pour la plateforme Chicken Nation, développée avec Next.js, TypeScript et Tailwind CSS.

## Fonctionnalités

- **Authentification** : Système de connexion sécurisé pour les administrateurs
- **Gestion des menus** : Interface pour ajouter, modifier et supprimer des produits
- **Gestion des commandes** : Suivi et traitement des commandes en temps réel
- **Gestion des réservations** : Système de réservation de tables
- **Statistiques** : Tableaux de bord avec analyses des ventes et performances

## Technologies utilisées

- **Next.js 15** : Framework React avec rendu côté serveur
- **TypeScript** : Typage statique pour un code plus robuste
- **Tailwind CSS** : Framework CSS utilitaire pour un design responsive
- **Lucide React** : Bibliothèque d'icônes SVG
- **Zustand** : Gestion d'état global

## Structure du projet

```
chicken-nation/
├── src/
│   ├── app/                    # Routes de l'application
│   │   ├── login/              # Page de connexion
│   │   └── (authenticated)/    # Routes protégées
│   ├── components/             # Composants réutilisables
│   │   ├── auth/               # Composants d'authentification
│   │   └── ui/                 # Composants d'interface
│   ├── lib/                    # Utilitaires et fonctions
│   ├── store/                  # Gestion d'état global
│   └── assets/                 # Ressources statiques
├── public/                     # Fichiers publics
│   ├── images/                 # Images
│   └── fonts/                  # Polices
└── tailwind.config.js          # Configuration Tailwind
```

## Installation

1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-organisation/chicken-nation-dashboard.git
   cd chicken-nation-dashboard
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Lancer le serveur de développement
   ```bash
   npm run dev
   ```

4. Ouvrir [http://localhost:3020](http://localhost:3020) dans votre navigateur

## Guide de développement

Pour étendre le projet, veuillez suivre les conventions établies dans le guide de continuation du frontend. Respectez la structure des dossiers, les conventions de nommage et les styles existants.

## Déploiement

Le projet peut être déployé sur Vercel ou tout autre service compatible avec Next.js.

```bash
npm run build
npm start
```

## Licence

Propriétaire - Tous droits réservés © Chicken Nation
"# chicken-nation-dashboard" 
