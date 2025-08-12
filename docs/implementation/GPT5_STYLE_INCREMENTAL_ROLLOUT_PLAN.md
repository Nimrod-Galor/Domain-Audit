# GPT5-style Incremental Rollout Plan (Step-by-Step)

Date: 2025-08-12
Owner: Engineering (Analyzer & Reporting squads)
Duration: 2–4 weeks incremental (feature-flagged)

## Objectives

- Adopt GPT5-style contracts, scoring, confidence/impact fields, and Playwright-first tests across analyzers.
- Keep repo-aligned paths under `src/analyzers/**` and maintain performance budgets.
- Roll out safely behind flags; defer AI/dashboards to v2.

---

## Guiding principles

- Small, reversible changes; ship value each week.
- Contracts-first: types and scoring are shared and stable.
- Tests drive refactors; Playwright for E2E, Jest for unit/integration.
- No live external sites in tests; use local fixtures.

---

## Phase 0 — Preparation (0.5 day)

Deliverables

- Decision log entry; feature flags; tasks broken down.
  Tasks
- Add engineering decision record (ADR): GPT5-style adoption scope and rationale.
- Create feature flag: `enableUXConversion` and category toggles.
- Create tracking ticket epic and subtasks per phase.
  Acceptance
- ADR merged; flags available in config; tickets created.

---

## Phase 1 — Core contracts & scoring (0.5–1 day)

Deliverables

- Shared data contracts and scoring engine.
  Files (new)
- `src/analyzers/ux-conversion/core/contracts.js`
- `src/analyzers/ux-conversion/core/ux-scoring-engine.js`
- `src/analyzers/ux-conversion/config/scoring-weights.js`
  Tasks
- Define JSDoc types: PageAuditInput, UXPageReport, CategoryReport, UXFinding.
- Implement category weights and composite scoring (0–100) with normalization.
- Add confidence and estimatedImpact fields to findings.
  Acceptance
- Unit tests cover weights, normalization, and signature contracts.

---

## Phase 2 — Analyzer harness & registry wiring (0.5–1 day)

Deliverables

- Orchestrator + pipeline integration (flagged off by default).
  Files (new/updated)
- `src/analyzers/ux-conversion/core/ux-conversion-analyzer.js`
- Analyzer registry integration point (coordinator) to invoke UX analyzer post DOM/network.
  Tasks
- Implement orchestrator to call sub-analyzers in parallel with timeouts.
- Wire into multi-analyzer pipeline guarded by `enableUXConversion` flag.
- Extend site-level report scaffold with `ux` node (empty when disabled).
  Acceptance
- Smoke test shows analyzer hooks up and returns an empty `ux` node when off.

---

## Phase 3 — Foundational utilities & detectors (1 day)

Deliverables

- Cross-cutting utils and minimal detectors.
  Files (new)
- `src/analyzers/ux-conversion/utils/{visibility,contrast,fold,journey-graph,forms}.js`
- `src/analyzers/ux-conversion/detectors/{form,cta,search,not-found,navigation}-detector.js`
  Tasks
- Implement visibility/contrast/fold helpers; journey graph BFS; form semantics.
- Provide detectors with safe timeouts and memoization.
  Acceptance
- Unit tests for utils; detector basic behavior on fixtures.

---

## Phase 4 — First two analyzers: Search & 404 (1–1.5 days)

Deliverables

- `site-search-analyzer.js` and `error-page-analyzer.js` with tests.
  Tasks
- Search: discoverability, semantics, results proxies, mobile checks.
- 404: synthetic missing route, soft-404 vs hard 404, helpful elements, noindex.
- Produce findings with confidence and estimated impact.
- Add Playwright E2E for fixtures; no external sites.
  Acceptance
- JSON report includes `ux.categories.search` and `ux.categories.notFound` with scores and findings.
- P50 analyzer cost < 100ms/page on fixtures.

---

## Phase 5 — Forms & CTAs (1.5–2 days)

Deliverables

- `form-analyzer.js`, `cta-analyzer.js`, rules + tests.
  Tasks
- Forms: labels, autocomplete, input types, field/required counts, validation cues.
- CTAs: above-fold visibility, contrast, size ≥44×44px, hierarchy, conflicts.
- Evidence attachments (bounding boxes, contrast values) in findings.
  Acceptance
- Unit + integration tests green; evidence recorded for at least one flagged CTA/form case.

---

## Phase 6 — Journeys, Lead-gen, Newsletter (1.5–2 days)

Deliverables

- `user-journey-analyzer.js`, `lead-generation-analyzer.js`, `newsletter-analyzer.js`.
  Tasks
- Journeys: link graph metrics, breadcrumbs, path depth to goals, orphans.
- Lead-gen: classify lead forms, consent/privacy visibility, confirmation/next steps.
- Newsletter: minimal fields, consent clarity, placement.
  Acceptance
- Category scores present; top findings show confidence and impact.

---

## Phase 7 — Reporting integration (0.5–1 day)

Deliverables

- JSON and HTML/PDF sections for UX.
  Tasks
- Extend JSON schema with `ux` node: { pageReports[], siteSummary }.
- HTML/PDF: add "UX & Conversion" section with per-category scores and top findings.
- Wire evidence rendering (snippets, bbox overlays if applicable).
  Acceptance
- Reports render UX sections without regressions; validated on test artifacts.

---

## Phase 8 — Performance hardening (0.5 day)

Deliverables

- Budgets, profiling, memoization.
  Tasks
- Enforce < 1.5ms/rule average, < 100ms/page P50 target.
- Add caches for selector heavy paths; trace timings into logs.
- Gate categories by perf flags if needed.
  Acceptance
- Perf tests pass; no category exceeds budget on fixtures.

---

## Phase 9 — Rollout & safeguards (0.5 day)

Deliverables

- Gradual enablement; suppression config.
  Tasks
- Default `enableUXConversion` off in staging; on for canary projects.
- Add rule suppression list in config to mute known false positives.
- Create rollback switch and monitoring dashboard tiles (counters/latency).
  Acceptance
- Canary rollout succeeds; suppression verified; rollback path documented.

---

## Cross-cutting changes

Coding standards

- JSDoc typedefs for public contracts; no implicit `any`.
- Pure functions for heuristics; side-effect free utilities.
- Consistent severity mapping and confidence scoring.

Testing policy

- Jest unit/integration across detectors, utils, scoring.
- Playwright E2E against local fixture pages only.
- Golden JSON snapshots for `UXPageReport`.

CI/CD

- Add jobs for unit, integration, Playwright (headless) and coverage ≥85% for `src/analyzers/ux-conversion/**`.
- Fail builds on perf regression beyond thresholds.

Security/PII

- Redact field values; log structure only.
- No screenshots with PII of form fields; mask inputs when captured.

---

## Work breakdown (tickets)

- ADR & flags [P0]
- Contracts & scoring engine [P0]
- Harness & registry wiring [P0]
- Utils & detectors [P1]
- Search analyzer [P1]
- 404 analyzer [P1]
- Forms analyzer [P1]
- CTA analyzer [P1]
- Journey analyzer [P2]
- Lead-gen analyzer [P2]
- Newsletter analyzer [P2]
- Reporting JSON/HTML [P1]
- Performance hardening [P1]
- Rollout & suppression [P1]

---

## Acceptance checklist (global DoD)

- Flagged analyzer produces UX categories with scores, findings, confidence, impact.
- Coverage ≥85% on `src/analyzers/ux-conversion/**`.
- P50 <100ms/page added overhead; no sensitive data stored/logged.
- JSON/HTML/PDF reports render UX sections.
- Canary rollout with suppression and rollback validated.

---

## Risks & mitigations

- False positives → confidence, rule suppression, selector libraries per CMS.
- Perf regressions → memoize, early aborts, budgets, staged rollout.
- Flaky E2E → local fixtures only; avoid external domains.
- Scope creep → AI/dashboard deferred behind `ai.enabled=false`.

---

## Optional (post-v1)

- ai-integration stubs → real models; SLA <2s response.
- Dashboard pages surfacing UX scores and trends.
- A/B suggestion generator; heatmap overlays.

---

## Try it (optional)

- Enable in dev config: set `enableUXConversion=true` and toggle categories.
- Run tests (CI mirrors):
  - Unit: `npm run test -- ux-conversion`
  - E2E: `npm run test:e2e -- ux-conversion`
