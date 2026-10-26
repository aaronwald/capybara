# Capybara web

The TypeScript web replacement for the retired Android application.

## Commands

Run all commands from `web/`:

```bash
npm install
npm run dev
npm test
npm run test:integration # requires DATABASE_URL
npm run test:browser     # requires DATABASE_URL and Playwright Chromium
npm run lint
npm run typecheck
npm run build
npm run db:migrate
npm run worker:dev
```

## Configuration

Copy `.env.example` to `.env.local`. Supply values outside git.

- `DATABASE_URL` connects the API and worker to PostgreSQL.
- `OPENROUTER_API_KEY` is server-only. The browser never receives it.
- `OPENROUTER_MODEL` sets the deployment default.

## Current implementation

- Next.js 16 App Router with TypeScript.
- Responsive desktop and mobile UI with task, category, and prompt CRUD.
- Ported domain types, wrapper-prompt builder, and return-data parser.
- PostgreSQL schema and tracked SQL migration runner.
- Typed CRUD routes for categories, prompts, and tasks.
- Durable dispatch-job route and PostgreSQL worker.
- Server-only OpenRouter adapter with bounded retries and timeout.
- Liveness, readiness, and OpenRouter model-list routes.
- Vitest contract and API-unit tests.
- PostgreSQL integration tests for concurrent claim, completion/follow-up, delayed retry, stale-job recovery, and deletion during dispatch.
- A Playwright Pixel 7 CRUD test for tasks and categories.
- Standalone production image with web, migration, and worker entry points.

The release workflow gates the image on unit, PostgreSQL integration, and mobile browser tests. The remaining live gates are image publication, Authentik binding, varlab activation, live OpenRouter dispatch, NetworkPolicy verification, GCS backup, and restore. Namespace-scoped SealedSecret manifests already exist in varlab. Authentik and network policy enforcement belong to the varlab deployment.
