# DevSpace

A developer dashboard that centralizes GitHub activity, tasks, Pomodoro focus sessions, and technical notes in one place.

## Tech Stack

- Frontend: Angular 21 (standalone components, signals)
- Backend: Node.js + Express
- Database: PostgreSQL (Railway)
- Auth: GitHub OAuth 2.0 + JWT
- Deploy: Railway (backend) + Vercel (frontend)

## Local Setup

### Prerequisites

- Node.js 22+
- PostgreSQL, local or Railway
- GitHub OAuth App

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/devspace
cd devspace
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill `backend/.env` with:

```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=7d
GITHUB_CLIENT_ID=<from github.com/settings/developers>
GITHUB_CLIENT_SECRET=<from github.com/settings/developers>
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_URL=http://localhost:4201
```

### 3. Frontend setup

```bash
cd frontend
npm install
ng serve
```

The local frontend runs on `http://localhost:4201`.

### 4. Create GitHub OAuth App

Go to `github.com/settings/developers` and create a new OAuth App:

- Homepage URL: `http://localhost:4201`
- Callback URL: `http://localhost:3000/auth/github/callback`

Copy the Client ID and Client Secret to `backend/.env`.

## Running Tests

```bash
cd backend && npm test
cd frontend && ng test --watch=false
```

## Deploy

### Backend on Railway

1. Push all code to GitHub.
2. Create a new project on Railway.
3. Add a PostgreSQL service.
4. Deploy the backend from the GitHub repo with root directory `backend/`.
5. Set all variables from `backend/.env.example` in the Railway dashboard.
6. Set `GITHUB_CALLBACK_URL` to `https://your-railway-url.railway.app/auth/github/callback`.
7. After frontend deploy, set `FRONTEND_URL` to the Vercel URL.

### Frontend on Vercel

1. Import the repo on Vercel.
2. Set root directory to `frontend/`.
3. Configure the frontend API URL to point at the Railway backend.
4. Deploy.
5. Copy the Vercel URL and update `FRONTEND_URL` in Railway.

### Production GitHub OAuth App

Update your GitHub OAuth App:

- Homepage URL: `https://your-vercel-url.vercel.app`
- Callback URL: `https://your-railway-url.railway.app/auth/github/callback`

## MVP Verification

- Login with GitHub works on the production URL.
- Dashboard loads GitHub data.
- Tasks can be created, updated, and deleted.
- Pomodoro starts, counts down, stops, and saves sessions.
- Notes can be created, edited, and deleted.
- Sidebar navigation works.
- Desktop UI matches the dark terminal dashboard design.

## Azure DevOps Integration

1. Go to `dev.azure.com` → User Settings → Personal Access Tokens
2. Create a token with scopes: **Work Items (Read)**, **Code (Read)**, **Build (Read)**
3. In DevSpace → **Settings** → paste your organization name and PAT → Connect
4. Work items and pipeline status will appear on the dashboard automatically
