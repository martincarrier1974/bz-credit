# Factures carte de crédit (BZ Credit)

Application fullstack de gestion des factures carte de crédit : tableau des dépenses, filtres, totaux, CRUD et validation comptable.

## Stack

- **Monorepo** : npm workspaces
- **Backend** : Node.js, TypeScript, Express, Zod, Prisma
- **Frontend** : Vite, React, TypeScript, TailwindCSS, shadcn/ui (Radix), TanStack Table, React Query
- **Base de données** : SQLite en dev (par défaut), Postgres en prod (Railway) via `DATABASE_URL`

## Prérequis

- Node.js 18+
- npm 9+

## Installation

```bash
# À la racine du monorepo
npm install
```

## Variables d'environnement

### API (`apps/api`)

Créez `apps/api/.env` (optionnel en dev) :

```env
# Dev : SQLite (défaut si absent)
DATABASE_URL="file:./dev.db"

# Prod : Postgres (ex. Railway)
# DATABASE_URL="postgresql://user:password@host:5432/dbname"

PORT=3001
```

- **Développement** : si `DATABASE_URL` n’est pas défini, l’API utilise `file:./dev.db` (fichier créé dans `apps/api/prisma/` après la première migration).
- **Production** : définissez `DATABASE_URL` avec une URL Postgres. Pour utiliser Postgres, changez le `provider` dans `apps/api/prisma/schema.prisma` de `sqlite` à `postgresql` avant de déployer.

## Base de données

### Migrations

```bash
# À la racine
npm run db:migrate
```

Exécute `prisma migrate deploy` dans `apps/api`. Assurez-vous que `DATABASE_URL` est défini (ou que le défaut SQLite est utilisé).

### Seed (données de base)

```bash
npm run db:seed
```

Ajoute des employés, fournisseurs, catégories, comptes GL et quelques dépenses de test.

### Prisma Studio

```bash
npm run db:studio
```

Ouvre l’interface Prisma Studio sur la base configurée.

## Développement

```bash
# À la racine : lance l’API (port 3001) et le frontend (port 5173) en parallèle
npm run dev
```

- **API** : http://localhost:3001  
- **Web** : http://localhost:5173 (proxy `/api` → API)

Prérequis : avoir exécuté au moins une fois `npm run db:migrate` et éventuellement `npm run db:seed`.

## Build

```bash
npm run build
```

Compile le package `shared`, l’API et le frontend.

## Scripts disponibles (racine)

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm run dev` | Lance l’API + le frontend en mode développement |
| `npm run build` | Build de tous les workspaces                   |
| `npm run db:migrate` | Applique les migrations Prisma (API)      |
| `npm run db:studio`  | Ouvre Prisma Studio                        |
| `npm run db:seed`    | Seed des données de base (API)            |
| `npm run format`     | Formatage Prettier                         |

## Logo

Pour afficher un logo dans le header :

- Placez votre fichier **`logo.png`** dans `apps/web/src/assets/logo.png`.
- Si le fichier est absent ou ne charge pas, un fallback « BZ » s’affiche.

## Structure

```
/
├── package.json          # workspaces
├── apps/
│   ├── api/              # Express + Prisma
│   └── web/              # Vite + React
└── packages/
    └── shared/           # Types Zod + TS partagés
```
