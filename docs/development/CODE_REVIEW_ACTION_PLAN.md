# Code Review Action Plan — Stabilize and Harden Core

This plan turns the code review suggestions into concrete, step‑by‑step tasks with clear acceptance criteria. A few items are already completed and marked accordingly.

Status legend: [ ] Todo, [~] In Progress, [x] Done

## Goals

- Reduce brittleness and noisy logs in long runs and CI.
- Remove subtle correctness risks (ID shadowing, state duplication).
- Improve testability and maintainability.
- Keep changes incremental and low risk.

---

## 0) Fast Wins already applied

- [x] Fix userId shadowing in job queue and use a consistent effective user id for DB/tier tracking.
- [x] Ensure `runInternalCrawl` reuses a provided `pageDataManager` (no hidden manager re-creation).
- [x] Add `document.getElementById` to Cheerio DOM stub to support anchor validation safely.

Acceptance: repo compiles; no new syntax errors; job queue records usage under the correct user; crawling persists to the intended page-data folder.

---

## 1) Centralize logging and control verbosity

Problem: Extensive console logging in crawler and link checks is noisy. We already have `web/lib/logger.js`; core modules use console.

Steps

- [ ] Extract a shared logger wrapper usable from both core and web layers (option A: move to `src/utils/logger.js` and make `web/lib/logger.js` reexport; option B: make `web/lib/logger.js` importable from core by relocating it to `src/shared/logger.js`).
- [ ] Configure levels via env (LOG_LEVEL=info|warn|error|debug). Default to `info` in dev, `warn` in CI.
- [ ] Replace `console.log/warn/error` in:
  - `lib/crawler.js`, `lib/crawler-core.js`
  - `src/dom/dom-processor.js` (guard debug warnings)
  - `web/lib/jobQueue.js` (keep key lifecycle logs at info, failures at error)
- [ ] Keep a short progress log for external link checks (sampled; see Workstream 3).

Acceptance

- Unit run prints 60–80% fewer lines by default.
- Setting LOG_LEVEL=debug restores detailed logs when needed.

---

## 2) Simplify execution context detection in `lib/crawler.js`

Problem: Heuristics and private Node APIs (e.g., `_getActiveHandles`) are fragile.

Steps

- [ ] Change `runCrawl(domain, maxPages, forceNew=false, userLimits={}, options={})` to accept `options.mode: 'cli' | 'server'` and `options.cleanupConnections?: boolean` (default false in server).
- [ ] Remove direct checks of `process._getActiveHandles/_getActiveRequests`. Remove socket destruction loop.
- [ ] Make default behavior: do not call `process.exit()` unless `mode==='cli'`.
- [ ] Update call sites:
  - `bin/domain-audit.js` to pass `{ mode: 'cli' }`.
  - Any web executor (`web/lib/audit-executor.js` or similar) to pass `{ mode: 'server' }`.
- [ ] Add unit test that `runCrawl` does not exit the process in server mode.

Acceptance

- No usage of private Node APIs.
- CLI mode still exits gracefully; server mode never calls `process.exit`.

---

## 3) Tame external link check logging

Problem: Per-link logs are too verbose at scale.

Steps

- [ ] Add `options.verbose` or use the new logger level.
- [ ] Log progress at intervals (every N links or every Y seconds) and on status transitions (start/finish).
- [ ] Retain per-link logging only at `debug` level.

Acceptance

- Default run shows summary lines and periodic progress, not every link.

---

## 4) Prune unused code and align cache metrics

Problem: Small dead code/confusion around multiple caches/metrics.

Steps

- [ ] Remove unused `NodeFilter` constant in `lib/crawler-core.js`.
- [ ] Remove unused `cheerio` import in `lib/crawler-core.js` (DOM processing already handled in `src/dom/dom-processor.js`).
- [ ] Either remove `analysisCache` entirely or connect it to `PerformanceManager` metrics consistently. Prefer removal to reduce mental load; rely on `PerformanceManager.cache` exclusively.
- [ ] Ensure `getPerformanceMetrics()` reports only real caches (PerformanceManager).

Acceptance

- ESLint shows no unused vars/imports in core.
- Metrics reflect actual caches only.

---

## 5) Add ESLint and basic rules to prevent regressions

Steps

- [ ] Add dev deps: eslint, eslint-config-standard, eslint-plugin-import, eslint-plugin-n, eslint-plugin-promise (or a light shared config you prefer).
- [ ] Create `.eslintrc.cjs` with ESM support and rules:
  - `no-shadow: error` (prevents userId bug class)
  - `no-unused-vars: warn`
  - `no-console: off` (we’ll transition to logger but keep off for now)
  - `eqeqeq: error`, `curly: error`
- [ ] Add `npm run lint` and `npm run lint:fix`.
- [ ] Run and fix straightforward warnings in touched files.

Acceptance

- `npm run lint` passes locally.

---

## 6) Tests to add (minimal, high-value)

6.1 JobQueue DI and user tracking

- [ ] New test (e.g., `tests/unit/jobQueue.di.test.js`):

  - Inject mocks for `auditExecutor`, `activeSessions`, `Audit`, `tierService`.
  - Verify when `data` contains `userId`, DB create uses it; otherwise falls back to session.
  - Confirm tierService is called with the same effective id.

  6.2 runInternalCrawl reuses provided manager

- [ ] New test (e.g., `tests/unit/crawler-core.pageDataManager.test.js`):

  - Provide a stubbed CompressedPageDataManager instance and ensure it’s used (spy on `.set`).
  - Confirm no new directories are created beyond the expected domain audit dir.

  6.3 DOM anchor validation path

- [ ] New test (e.g., `tests/unit/dom-processor.anchor.test.js`):
  - HTML with `<a href="#missing"></a>` and no matching id; expect a broken anchor entry.
  - HTML with `<div id="exists"></div><a href="#exists"></a>`; expect no broken anchor for that id.

Acceptance

- New unit tests pass and guard against regressions.

---

## 7) Document GC and runtime flags

Steps

- [ ] Update README: note that `global.gc()` is optional and used only if available; no flag required. If enabling explicit GC (`--expose-gc`), explain pros/cons.
- [ ] Add env flag `ENABLE_GC_HINTS=true|false` to gate GC hints/cooldowns (default true in CLI, false in server if desired).

Acceptance

- README contains a short Troubleshooting/Performance section with GC details.

---

## 8) Test harness improvements for speed/stability

Steps

- [ ] Add `npm run test:unit:quick` to run only unit tests (`tests/unit`) and skip integration.
- [ ] Make CI pipeline stages: unit → integration → web → e2e; fail fast.
- [ ] On CI, set Jest `maxWorkers: 2` and longer timeouts only where needed (already partially configured).

Acceptance

- Faster feedback locally; CI load reduced; fewer timeout-related false negatives.

---

## 9) Configurability for crawler thresholds

Steps

- [ ] Move crawling thresholds (timeouts, MAX\_\* constants) into `src/core/config.js` or reuse `src/core/config.js` if present; thread via options.
- [ ] Expose env overrides for timeouts and parallelism.
- [ ] Add a small doc in README for tuning.

Acceptance

- Core does not rely on hard-coded magic numbers; runtime-tunable via env/options.

---

## Rollout plan

- [ ] Create branch `chore/core-hardening`.
- [ ] Implement Workstreams 1–4 (low risk) and 5 (lint) first; push.
- [ ] Add tests from Workstream 6; push.
- [ ] Update README per Workstream 7; push.
- [ ] Stage CI improvements (Workstream 8) in a follow-up PR if your CI config is external.
- [ ] Configurability (Workstream 9) can be incremental; document env knobs.

Acceptance

- PR passes lint and unit tests; integration tests remain stable or improved.

---

## Commands (PowerShell)

Run unit tests quickly

```powershell
npm run test:unit
```

Jest quick pass (existing minimal)

```powershell
npm run test:quick
```

Run integration tests only

```powershell
npm run test:integration
```

Playwright e2e (headed)

```powershell
npm run test:e2e:headed
```

Lint once and auto-fix

```powershell
npm run lint; npm run lint:fix
```

---

## Notes

- Keep per-link debug logging behind LOG_LEVEL=debug to preserve forensic capability without flooding CI.
- Avoid private Node APIs; prefer explicit mode/options from call sites.
- Prefer removing dead code and unused imports—helps keep signal strong for future PRs.
