# NHCE

A full-stack web application built with **Next.js, NestJS, Prisma, and PostgreSQL (Supabase)**.

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* NestJS
* Prisma ORM

### Database

* PostgreSQL
* Supabase

---

# Project Structure

```text
nhce/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
│
├── packages/         # Shared packages (if required later)
│
├── package.json
├── package-lock.json
└── .gitignore
```

---

# Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git

Check your versions:

```bash
node --version
npm --version
git --version
```

---

# 1. Fork the Repository

Fork the repository to your own GitHub account:

```text
https://github.com/atharvaajoshii/nhce
```

Then clone **your fork**:

```bash
git clone https://github.com/<your-username>/nhce.git
cd nhce
```

Add the original repository as `upstream`:

```bash
git remote add upstream https://github.com/atharvaajoshii/nhce.git
```

Verify:

```bash
git remote -v
```

You should see:

```text
origin    https://github.com/<your-username>/nhce.git
upstream  https://github.com/atharvaajoshii/nhce.git
```

`origin` = your fork

`upstream` = original NHCE repository

---

# 2. Install Dependencies

From the project root:

```bash
npm install
```

This installs the root/workspace dependencies.

If required, you can also install dependencies inside the applications:

```bash
cd apps/web
npm install

cd ../api
npm install

cd ../..
```

---

# 3. Environment Variables

The backend requires environment variables for the Supabase PostgreSQL database.

Inside:

```text
apps/api/
```

create:

```text
.env
```

Add:

```env
DATABASE_URL="YOUR_SUPABASE_DATABASE_URL"
DIRECT_URL="YOUR_SUPABASE_DIRECT_URL"
```

### Important

Do **not** commit `.env`.

Never push database passwords or credentials to GitHub.

The repository's `.gitignore` already ignores environment files.

If you need the development database credentials, contact the project maintainer.

---

# 4. Prisma Setup

Go to the backend:

```bash
cd apps/api
```

Validate the Prisma schema:

```bash
npx prisma validate
```

Sync the schema with the development database:

```bash
npx prisma db push
```

Generate Prisma Client:

```bash
npx prisma generate
```

You should see:

```text
The schema at prisma/schema.prisma is valid
```

and:

```text
The database is already in sync with the Prisma schema.
```

---

# 5. Start the Backend

From:

```text
apps/api
```

run:

```bash
npm run start:dev
```

The NestJS API runs on:

```text
http://localhost:3001
```

Keep this terminal running.

---

# 6. Start the Frontend

Open another terminal.

From the project root:

```bash
cd ~/Projects/nhce
```

Run:

```bash
npm run dev:web
```

The frontend runs on:

```text
http://localhost:3000
```

---

# 7. Running Both Applications

You need two terminals during development.

### Terminal 1 — Backend

```bash
cd apps/api
npm run start:dev
```

### Terminal 2 — Frontend

```bash
npm run dev:web
```

Architecture:

```text
Browser
   │
   ▼
Next.js
localhost:3000
   │
   │ HTTP/API
   ▼
NestJS
localhost:3001
   │
   ▼
Prisma
   │
   ▼
Supabase PostgreSQL
```

---

# Git Workflow

We use a **Fork → Branch → Pull Request → Review → Merge** workflow.

## Branches

### `main`

Stable/production branch.

### `dev`

Development/integration branch.

Do not directly push feature work to `main` or `dev`.

---

# Creating a Feature Branch

First make sure your local `dev` is up to date:

```bash
git fetch upstream
git switch dev
git pull --ff-only upstream dev
```

Create your feature branch:

```bash
git switch -c feature/<feature-name>
```

Examples:

```bash
git switch -c feature/authentication
git switch -c feature/dashboard
git switch -c feature/job-posting
```

---

# Commit Your Changes

Check your changes:

```bash
git status
```

Stage them:

```bash
git add .
```

Commit:

```bash
git commit -m "Add <feature>"
```

Example:

```bash
git commit -m "Add user authentication"
```

---

# Push Your Feature Branch

Push it to your fork:

```bash
git push -u origin feature/<feature-name>
```

Example:

```bash
git push -u origin feature/authentication
```

---

# Create a Pull Request

After pushing your branch, open GitHub.

Create a Pull Request from:

```text
your-fork
feature/<feature-name>
        ↓
atharvaajoshii/nhce
dev
```

Do **not** create feature PRs directly into `main`.

The normal flow is:

```text
feature branch
      ↓
     PR
      ↓
     dev
      ↓
 testing
      ↓
     PR
      ↓
    main
```

---

# Keeping Your Branch Updated

Before starting new work:

```bash
git fetch upstream
git switch dev
git pull --ff-only upstream dev
```

Then create your feature branch from the updated `dev`:

```bash
git switch -c feature/<feature-name>
```

---

# Important Rules

### 1. Never commit `.env`

```text
.env
.env.local
```

must remain private.

### 2. Don't push directly to `main`

Use Pull Requests.

### 3. Don't push directly to `dev`

Feature branches should go through PRs.

### 4. Keep commits focused

Prefer:

```text
Add authentication API
```

over:

```text
final changes
```

### 5. Pull before starting new work

Always start your feature branch from the latest `dev`.

### 6. Don't modify database schema casually

If you modify:

```text
apps/api/prisma/schema.prisma
```

coordinate with the team before applying database changes.

---

# Useful Commands

### Check branches

```bash
git branch
```

### Check remotes

```bash
git remote -v
```

### Get latest changes

```bash
git fetch upstream
```

### Update dev

```bash
git switch dev
git pull --ff-only upstream dev
```

### Create feature branch

```bash
git switch -c feature/<name>
```

### Push feature branch

```bash
git push -u origin feature/<name>
```

### Check current changes

```bash
git status
```

---

# Development Checklist

Before starting development:

```text
✓ Fork repository
✓ Clone your fork
✓ Add upstream remote
✓ Install dependencies
✓ Create apps/api/.env
✓ Configure Supabase credentials
✓ Run Prisma validation
✓ Start NestJS
✓ Start Next.js
✓ Create feature branch
✓ Work on feature
✓ Push feature branch
✓ Open PR to dev
```

---

## Repository

Original repository:

https://github.com/atharvaajoshii/nhce

Happy coding! 🚀
THis is a check .