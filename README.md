# Collection.ma — Marketplace Marocaine d'Enchères & Vente Directe

Plateforme de collectionneurs inspirée de Delcampe.net, avec paiement séquestré, commission 5% configurable, et republication automatique toutes les 4 semaines.

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Backend** | Laravel 12, PHP 8.2, API REST |
| **Frontend** | React 18 + TypeScript + Vite |
| **Base de données** | SQLite (dev) / MySQL 8 (prod) |
| **Styling** | TailwindCSS v4 |
| **Auth** | Laravel Sanctum (SPA cookie-based) |
| **Temps réel** | Laravel Reverb (configuré) |
| **Queues** | Redis (republications, clôtures, relances) |
| **Stockage** | S3-compatible (Laravel Filesystem) |

## Installation

### Backend (Laravel)

```bash
# Depuis la racine du projet
composer install
cp .env.example .env   # ou modifier .env directement
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve       # → http://localhost:8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

Le proxy Vite redirige `/api` et `/sanctum` vers `localhost:8000`.

## Variables d'Environnement (.env)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `APP_NAME` | Nom de l'application | Collection.ma |
| `APP_URL` | URL de base | http://localhost:8000 |
| `DB_CONNECTION` | Type de BDD | mysql |
| `DB_DATABASE` | Nom de la BDD | collection_ma |
| `FILESYSTEM_DISK` | Disque de stockage | s3 |
| `QUEUE_CONNECTION` | Driver de queue | redis |
| `BROADCAST_CONNECTION` | Driver broadcast | reverb |
| `SANCTUM_STATEFUL_DOMAINs` | Domaines SPA autorisés | localhost:5173 |

## Diagramme du Flux Séquestre

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ACHETEUR   │     │   PLATEFORME     │     │    VENDEUR      │
│             │     │  (EscrowService)  │     │                 │
└──────┬──────┘     └────────┬─────────┘     └────────┬────────┘
       │                     │                        │
       │  1. Paiement        │                        │
       │  (prix + port)      │                        │
       ├────────────────────►│                        │
       │                     │                        │
       │  ┌──────────────────┴──────────────────┐     │
       │  │  WALLET PLATEFORME                  │     │
       │  │  solde_en_attente = total           │     │
       │  │  (fonds bloqués en séquestre)       │     │
       │  └─────────────────────────────────────┘     │
       │                     │                        │
       │                     │  2. Notification       │
       │                     │  "Expédiez l'objet"    │
       │                     ├───────────────────────►│
       │                     │                        │
       │                     │  3. Vendeur expédie    │
       │                     │  renseigne tracking    │
       │                     │◄───────────────────────┤
       │                     │                        │
       │  ┌──────────────────┴──────────────────┐     │
       │  │  DÉLAI CONFIRMATION (10j ouvrables) │     │
       │  └─────────────────────────────────────┘     │
       │                     │                        │
       │  4a. CONFIRMATION   │                        │
       │  Acheteur confirme  │                        │
       ├────────────────────►│                        │
       │                     │                        │
       │                     │  5. CALCUL COMMISSION  │
       │                     │  Taux configurable (5%)│
       │                     │  commission = prix × 5%│
       │                     │                        │
       │                     │  6. VIREMENT VENDEUR   │
       │                     │  net = prix - commission│
       │                     ├───────────────────────►│
       │                     │                        │
       │  ┌──────────────────┴──────────────────┐     │
       │  │  WALLET VENDEUR                     │     │
       │  │  solde_disponible += net            │     │
       │  │  (retrait possible)                 │     │
       │  └─────────────────────────────────────┘     │
       │                     │                        │
       │  4b. ABSENCE /      │                        │
       │  LITIGE → REMBOURSEMENT                     │
       │◄────────────────────┤                        │
       │                     │                        │
       │  ┌──────────────────┴──────────────────┐     │
       │  │  WALLET ACHETEUR                    │     │
       │  │  solde += total (remboursement)     │     │
       │  └─────────────────────────────────────┘     │
```

## Cycle de Vie Annonce (28 jours)

```
  Publication         J+28                    J+56
      │                │                       │
      ▼                ▼                       ▼
  ┌────────┐     ┌──────────┐           ┌──────────┐
  │ ACTIVE │────►│ EXPIRÉE  │──────────►│ REPUBLIÉE│
  └────────┘     └──────────┘  auto     └──────────┘
                   si pas vendue    si auto_repub = true
                   et mode enchère  (jusqu'à 50 fois)
```

## Structure du Projet

```
MarketPlace/
├── app/
│   ├── Http/Controllers/Api/   # 10 controllers API
│   ├── Jobs/                   # 3 jobs planifiés
│   ├── Models/                 # 16 modèles Eloquent
│   └── Services/               # EscrowService (logique séquestre)
├── database/
│   ├── migrations/             # 17 migrations
│   └── seeders/                # CategorySeeder (20 catégories) + SiteSettings
├── routes/
│   ├── api.php                 # 54 routes API
│   └── console.php             # Scheduler (3 jobs quotidiens)
└── frontend/                   # React SPA
    ├── src/
    │   ├── api/                # Client API + endpoints
    │   ├── components/         # Design system (Header, Footer, Cards, etc.)
    │   ├── contexts/           # AuthContext
    │   ├── i18n/               # fr.json + ar.json (bilingue FR/AR)
    │   ├── pages/              # Pages React
    │   ├── lib/                # Utilitaires (formatMAD, etc.)
    │   └── types/              # TypeScript types
    └── package.json
```

## API Routes (54 endpoints)

### Publiques
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion
- `GET /api/listings` — Liste annonces (recherche, filtres, tri)
- `GET /api/listings/{numero}` — Détail annonce

### Authentifiées (Sanctum)
- CRUD Annonces, Enchères, Commandes
- Wallet, Favoris, Messages (→admin), Reviews, Litiges

### Admin
- Dashboard, Gestion users/annonces/catégories
- Publicités, Commission (configurable), Litiges, Factures

## Règles Métier Non Négociables

1. **Pas de messagerie directe** acheteur↔vendeur (anti-collusion)
2. **Toujours via séquestre** — jamais de paiement direct au vendeur
3. **RIB chiffré at-rest** (`encrypted` cast Laravel)
4. **Audit trail immuable** — toutes les transactions dans `wallet_transactions`
5. **Commission centralisée** — UN SEUL service (`EscrowService`), taux configurable
6. **RTL arabe natif** — tous les composants testés FR et AR

## Tests

```bash
# Backend
php artisan test

# Frontend
cd frontend
npm run test
npm run test:e2e    # Playwright
```

## License

Propriétaire — Collection.ma
