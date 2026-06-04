# DevSpace — CONTEXT.md

> This is the project onboarding doc. Read it entirely before any interaction.
> Last updated: 2026-06-04

---

## What is DevSpace

DevSpace is a Developer Dashboard web app that centralizes the most important information of a developer's day:

- **GitHub integration** — open PRs, assigned issues, recent activity
- **Pomodoro Timer** — focus timer integrated with tasks, tracking time spent
- **Task List** — manual tasks with optional link to GitHub issues
- **Technical Notes** — scratchpad per task/project for decisions and quick notes

**Target audience:** individual developers who want a unified view of their work without switching between multiple tools.

---

## Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Angular | 21 (standalone components) |
| Backend | Node.js + Express | Node 22 / Express 5 |
| ORM | Sequelize | v6 |
| Database | PostgreSQL | 17 |
| Auth | GitHub OAuth 2.0 + JWT | — |
| Deploy | Railway (backend + DB) + Vercel (frontend) | — |
| Frontend tests | Jest + Angular Testing Library | — |
| Backend tests | Jest + Supertest | — |

---

## Folder Structure

```
devspace/
├── frontend/                  # Angular 21 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Guards, interceptors, singleton services
│   │   │   ├── features/      # One folder per feature (github, pomodoro, tasks, notes)
│   │   │   │   ├── github/
│   │   │   │   ├── pomodoro/
│   │   │   │   ├── tasks/
│   │   │   │   └── notes/
│   │   │   ├── shared/        # Reusable components, pipes and directives
│   │   │   └── layout/        # Shell, sidebar, header
│   │   └── environments/
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/          # Business logic — never in controllers
│   │   ├── models/            # Sequelize models
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── config/
│   └── tests/
│
├── CONTEXT.md                 # This file
├── ARCHITECTURE.md
└── MVP_SCOPE.md
```

---

## Conventions that MUST NEVER be changed without explicit discussion

### Backend
- **Business logic lives in `services/`**, never in `controllers/`. Controllers only receive the request, call the service, and return the response.
- **All Sequelize models use explicit `field:` mapping** for camelCase (JS) → snake_case (PostgreSQL). Example:
  ```js
  githubId: {
    type: DataTypes.STRING,
    field: 'github_id'
  }
  ```
- **Auth middleware** extracts the token with `req.headers.authorization?.replace('Bearer ', '')` — always use optional chaining.
- **PostgreSQL connection pool:** `max: 5` (Railway free tier).
- **All protected routes** go through the `authenticate` middleware before any controller.
- **Environment variables** accessed via `config/env.js` — never `process.env.X` directly in controllers/services.

### Frontend
- **Standalone components** — do not use NgModules.
- **OnPush change detection** on all list and dashboard components.
- **Signals** for local component state (Angular 21).
- **Services with `inject()`** instead of constructor injection.
- **No business logic in components** — components call services, services contain the logic.
- **RxJS:** use `firstValueFrom()` — never `.toPromise()` (deprecated).
- **HTTP calls** always via `HttpClient` with the auth interceptor already configured in `core/`.

### General
- **Small, descriptive commits** following Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- **Never commit `.env`** — use `.env.example` with all keys but no values
- **Tests before PR** — no PR without tests covering the main flow of the feature

---

## Required Environment Variables

### Backend `.env.example`
```
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/devspace
JWT_SECRET=
JWT_EXPIRES_IN=7d
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_URL=http://localhost:4200
```

### Frontend `environment.ts`
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  githubClientId: ''
};
```

---

## GitHub OAuth — Authentication Flow

```
1. Frontend redirects to: GET /auth/github
2. Backend redirects to GitHub OAuth
3. GitHub redirects to: GET /auth/github/callback?code=XXX
4. Backend exchanges code for access_token via GitHub API
5. Backend finds/creates user in the database using github_id
6. Backend generates JWT and redirects to:
   FRONTEND_URL/auth/callback?token=JWT
7. Frontend stores JWT in localStorage and redirects to /dashboard
```

---

## Anti-Overengineering Principles

This project values **deliberate simplicity**. The simplest solution that solves the problem is the right one.

### Concrete rules

- **No premature abstractions** — do not create interfaces, base classes, or factories "for the future". If there is only one use case, write directly for it.
- **No unnecessary layers** — the stack is controller → service → model. Do not add repositories, DTOs, mappers, or any extra layer without a real justification.
- **No libraries without need** — before installing any package, check if Node.js/Angular already solves it natively. E.g. use native `crypto` instead of a hash lib, use `Date` instead of `moment.js`.
- **No complex cache setup** — in the MVP, an in-memory cache with a simple `Map` and manual TTL is enough. Do not use Redis.
- **No message queues** — simple async operations with `async/await`. No Bull, RabbitMQ, or similar.
- **No microservices** — this is a monolith. One backend, one frontend. Period.
- **No forced OOP** — simple functions are preferred over classes with inheritance when the use case does not require state.
- **Small files** — if a file exceeds ~150 lines, that is a signal to refactor, not to keep adding code.
- **One component, one responsibility** — if an Angular component is fetching data AND rendering AND managing complex state, it needs to be split.
- **Straightforward tests** — test behavior, not implementation. No excessive mocks that make the test more complex than the code.

### Rule of thumb when in doubt
> "The simplest solution that passes the tests is the correct one."
> If there is a way to solve it with less code, choose that.

---

## What the AI agent CAN do
- Implement features within the conventions above
- Write tests for new code
- Suggest refactoring when a file exceeds ~200 lines
- Implement endpoints following the controller → service → model pattern

## What the AI agent MUST NOT do without explicit approval
- Change the folder structure
- Change database conventions (field mappings, pool config)
- Change the authentication flow
- Install new dependencies without listing and justifying them first
- Remove existing tests
