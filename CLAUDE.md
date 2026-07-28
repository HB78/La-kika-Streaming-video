# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Lakika** — plateforme de streaming vidéo full-stack (clone Netflix). Next.js 14 App Router, JavaScript/JSX (pas de TypeScript dans le code applicatif malgré la présence de `typescript` en devDep), PostgreSQL via Prisma, auth NextAuth, médias hébergés sur Cloudflare R2 (compatible AWS S3).

## Commandes

```bash
npm run dev      # serveur de dev (Next.js avec --turbo)
npm run build    # build de production
npm run start    # serveur de production
npm run lint     # eslint (next lint)
```

Base de données (Prisma) :

```bash
npx prisma generate   # régénère le client (aussi lancé en postinstall)
npx prisma db push    # applique le schéma sans migration
npx prisma migrate dev --name <nom>   # crée + applique une migration
npx prisma studio     # interface d'inspection de la BDD
```

Il n'y a pas de suite de tests dans ce projet.

## Architecture

### Deux sources de données distinctes

Le projet mélange deux origines de contenu, c'est le point le plus important à comprendre :

1. **TMDB (API externe)** — métadonnées de films/séries pour la page d'accueil. Les URLs sont centralisées dans `Request.js` à la racine (utilise `process.env.API_KEY`). Ces données ont des champs `title` (films) OU `name` (séries) — attention aux deux formats.
2. **Base de données interne (Prisma/PostgreSQL)** — le vrai catalogue uploadé via le dashboard admin (modèles `Film`, `Serie`, `Episode`). Récupéré via les routes API internes.

### Flux de fetch (particularité importante)

Les Server Components ne lisent PAS Prisma directement : ils passent par les routes API internes via `fetch`. Les fonctions de `fetches/fetches.js` fetchent `${process.env.NEXTAUTH_URL}/api/...` — donc **`NEXTAUTH_URL` doit être correctement défini même en local**, sinon les fetches internes échouent. Le revalidate se fait par tags (`revalidateTag("fetchMovies")` / `"fetchSeries"`), déclenchés dans les routes POST après création.

Certaines fonctions de delete dans `fetches.js` pointent en dur vers `https://lakika.vercel.app` (pas `NEXTAUTH_URL`) — à garder en tête si un delete semble taper la prod depuis le local.

### Authentification & autorisation

- NextAuth v4, stratégie **JWT** (`maxAge` 4h), `CredentialsProvider` (email + bcrypt). Config dans `app/api/auth/[...nextauth]/route.js`, qui exporte `authOptions` (importé ailleurs pour `getServerSession`).
- Le flag `isAdmin` est porté dans le token JWT ET la session.
- **Protection admin** : les routes qui modifient la BDD doivent vérifier l'admin. Deux patterns coexistent — le helper `lib/dryApiFunction/isAdmin.js` (retourne une `NextResponse`, on teste `.status !== 200`) et une vérification inline répétée dans certaines routes (ex. `app/api/video/route.js`). Le helper re-vérifie `isAdmin` en base et ne se fie pas qu'à la session — préférer ce helper pour toute nouvelle route protégée.

### Upload de médias (R2/S3)

Flux en deux temps : le client demande une **URL présignée** à `app/api/presigned-url/route.js` (protégée admin, expire en 2h), puis uploade le fichier directement sur R2 avec cette URL, et enregistre ensuite l'URL finale en BDD via la route CRUD correspondante. Le client S3 cible R2 avec `region: "auto"`.

### Prisma singleton

Toujours importer le client via `@/lib/singleton/prisma` (pattern singleton anti hot-reload). Ne jamais instancier `new PrismaClient()` ailleurs.

### Middleware

`middleware.js` s'applique uniquement à `/api/:path*` (voir `config.matcher`). Il fait une **whitelist CORS d'origines** (`lakika.vercel.app` + `localhost:3000`) — une origine hors liste reçoit un 403 — et pose les headers CSP (plus permissifs en dev qu'en prod).

## Conventions

- **Alias d'import** : `@/*` → racine du projet (défini dans `jsconfig.json`). Ex. `@/lib/singleton/prisma`.
- **Composants** : dans `app/component/` (au singulier), avec un sous-dossier `app/component/ui/` pour les primitives type Shadcn. Les Server Components qui doivent forcer le rendu dynamique déclarent `export const dynamic = "force-dynamic"`.
- **Modèles Prisma** en PascalCase, mappés vers des tables snake_case pluriel via `@@map` (`Film` → `films`). Champs relationnels également remappés (`@map`).
- Les commentaires du code sont en français et souvent explicatifs/pédagogiques — c'est volontaire, les conserver.
- Config Next images (`next.config.mjs`) : tout nouveau host d'image distant doit être ajouté à `images.remotePatterns` sinon `next/image` refusera de le charger.

## Variables d'environnement

Nécessaires (voir `.env`) : `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `API_KEY` (TMDB), les credentials R2/S3 (`AWS_S3_API_URL`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `R2_URL`), et les clés email (Resend/EmailJS).
