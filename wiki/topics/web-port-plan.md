---
type: topic
sources: [requirements-app, requirements-repo-rules]
created: 2026-10-25
updated: 2026-10-26
---

# Web port implementation plan

**Status 2026-10-26:** wald approved web-only delivery with no Android overlap. Phase 0 and Phase 1 are complete. Phase 2 and Phase 3 code are complete but still need a PostgreSQL integration run and live OpenRouter dispatch. Phase 4 UI wiring is complete: task/category/prompt CRUD, model choice, dispatch, polling, results, and errors use the API; browser tests remain. Phase 5 is staged but inactive: the standalone container build and image workflow exist in capybara; varlab has a Helm chart, verified render, render workflow, and ArgoCD draft outside `argocd/apps`. No cluster change occurred. Image publication, sealed secrets, deployment, backup, restore, and live verification remain. `web/` has 16 green unit tests, zero npm audit findings, and passing lint, typecheck, and production builds. The mandatory `openai/gpt-5.6-sol` ponytail review passed after six review/fix rounds. Sealed manifests exist. The tag workflow gates image publication on PostgreSQL integration and Pixel 7 browser tests. Release 0.1.0 stopped safely before publication when clean-checkout route types were absent; `typecheck` now runs `next typegen`, 0.1.1 then stopped safely before publication because `tsx` treated top-level awaits as CommonJS. Executable entry points now use async `main()` functions, 0.1.2 passed migrations and then stopped at a worker test alias. Worker executables now use relative imports, 0.1.3 reached PostgreSQL integration and exposed stale-recovery and enum-parameter SQL bugs. Recovery now uses a transaction and retry status uses explicit typing; 0.1.4 is the deployment target.

This plan turns the assessment in [[web-port-homelab]] into release steps. The web app replaces the Android [[capybara]] app. Remove the Android build before web implementation starts. Do not maintain or deploy both platforms at the same time. The first web release uses [[openroute]] only.

The plan uses information from the `varlab` repository. No varlab source is in `raw/` yet. The varlab claims in this page are provisional until wald adds a source.

## Proposed scope

Use these defaults for the first release:

- Tag the final Android revision.
- Remove the Android app before web implementation starts.
- Do not add Android synchronization.
- Do not import Android state unless wald requests a one-time export before removal.
- Put the web code in `web/` in the capybara repository.
- Put the Kubernetes configuration in the varlab repository.
- Use Next.js with TypeScript.
- Use PostgreSQL for durable state and dispatch jobs.
- Use Authentik forward authentication.
- Use `openai/gpt-5.6-sol` as the initial model.
- Use OpenRouter as the only dispatch target.
- Use a separate worker process for dispatch jobs.
- Use one web replica and one worker replica for the first release.

These defaults do not remove [[hermes]] or [[muse]] from the product backlog. The deployed Hermes service in varlab runs a Telegram gateway. It does not expose the OpenAI-compatible proxy that capybara needs. Do not add Hermes to this release.

## Requirement changes

Wald must approve these proposed requirements before implementation. The raw source stays unchanged because the human owns `raw/`.

- A1.1 is superseded. The app does not require Android.
- A1.3 The system provides a web app.
- A1.4 The web app runs in the varlab homelab.
- A1.5 The project supports the web app only.
- A6.2 The server keeps dispatch credentials outside the application image and source code.
- A6.3 The browser does not receive dispatch credentials.
- A8.1 The web app requires authentication.
- A8.2 The web app uses the homelab identity provider.
- A8.3 The server records task and dispatch state in a durable database.
- A8.4 The server processes dispatch jobs outside the web request.
- A8.5 The web app shows the current dispatch state.

Run an [[adversarial-review]] before each release. Use `openai/gpt-5.6-sol` per [[requirements-repo-rules]].

## Target architecture

```text
browser
  |
  | HTTPS + Authentik
  v
Traefik ingress
  |
  v
Next.js web/API ----------> PostgreSQL
  |                             ^
  | create dispatch job         | claim/update job
  v                             |
PostgreSQL <--------------- dispatch worker
                                |
                                | HTTPS + sealed API key
                                v
                            OpenRouter
```

The API is the system boundary. The browser never calls OpenRouter. The worker reads the key from a Kubernetes Secret. The worker writes every result and follow-up in one database transaction.

Do not add NATS in the first release. Use a PostgreSQL job table. Let the worker claim jobs with `FOR UPDATE SKIP LOCKED`. This design gives a durable queue without one more service.

## Data model

Create these tables:

- `categories`: `id`, `name`, `created_at`, `updated_at`.
- `prompts`: `id`, `name`, `text`, `created_at`, `updated_at`.
- `tasks`: `id`, `title`, `description`, `category_id`, `due_date`, `prompt`, `status`, `result_text`, `error`, `created_at`, `updated_at`.
- `dispatch_jobs`: `id`, `task_id`, `target`, `model`, `status`, `attempts`, `last_error`, `created_at`, `started_at`, `finished_at`.

Use UUID values for new identifiers. Keep the task status values from [[task]]: `draft`, `dispatched`, `done`, and `failed`.

Delete the tasks in a category when the user deletes the category. This behavior matches the Android store. Do not delete a prompt from tasks that already copied its text.

Add a unique active-job constraint for each task. This constraint prevents two dispatches for one task at the same time.

## API contract

Provide these routes:

- `GET|POST /api/categories`
- `PATCH|DELETE /api/categories/{id}`
- `GET|POST /api/prompts`
- `PATCH|DELETE /api/prompts/{id}`
- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/{id}`
- `POST /api/tasks/{id}/dispatch`
- `GET /api/tasks/{id}/dispatch`
- `GET /api/models`
- `GET /api/health/live`
- `GET /api/health/ready`

Validate every request on the server. Return a stable JSON error shape. Reject mutation requests with an invalid `Origin` header. Do not return environment variables, keys, raw provider responses, or stack traces.

The dispatch route must do these actions in one transaction:

1. Verify that the task is not already dispatched.
2. Set the task status to `dispatched`.
3. Clear the old result and error.
4. Create one pending dispatch job.
5. Return HTTP 202.

The worker must do these actions:

1. Claim one pending job.
2. Build the existing [[wrapper-prompt]].
3. Call OpenRouter.
4. Validate the return schema.
5. Update the parent task.
6. Create follow-up tasks as drafts.
7. Mark the job complete.

If a call or parse fails, the worker must mark the task and job as failed. The worker must keep the error. The UI must show the error per the approved A7 requirements in [[app-requirements-proposals]].

## Repository layout

Create these paths in capybara:

```text
web/
  app/
  components/
  lib/domain/
  lib/db/
  lib/dispatch/
  worker/
  migrations/
  tests/
  Dockerfile
  package.json
.github/workflows/web-build.yaml
```

Create these paths in varlab:

```text
charts/capybara/
rendered/capybara/manifests.yaml
argocd/apps/capybara.yaml
.github/workflows/capybara-render.yaml
```

Keep source code in capybara. Keep cluster state in varlab. Push the application image to `ghcr.io/aaronwald/capybara`.

## Delivery phases

### Phase 0 — retire Android and approve the boundary

- Approve the proposed requirements.
- Record the decision to support the web app only.
- Decide if existing device data needs a one-time export. Use no export as the default.
- Tag the final Android revision.
- Export device state only if wald requests it.
- Remove the Android module and Android build files from the active branch.
- Remove Android-only tests and simulator instructions.
- Confirm the hostname `capybara.varshtat.com`.
- Confirm PostgreSQL as the state store.
- Confirm OpenRouter as the only first-release target.

Keep the git history. Keep the wiki record of the Android MVP.

**Exit:** The active branch contains no Android application or Android build. Wald records the web platform decisions.

### Phase 1 — port the domain contract

- Scaffold the Next.js TypeScript app.
- Port `Task`, `Category`, `Prompt`, `FollowUp`, and `ReturnData`.
- Port `wrapperPrompt()` and `parseReturnData()`.
- Port all cases from `DispatchTest.kt`.
- Add tests for plain JSON, fenced JSON, invalid JSON, and invalid status.

**Exit:** The TypeScript contract tests match the Kotlin behavior.

### Phase 2 — add PostgreSQL and CRUD

- Add migrations for the four tables.
- Add database integration tests.
- Add category, prompt, and task routes.
- Preserve the Android delete behavior.
- Seed the `General` category.
- Add liveness and readiness routes.

**Exit:** API tests cover task, category, and prompt CRUD.

### Phase 3 — add durable dispatch

- Add the job creation route.
- Add the PostgreSQL worker loop.
- Add the OpenRouter adapter.
- Read the model from each job.
- Read the API key from the process environment.
- Add retry limits and timeouts.
- Write follow-ups and the parent result in one transaction.
- Add wire-shape tests for HTTP failure and bad provider data.

Use three attempts for temporary network and HTTP 429 or 5xx failures. Do not retry schema failures or other HTTP 4xx failures.

**Exit:** An integration test changes a draft task to done and creates its follow-up. Failure tests change the task to failed.

### Phase 4 — port the user interface

- Add the task list and category filter.
- Keep the `Hide done` control.
- Add task create, edit, and delete flows.
- Add prompt library CRUD.
- Add dispatch target and model controls.
- Disable targets that are not available.
- Poll a dispatched task until it reaches done or failed.
- Show result text and errors.
- Use responsive layouts for a Pixel-size viewport and a desktop viewport.

**Exit:** Browser tests cover create, edit, dispatch, result, follow-up, failure, and page reload.

### Phase 5 — build and deploy

- Add a multi-stage Dockerfile with Next.js standalone output.
- Run the web process and worker process from the same image.
- Add a capybara image-build workflow in the capybara repository.
- Copy the proven teamwald chart pattern in varlab.
- Add a web Deployment, worker Deployment, Service, Ingress, PostgreSQL StatefulSet, PVC, and NetworkPolicy.
- Add the Authentik middleware to the Ingress.
- Add a SealedSecret for the OpenRouter key and database password.
- Add the ArgoCD Application and rendered-manifest workflow.
- Pin all production image tags.

The NetworkPolicy must allow these paths only:

- Traefik to the web pod.
- The web and worker pods to PostgreSQL.
- The worker pod to DNS and external HTTPS.
- The web pod to DNS and external HTTPS only if `/api/models` uses the live OpenRouter model list.

**Exit:** ArgoCD reports healthy. Authentik protects every app and API route. The browser can complete one live dispatch.

### Phase 6 — protect and observe the service

- Add PostgreSQL backups.
- Test one restore in a temporary namespace.
- Add structured logs with task and job identifiers.
- Do not log prompts, result text, keys, or raw provider replies by default.
- Add metrics for pending jobs, dispatch duration, successful jobs, and failed jobs.
- Add an alert for old pending jobs and repeated failures.
- Add resource requests and limits.

**Exit:** A restore test passes. Grafana shows dispatch health. An induced failure reaches the configured alert path.

### Phase 7 — release

- Run unit, integration, and browser tests.
- Run the [[adversarial-review]].
- Fix release-blocking findings.
- Test login, CRUD, live dispatch, follow-up creation, failure handling, and persistence.
- Restart the web and worker pods.
- Confirm that state remains.
- Record the release in the wiki.

**Exit:** Wald accepts the web MVP.

## Deferred work

Do not include these items in the first release:

- Multi-user data isolation.
- Hermes dispatch.
- Muse dispatch.
- NATS or another queue.
- Push notifications.
- Offline web support.
- Import of Android `state.json` after Phase 0.
- Raw provider-response display.

Add a user identifier before more than one person stores private tasks.

## Estimate

- Phase 0: one to two hours.
- Phases 1 and 2: one focused day.
- Phase 3: one focused day.
- Phase 4: one to two focused days.
- Phases 5 and 6: one focused day.
- Phase 7: half a day.

The expected total is four to six focused days. A weekend prototype can skip browser tests, metrics, restore verification, and worker retries. Do not call that prototype a release.

## First implementation slice

Start with Phase 0. Commit the Android removal by itself. Then start Phase 1. The first web pull request should contain only the web scaffold, domain types, wrapper parser, and tests. This slice has no credentials and no deployment risk.

## Related
- [[web-port-homelab]], [[capybara]], [[requirements-app]], [[requirements-repo-rules]], [[mvp-implementation]], [[app-requirements-proposals]], [[task]], [[wrapper-prompt]], [[credential-management]], [[openroute]], [[hermes]], [[muse]], [[adversarial-review]], [[openai-sol]]
