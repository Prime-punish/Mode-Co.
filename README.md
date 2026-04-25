# MODE & CO. — Dashboard

## Stack
- **Frontend**: HTML5 + CSS3 + Vanilla JS (avancé)
- **Charts**: Chart.js v4
- **Animations**: CSS Keyframes + Web Animations API
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Fonts**: Playfair Display + Cormorant Garamond + DM Sans (Google Fonts)

## Fichiers
```
mode-co/
├── login.html          ← Page de connexion
├── dashboard.html      ← Dashboard principal
├── supabase-schema.sql ← Schéma base de données
└── README.md
```

## Configuration Supabase

### 1. Créer un projet Supabase
Allez sur https://supabase.com et créez un nouveau projet.

### 2. Exécuter le schéma
Dans l'éditeur SQL de Supabase, copiez-collez le contenu de `supabase-schema.sql` et exécutez-le.

### 3. Configurer les clés API
Dans `login.html` et `dashboard.html`, remplacez:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```
Par vos vraies valeurs (trouvées dans: Settings > API de votre projet Supabase).

### 4. Créer un utilisateur de test
Dans Supabase > Authentication > Users > Invite User:
- Email: `admin@modeandco.com`
- Mot de passe: `motdepasse123`

### 5. Activer le Realtime (optionnel)
Dans Supabase > Database > Replication, activez les tables `orders` et `activity_log`.

## Fonctionnalités

### Login
- Authentification Supabase (email + mot de passe)
- Validation en temps réel
- Compteurs animés
- Système de particules canvas
- Mode démo (bouton "Accès Démo")
- Toggle visibilité mot de passe

### Dashboard
- KPI Cards avec compteurs animés + mini sparklines
- Graphique barres/ligne (ventes vs objectif) avec tabs Mois/Semaine/An
- Graphique donut catégories produits
- Table commandes récentes avec filtrage en temps réel
- Top 5 produits avec barres de progression animées
- Feed d'activité en temps réel
- Panel de notifications coulissant
- Recherche globale
- Horloge live
- Navigation sidebar complète

## Design System
- **Couleur principale**: #12213a (Deep Navy)
- **Accent**: #D4AF37 (Gold Leaf)
- **Typographie display**: Playfair Display
- **Typographie corps**: DM Sans
- **Bordures**: rgba(212,175,55,0.18)
- **Rayons**: 8-16px (moderne, pas trop arrondi)
