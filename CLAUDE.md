# DevSpace — CLAUDE.md

> This is the single onboarding document for the project.
> Claude Code reads this automatically at the start of every session.
> Do not split this into multiple files. Keep everything here up to date.
> Last updated: 2026-06-04

---

# PART 1 — PROJECT CONTEXT

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
│   │   │   ├── features/      # One folder per feature
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
└── CLAUDE.md                  # This file
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

- **No premature abstractions** — do not create interfaces, base classes, or factories "for the future". If there is only one use case, write directly for it.
- **No unnecessary layers** — the stack is controller → service → model. Do not add repositories, DTOs, mappers, or any extra layer without a real justification.
- **No libraries without need** — before installing any package, check if Node.js/Angular already solves it natively.
- **No complex cache setup** — in the MVP, an in-memory cache with a simple `Map` and manual TTL is enough. Do not use Redis.
- **No message queues** — simple async operations with `async/await`. No Bull, RabbitMQ, or similar.
- **No microservices** — this is a monolith. One backend, one frontend. Period.
- **No forced OOP** — simple functions are preferred over classes with inheritance when the use case does not require state.
- **Small files** — if a file exceeds ~150 lines, that is a signal to refactor, not to keep adding code.
- **One component, one responsibility** — if an Angular component is fetching data AND rendering AND managing complex state, it needs to be split.
- **Straightforward tests** — test behavior, not implementation. No excessive mocks that make the test more complex than the code.

> Rule of thumb: "The simplest solution that passes the tests is the correct one."

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

---

# PART 2 — ARCHITECTURE

## High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL                           │
│              Angular 21 Frontend                    │
│   Dashboard │ GitHub │ Pomodoro │ Tasks │ Notes     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + JWT
┌──────────────────────▼──────────────────────────────┐
│                   RAILWAY                           │
│            Node.js + Express API                    │
│  /auth  │  /github  │  /tasks  │  /notes  │ /timer  │
└──────────┬───────────────────────────────────────────┘
           │ Sequelize ORM
┌──────────▼──────────────────────────────────────────┐
│                   RAILWAY                           │
│              PostgreSQL 17                          │
└─────────────────────────────────────────────────────┘
           │ GitHub REST API v3
┌──────────▼──────────────────────────────────────────┐
│               api.github.com                        │
│    /user  │  /issues  │  /pulls  │  /events         │
└─────────────────────────────────────────────────────┘
```

---

## Data Model

### Table: `users`
```sql
id              SERIAL PRIMARY KEY
github_id       VARCHAR(50) UNIQUE NOT NULL  -- GitHub user ID
username        VARCHAR(100) NOT NULL         -- GitHub login
display_name    VARCHAR(200)                  -- GitHub name
avatar_url      TEXT
github_token    TEXT                          -- OAuth access_token (to call GitHub API)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
**Why `github_id` as unique identifier?** Because a GitHub login can change, but the ID never does.

### Table: `tasks`
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE
title           VARCHAR(500) NOT NULL
description     TEXT
status          VARCHAR(20) DEFAULT 'todo'    -- 'todo' | 'in_progress' | 'done'
github_issue_url TEXT
github_issue_number INTEGER
github_repo     VARCHAR(200)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
**Why VARCHAR and not PostgreSQL enum for `status`?** Simpler to migrate without ALTER TYPE.

### Table: `pomodoro_sessions`
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE
task_id         INTEGER REFERENCES tasks(id) ON DELETE SET NULL
started_at      TIMESTAMP NOT NULL
ended_at        TIMESTAMP
duration_minutes INTEGER
type            VARCHAR(20) DEFAULT 'focus'   -- 'focus' | 'short_break' | 'long_break'
completed       BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```
**Why save to the database?** Client-side timer resets on page refresh. History in the database does not.

### Table: `notes`
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE
task_id         INTEGER REFERENCES tasks(id) ON DELETE SET NULL
title           VARCHAR(500)
content         TEXT
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

---

## API Endpoints

### Auth
```
GET  /auth/github              → redirects to GitHub OAuth
GET  /auth/github/callback     → receives code, returns JWT via redirect
GET  /auth/me                  → returns authenticated user (requires JWT)
POST /auth/logout              → ends session (client-side: removes token)
```

### GitHub (proxy — backend calls GitHub API using the user's stored token)
```
GET  /github/prs               → open PRs where user is author or reviewer
GET  /github/issues            → issues assigned to the user
GET  /github/activity          → last 10 user events
```
**Why proxy?** `github_token` stays in the database, never exposed in the browser.

### Tasks
```
GET    /tasks
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```

### Pomodoro
```
POST   /timer/start
POST   /timer/stop
GET    /timer/history
GET    /timer/today
```

### Notes
```
GET    /notes
POST   /notes
PATCH  /notes/:id
DELETE /notes/:id
```

---

## Security Decisions
- JWT in `localStorage` — acceptable for a personal dev tool.
- `github_token` never leaves the backend.
- CORS restricted to `FRONTEND_URL` in production.
- Helmet.js for security headers.
- Rate limiting on auth routes.

## Performance Decisions
- GitHub API: 5-minute in-memory cache (`Map` with TTL) to avoid rate limits.
- Angular OnPush on all list/dashboard components.
- Pomodoro timer runs locally with `setInterval` — only start/stop hit the backend.

---

## New Feature Flow
```
1. Create Sequelize model → backend/src/models/
2. Create service        → backend/src/services/
3. Create controller     → backend/src/controllers/
4. Register route        → backend/src/routes/
5. Write backend tests   → backend/tests/
6. Create Angular service   → frontend/.../features/X/
7. Create Angular component → frontend/.../features/X/
8. Register route           → app.routes.ts
9. Write frontend tests
```

---

# PART 3 — MVP SCOPE

## MVP Goal

A developer can:
1. Log in with their GitHub account
2. See open PRs, assigned issues, and recent GitHub activity
3. Create and manage a task list for the day
4. Use a Pomodoro timer linked to a task
5. Write technical notes per task

---

## MVP Features — Checklist

### Authentication
- [ ] Login via GitHub OAuth
- [ ] Logout
- [ ] Protected route — redirects to login if not authenticated
- [ ] Display user avatar and name in the header

### Dashboard
- [ ] Widget: Open PRs (max 5, link to GitHub)
- [ ] Widget: Issues assigned to the user (max 5, link to GitHub)
- [ ] Widget: Recent activity (last 5 GitHub events)
- [ ] Widget: Current Pomodoro timer (if active session exists)
- [ ] Widget: Tasks for the day (todo / in_progress / done)

### GitHub Integration
- [ ] List open PRs where user is author
- [ ] List issues assigned to user
- [ ] List last 10 activity events
- [ ] Manual "Refresh" button (no automatic polling)

### Tasks
- [ ] Create task with title
- [ ] Edit title and description
- [ ] Change status: todo → in_progress → done
- [ ] Delete task
- [ ] (Optional) Link task to a GitHub issue URL

### Pomodoro Timer
- [ ] 25-minute focus timer
- [ ] 5-minute short break
- [ ] 15-minute long break
- [ ] Select task before starting
- [ ] Visual/audio notification at end
- [ ] History: pomodoros completed today per task

### Notes
- [ ] Create note (with or without task)
- [ ] Edit note (plain text)
- [ ] Delete note
- [ ] List notes by task

---

## What is NOT in the MVP

| Feature | Reason |
|---|---|
| Jira / Linear / Trello integration | Complex OAuth, not worth initial effort |
| Real-time notifications (WebSocket) | Unnecessary infrastructure complexity |
| Productivity analytics (charts, streaks) | Needs historical data that doesn't exist yet |
| Markdown in notes | Nice-to-have, not essential |
| Offline mode / PWA | High complexity, marginal value |
| Dark mode | Add later with CSS variables |
| Mobile responsive | Desktop-first — it is a dev tool |
| Drag-and-drop on tasks | Not essential |
| Calendar integration | Out of scope |

---

## MVP Complete Criteria

1. Full flow works: Login → see PRs/issues → create task → start Pomodoro → write note → mark task done
2. All tests pass (`npm test` on backend and frontend)
3. App deployed and accessible via public URL
4. README explains local setup and GitHub OAuth configuration

---

## Implementation Phases

```
Phase 1 — Foundation ✅ DONE
Phase 2 — Authentication (GitHub OAuth + JWT + login screen + guard)
Phase 3 — Tasks CRUD
Phase 4 — GitHub Integration
Phase 5 — Pomodoro Timer
Phase 6 — Notes
Phase 7 — Polish + Deploy
```

---

# PART 4 — DESIGN REFERENCE

> This section defines the visual identity of DevSpace.
> The AI agent must follow these decisions when implementing any frontend component.
> Do not deviate from this design system without explicit approval.

---

## Aesthetic Direction

**Dark terminal dashboard** — built for developers who stare at screens for hours.
Clean, dense, informative. Every element earns its place.
No gradients on backgrounds. No rounded hero sections. No marketing fluff.

---

## Color Palette (CSS variables)

```css
:root {
  --bg: #0a0a0f;
  --bg-card: #111118;
  --bg-hover: #1a1a24;
  --border: #1e1e2e;
  --border-bright: #2e2e44;
  --text: #e2e2f0;
  --text-muted: #6b6b8a;
  --text-dim: #3a3a55;
  --accent: #7c6af7;
  --accent-dim: #7c6af720;
  --accent-bright: #a594ff;
  --green: #3dd68c;
  --green-dim: #3dd68c18;
  --yellow: #f0c060;
  --yellow-dim: #f0c06018;
  --red: #f07070;
  --red-dim: #f0707018;
  --blue: #60b0f0;
  --blue-dim: #60b0f018;
}
```

**Rules:**
- `--bg` is the page background — never use pure black or white
- `--bg-card` is every card/panel surface
- `--accent` (purple) is the primary action color — buttons, active states, links
- Semantic colors: `--green` = success/done, `--yellow` = in progress/warning, `--red` = error/delete, `--blue` = info/activity
- Every color has a `-dim` variant (very low opacity) for backgrounds and badges

---

## Typography

```css
/* Display font — titles, navigation, buttons */
font-family: 'Syne', sans-serif;

/* Monospace font — metadata, timestamps, status badges, code */
font-family: 'JetBrains Mono', monospace;
```

**Rules:**
- Syne for all UI text: page titles, nav items, task titles, card headers, buttons
- JetBrains Mono for: timestamps, status labels, handles (@username), counts, section labels, any data that feels "technical"
- Never use Inter, Roboto, Arial, or system fonts
- Import both from Google Fonts

---

## Layout

```
┌─────────────┬──────────────────────────────────────┐
│             │  Page Header (title + actions)        │
│  Sidebar    ├──────────────────────────────────────┤
│  220px      │  3-column grid                        │
│  fixed      │  [Pomodoro] [Tasks (tall)] [GitHub]  │
│             │  [Notes   ] [             ] [Activity]│
└─────────────┴──────────────────────────────────────┘
```

- Sidebar: `220px` fixed, `--bg-card` background, `border-right: 1px solid --border`
- Main content: `padding: 28px 32px`, scrollable
- Grid: `grid-template-columns: 1fr 1fr 1fr`, `gap: 16px`
- Tasks card spans 2 rows (`grid-row: 1 / 3`) — it is the core of the app
- Cards: `border-radius: 12px`, `border: 1px solid --border`, `padding: 20px`

---

## Component Patterns

### Cards
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  transition: border-color 0.15s;
}
.card:hover { border-color: var(--border-bright); }
```

### Card Header
- Left: title in uppercase, 11px, letter-spacing 1.5px, `--text-muted`, with a colored dot
- Right: small action button in `--accent`, JetBrains Mono, 10px

### Status Badges
```css
/* Always JetBrains Mono, 9px, letter-spacing 0.5px */
.status-todo        { background: var(--bg-hover); color: var(--text-muted); }
.status-in-progress { background: var(--yellow-dim); color: var(--yellow); }
.status-done        { background: var(--green-dim); color: var(--green); }
```

### Buttons
- Primary: `background: var(--accent)`, white text, `border-radius: 8px`, Syne 12px bold
- Ghost: `border: 1px solid var(--border-bright)`, `--text-muted`, transparent background
- Hover states always change background slightly — never just change color alone

### Inputs
```css
input {
  background: var(--bg);
  border: 1px solid var(--border-bright);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  color: var(--text);
}
input:focus { border-color: var(--accent); outline: none; }
input::placeholder { color: var(--text-dim); }
```

### Navigation (Sidebar)
- Active item: `background: var(--accent-dim)`, `color: var(--accent-bright)`
- Inactive: `color: var(--text-muted)`, transparent background
- Hover: `background: var(--bg-hover)`, `color: var(--text)`
- Badges: JetBrains Mono 10px, `--accent-dim` background, `--accent-bright` text

---

## Motion

- All transitions: `0.15s` duration, no easing specified (linear is fine)
- Hover on task items: `padding-left: 4px` — subtle slide effect
- Hover on action buttons inside tasks: `opacity: 0` → `opacity: 1`
- Pomodoro active dot: `animation: pulse 1.5s infinite` (opacity 1 → 0.3 → 1)
- No page transition animations in the MVP — keep it simple

---

## What the agent MUST NOT do in the frontend
- Use any color not defined in the CSS variables above
- Use Inter, Roboto, Arial, or any font other than Syne and JetBrains Mono
- Add gradients to backgrounds or cards
- Use `border-radius` larger than `12px` on cards or `8px` on inputs/buttons
- Add shadows (no `box-shadow` in the MVP)
- Add any animation beyond what is described above
- Use any UI component library (no Angular Material, no PrimeNG, no Tailwind)
- Inline styles — always use CSS classes

---

# PART 5 — V2: AZURE DEVOPS INTEGRATION

> This section defines the v2 scope. MVP (v1) is complete and deployed.
> V2 adds Azure DevOps integration via Personal Access Token (PAT).
> All anti-overengineering principles from PART 1 still apply.

---

## What v2 adds

A developer can connect their Azure DevOps account using a Personal Access Token (PAT) and see:
- Work items assigned to them
- Open PRs in their repositories
- Pipeline (CI/CD) status
- Recent commits

---

## Azure DevOps connection model

**No OAuth** — PAT only. This is how VS Code, Postman, and other dev tools connect to Azure DevOps. It is simpler, more reliable in corporate environments, and does not require Azure AD app registration.

The user provides:
- `azureOrganization` — e.g. `softworks-workforce`
- `azurePatToken` — Personal Access Token generated at dev.azure.com

Both are stored in the `users` table (PAT encrypted at rest).

---

## Database changes

### Updated `users` table — new columns:
```sql
azure_organization    VARCHAR(200)   -- e.g. 'softworks-workforce'
azure_pat_token       TEXT           -- encrypted PAT
azure_connected_at    TIMESTAMP      -- when PAT was last saved
```

**Why encrypt the PAT?** It has the same sensitivity as a password — it grants access to the Azure DevOps organization. Use AES-256 via Node.js native `crypto` module. No external encryption library.

---

## New API Endpoints

### Settings
```
GET   /settings/azure          → returns { connected: bool, organization: string|null }
POST  /settings/azure          → saves PAT and organization (encrypts PAT before storing)
DELETE /settings/azure         → removes PAT and organization (disconnects)
```

### Azure DevOps (proxy — backend calls Azure DevOps REST API using stored PAT)
```
GET  /azure/workitems          → work items assigned to user
GET  /azure/prs                → open PRs across all projects
GET  /azure/pipelines          → recent pipeline runs (last 5)
GET  /azure/commits            → recent commits (last 10)
```

**Why proxy?** PAT never leaves the backend — same pattern as GitHub token.

---

## Azure DevOps REST API reference

Base URL: `https://dev.azure.com/{organization}`

Authentication: Basic auth with empty username and PAT as password:
```js
const auth = Buffer.from(`:${patToken}`).toString('base64');
headers: { 'Authorization': `Basic ${auth}` }
```

Key endpoints:
```
Work items:  GET /{org}/{project}/_apis/wit/wiql?api-version=7.0
PRs:         GET /{org}/{project}/_apis/git/pullrequests?api-version=7.0
Pipelines:   GET /{org}/{project}/_apis/pipelines/runs?api-version=7.0
Commits:     GET /{org}/{project}/_apis/git/repositories/{repo}/commits?api-version=7.0
```

---

## New Frontend Pages/Components

### Settings Page (`/settings`)
- New route in app.routes.ts
- New nav item in sidebar: "Settings" (gear icon)
- Form to connect Azure DevOps:
  - Organization URL input (placeholder: `softworks-workforce`)
  - PAT input (password type, never shown after saving)
  - Connect button
  - If connected: shows organization name + "Disconnect" button
  - Connected status shown with green dot

### Azure DevOps Widgets (dashboard)
- `azure-workitems-widget` — work items card (replaces empty space below GitHub card)
- `azure-pipelines-widget` — pipeline status (compact, shows pass/fail/running)
- Each widget shows "Connect Azure DevOps" placeholder if not connected

---

## V2 Implementation Phases

```
Phase 1 — Backend: encryption utility, settings endpoints, Azure DevOps service
Phase 2 — Frontend: Settings page, Azure DevOps service, widgets
Phase 3 — Polish: integrate widgets in dashboard, update sidebar, deploy
```

---

## Cache strategy for Azure DevOps

Same pattern as GitHub — in-memory Map with TTL:
- Work items: 5 minutes
- PRs: 5 minutes  
- Pipelines: 2 minutes (changes more frequently)
- Commits: 5 minutes

Cache key format: `azure:{type}:{userId}`

---

## What the agent MUST NOT do in v2
- Use any external encryption library — Node.js native `crypto` only
- Store the PAT in plain text — always encrypt before saving
- Expose the PAT in any API response — settings GET returns only { connected, organization }
- Add Microsoft OAuth — PAT only
- Add new npm dependencies without explicit justification
