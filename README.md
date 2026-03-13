● Voilà le README :  
 --- <div align="center">  
 <img src="./public/logo.png" alt="Lakika Logo" width="200"/>

# Lakika

**Plateforme de streaming vidéo full-stack — Clone Netflix** [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nex tjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](http s://www.typescriptlang.org/) [![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.pr isma.io/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[🌐 Demo](https://lakika.vercel.app) • [📖 Documentation](#documentation)

  </div>

---

## 🎯 À propos

**Lakika** est une plateforme de streaming vidéo full-stack inspirée de Netflix.  
 Elle permet de parcourir et regarder des films et séries, avec un panel
d'administration complet pour gérer les contenus. Les médias sont hébergés sur  
 Cloudflare R2 via uploads sécurisés avec URLs présignées.

---

## ✨ Fonctionnalités

### Pour les utilisateurs

- 🎬 Streaming de films et séries depuis le catalogue
- 🔍 Navigation par genres et catégories
- 🎭 Hero banner animé avec sélection aléatoire
- 📱 Design responsive — mobile, tablette, desktop
- 🔐 Authentification (email/mot de passe)
- 📧 Réinitialisation de mot de passe par email

### Pour les admins

- 🛠️ Dashboard complet de gestion des contenus
- ➕ Ajout / modification / suppression de films, séries et épisodes
- 📤 Upload de vidéos et images via drag & drop
- 🔗 Génération d'URLs présignées pour uploads sécurisés sur S3/R2

---

## 🛠️ Stack Technique

| Couche               | Technologie                       |
| -------------------- | --------------------------------- |
| **Framework**        | Next.js 14 (App Router)           |
| **Langage**          | TypeScript 5                      |
| **Styling**          | Tailwind CSS 3, Shadcn/ui         |
| **Animations**       | Framer Motion, tsParticles        |
| **Base de données**  | PostgreSQL (Neon) + Prisma ORM    |
| **Authentification** | NextAuth v4 + bcrypt              |
| **Stockage**         | Cloudflare R2 (AWS S3 compatible) |
| **API externe**      | TMDB (metadata films/séries)      |
| **Email**            | Resend, EmailJS                   |
| **Forms**            | React Hook Form + Yup             |
| **Déploiement**      | Vercel                            |

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- pnpm ou npm
- PostgreSQL (ou compte [Neon](https://neon.tech))
- Comptes requis : Cloudflare R2, TMDB API, Resend

### Étapes

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/lakika.git
cd lakika

2. Installer les dépendances
pnpm install

3. Configurer les variables d'environnement
cp .env.example .env

# Base de données
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2 / AWS S3
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# TMDB
TMDB_API_KEY=

# Email
RESEND_API_KEY=
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=

4. Initialiser la base de données
pnpm prisma generate
pnpm prisma db push

5. Lancer le serveur de développement
pnpm dev

---
📁 Structure du projet

lakika/
├── app/
│   ├── page.jsx              # Catalogue principal
│   ├── movies/                # Pages films
│   ├── series/                # Pages séries
│   ├── dashboard/            # Panel admin
│   ├── signin/ register/      # Authentification
│   ├── forgotpassword/      # Récupération mot de passe
│   ├── api/                  # Routes API (auth, CRUD, S3)
│   └── component/            # Composants (Navbar, VideoPlayer, Row...)
├── prisma/
│   └── schema.prisma         # Modèles User, Film, Serie, Episode
├── lib/                      # Utilitaires et config Prisma
├── fetches/                  # Fonctions de fetch
└── middleware.js             # CORS + headers de sécurité

---
🔒 Sécurité

- ✅ Hachage des mots de passe avec bcrypt
- ✅ Sessions sécurisées JWT via NextAuth
- ✅ Uploads sécurisés avec URLs présignées (S3/R2)
- ✅ CORS whitelist et CSP headers
- ✅ Protection des routes admin par session

---
📄 License

MIT — voir le fichier LICENSE pour plus de détails.

---
Fait avec ❤️ — Streaming pour tous

⭐ Si ce projet vous a plu, n'hésitez pas à lui donner une étoile !

---
Copie-colle ça dans un fichier README.md à la racine de /projets/lakika/. Tu veux
que je génère les deux autres (META AI et MARKET) ?
```
