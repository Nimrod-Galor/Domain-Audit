# Advanced UX & Conversion Analysis — Merged Implementation Plan (Repo-aligned)

Date: 2025-08-12
Timeframe: 2–3 weeks (3 sprints)
Owner: UX/Conversion Feature Squad
Priority: Medium (High business impact)

---

## Executive summary

This plan merges the strongest elements of the GPT5 and CLAUDE proposals:

- Keep CLAUDE’s repo-aligned directory structure under `src/analyzers/ux-conversion/**` for better fit with the existing codebase.
- Adopt GPT5’s explicit data contracts, category weights, scoring model, and Playwright-based testing strategy for reliability and performance.
- Defer AI prediction/dashboards to v2 and keep light interfaces behind flags; ship a robust heuristic analyzer first.

Scope (v1):

- Site search, 404 quality, user journeys, forms, CTAs, lead-gen, newsletter.
  Out of scope (v1): live A/B inference, email deliverability, external live-site tests, dashboard routes, AI predictions (flagged off).

---

## Architecture & directory layout

Root: `src/analyzers/ux-conversion/`

- core/
  - ux-conversion-analyzer.js — entry; orchestrates sub-analyzers, scoring, reporting payload
  - contracts.js — JSDoc types for inputs/outputs
  - ux-scoring-engine.js — category weights, normalization, composite scores
- analyzers/
  - site-search-analyzer.js
  - error-page-analyzer.js
  - user-journey-analyzer.js
  - form-analyzer.js
  - cta-analyzer.js
  - lead-generation-analyzer.js
  - newsletter-analyzer.js
- detectors/
  - form-detector.js
  - cta-detector.js
  - navigation-detector.js
  - search-detector.js
  - not-found-detector.js
- utils/
  - visibility.js (display/opacity/overlap/z-index)
  - contrast.js (WCAG AA/AAA)
  - fold.js (above-the-fold estimation)
  - journey-graph.js (internal link graph metrics)
  - forms.js (semantics, autocomplete, types)
- config/
  - ux-standards.js (heuristic thresholds/best practices)
  - scoring-weights.js (category and rule weights)
  - ux-conversion-config.js (feature flags, timeouts)
- ai-integration/ (Deferred; stubs only)
  - ux-intelligence.js (placeholder; disabled by default)

Tests

- tests/unit/ux-conversion/\*_/_.test.js (Jest)
- tests/integration/ux-conversion/\*_/_.test.js (Jest + local fixtures)
- tests/e2e/ux-conversion/\*_/_.spec.js (Playwright)

Notes

- Aligns with existing `src/analyzers/**` pattern.
- Uses Playwright only (no Puppeteer) to match repo tooling.

---

## Data contracts (JSDoc-style)

Input (per page): PageAuditInput

- url: string
- dom: SerializedDomSnapshot
- viewport: { width: number, height: number }
- performance: { lcpMs?: number, tbtMs?: number, cls?: number }
- network: Array<{ url, type, status, sizeBytes, start, end }>
- jsErrors: Array<{ message, stack, sourceUrl, line, col }>
- links: Array<{ href, rel, text, position }>
- forms: Array<FormMeta>
- screenshots?: { viewportPng?: Buffer }
- httpStatus: number
- headers: Record<string,string>

Output (per page): UXPageReport

- score: number (0–100)
- categories: {
  - search: CategoryReport
  - notFound: CategoryReport
  - journeys: CategoryReport
  - forms: CategoryReport
  - cta: CategoryReport
  - leadGen: CategoryReport
  - newsletter: CategoryReport
    }
- findings: UXFinding[]

Shared types

- CategoryReport: { score: number, weight: number, findings: UXFinding[] }
- UXFinding: {
  - id: string
  - category: string
  - severity: 'low'|'medium'|'high'
  - title: string
  - evidence: any
  - recommendation: string
  - estimatedImpact?: { conversionLiftPct?: number, frictionDropPct?: number }
  - confidence: number (0–1)
    }

---

## Scoring model (configurable)

Category weights (defaults):

- search: 10
- notFound: 10
- journeys: 25
- forms: 20
- cta: 20
- leadGen: 10
- newsletter: 5

Rules produce 0–1 signals. Category score = 100 × weighted average of signals. Page score = weighted average of categories. Site score = percentile aggregation over key pages with homepage emphasis.

---

## Cross-cutting heuristics

- Above-the-fold: viewport-based fold + element bounding boxes
- Contrast ratio: WCAG AA/AAA for text and CTAs
- Visibility: display/opacity/overlap/z-index; sticky detection
- Click target: min 44×44px
- Form semantics: label-for, aria, required, autocomplete, input type
- Journey graph: BFS depth, dead-ends, orphans, loops; breadcrumbs
- 404 detection: status/headers/body pattern; soft-404 via template/content signals

---

## Feature implementation plan (v1)

1. Site Search Analysis (analyzers/site-search-analyzer.js)

- Detect search affordances (role=search, type=search, common selectors)
- Signals: global discoverability, semantics, results page proxies, mobile
- Findings: missing search (content-heavy), poor labels/accessibility, no-results UX
- Scoring: normalized by site type via config
- Tests: unit DOM fixtures; integration fixtures with/without search

2. 404 Error Page Quality (analyzers/error-page-analyzer.js)

- Crawl synthetic invalid route per domain
- Detect proper 404 vs soft-404; presence of helpful elements
- Findings: soft-404 (high), missing helpful actions, missing noindex
- Tests: e2e simulated routes; assertion of signals

3. User Journey Optimization (analyzers/user-journey-analyzer.js)

- Build internal link graph; detect key journeys by business type
- Signals: path depth, dead ends, orphans, breadcrumbs, next-step CTAs
- Findings: excessive depth to goals, missing breadcrumbs, orphan high-value pages
- Tests: graph fixtures with expected metrics

4. Form Usability & Conversion (analyzers/form-analyzer.js)

- Enumerate forms and fields; semantics and validation
- Heuristics: labels, autocomplete, input types, field counts, tab order
- Findings: missing labels (high), excessive fields, poor error messaging
- Tests: fixtures (good/bad forms); Playwright validation triggers

5. CTA Placement & Quality (analyzers/cta-analyzer.js)

- Identify action CTAs; compute visibility/contrast/size/placement
- Findings: primary CTA not above fold (high), low contrast/small target (high), conflicting CTAs
- Tests: contrast/visibility unit tests; DOM snapshots for positions

6. Lead Generation Optimization (analyzers/lead-generation-analyzer.js)

- Classify lead forms; consent/privacy visibility; thank-you/next step
- Findings: over-collecting fields (high), missing consent/privacy, no confirmation
- Tests: B2B lead form fixtures; counts and compliance checks

7. Newsletter Signup Effectiveness (analyzers/newsletter-analyzer.js)

- Detect newsletter forms/placements; minimal fields; clarity/consent
- Findings: excess fields, unclear consent, weak placement
- Tests: provider-like patterns (non-branded), accessibility checks

---

## Integration plan

Analyzer registry

- Register UXConversionAnalyzer in the multi-analyzer pipeline after DOM and network data are ready.
- Inject one synthetic 404/soft-404 check per site.

Config & flags

- Config file: `src/analyzers/ux-conversion/config/ux-conversion-config.js`
  - enableUXConversion (default: true post-stabilization)
  - enable categories: search, errorPages, journeys, forms, ctas, leadGen, newsletter
  - performance: timeouts, max concurrency
- CLI: `--enable-ux` (alias for enableUXConversion), `--ux-depth`, `--ux-jobs`

Reporting

- Extend JSON schema with `ux` node: { pageReports[], siteSummary }
- HTML/PDF: “UX & Conversion” section with per-category scores, top findings
- Evidence: element snippets, bounding boxes, contrast values

Defer (behind flags)

- ai-integration modules (disabled by default); provide noop adapters
- No web dashboard routes in v1

---

## Testing strategy

- Unit (Jest)
  - Heuristics, detectors, scoring in `tests/unit/ux-conversion/`
- Integration (Jest + local fixtures)
  - Synthetic mini-sites in `tests/integration/ux-conversion/`
- E2E (Playwright)
  - Spin up fixture pages; validate findings and screenshots
- Performance
  - Ensure analyzer adds < 100ms median per page (P50) on typical sites
- Regression
  - Golden JSON snapshots of UXPageReport for fixtures

Note: Use Playwright only. Avoid external live-site tests to prevent flakiness.

---

## Performance, reliability, security

- Budgets: < 1.5ms per rule on average; < 100ms total per page (P50)
- Caching/memoization for expensive selectors and computed styles
- Timeout guards; fail-safe defaults on errors
- Redact PII: never persist field values; only collect meta/structure
- Feature flags to disable categories instantly on regressions

---

## Deliverables & milestones

Week 1

- Core modules (contracts, scoring engine, analyzer harness)
- 404 and Search analyzers with unit/integration tests
- JSON schema/reporting extension

Week 2

- Forms and CTA analyzers, heuristics, and rules
- Journey graph metrics (depth, breadcrumbs, dead-ends)
- HTML/PDF report sections (initial)

Week 3

- Lead-gen and Newsletter analyzers
- Playwright E2E coverage and evidence attachments
- Weight tuning, docs, and stabilization

---

## Acceptance criteria (DoD)

- New analyzer behind `--enable-ux` and config; default on after stabilization
- JSON and HTML reports include UX scores and top findings with evidence
- Unit coverage ≥ 85% for `src/analyzers/ux-conversion/**`; integration tests for all categories
- Meets performance budgets; no sensitive data stored or logged
- Clear remediation guidance for every high/medium finding

---

## Risks & mitigations

- Heuristic variability across CMS/frameworks → broaden selector libraries; config-driven patterns; confidence scores and rule suppression
- Performance regressions → budgets, profiling, memoization; staged rollout via flags
- False positives → confidence scoring; easy suppression in config
- Scope creep (AI/dashboards) → gated behind flags; ship v1 with heuristics first

---

## Deferred (post-v1)

- ai-integration/ux-intelligence (pattern mining, predictions) with explicit SLAs
- Web dashboard routes and UI integration
- Real-time A/B suggestion engine and heatmap overlays

---

## Proposed file map (merged)

- src/analyzers/ux-conversion/core/ux-conversion-analyzer.js
- src/analyzers/ux-conversion/core/contracts.js
- src/analyzers/ux-conversion/core/ux-scoring-engine.js
- src/analyzers/ux-conversion/analyzers/site-search-analyzer.js
- src/analyzers/ux-conversion/analyzers/error-page-analyzer.js
- src/analyzers/ux-conversion/analyzers/user-journey-analyzer.js
- src/analyzers/ux-conversion/analyzers/form-analyzer.js
- src/analyzers/ux-conversion/analyzers/cta-analyzer.js
- src/analyzers/ux-conversion/analyzers/lead-generation-analyzer.js
- src/analyzers/ux-conversion/analyzers/newsletter-analyzer.js
- src/analyzers/ux-conversion/detectors/\*.js
- src/analyzers/ux-conversion/utils/{visibility,contrast,fold,journey-graph,forms}.js
- src/analyzers/ux-conversion/config/{ux-standards,scoring-weights,ux-conversion-config}.js
- tests/unit/ux-conversion/\*.test.js
- tests/integration/ux-conversion/\*.test.js
- tests/e2e/ux-conversion/\*.spec.js

---

## Quick examples (non-binding)

Category weights (config/scoring-weights.js)

- { search: 10, notFound: 10, journeys: 25, forms: 20, cta: 20, leadGen: 10, newsletter: 5 }

Config (config/ux-conversion-config.js)

- { enabled: true, performance: { timeoutMs: 30000, maxConcurrent: 5 }, categories: { search: true, errorPages: true, journeys: true, forms: true, ctas: true, leadGen: true, newsletter: true }, ai: { enabled: false } }

---

## Requirements coverage

- Repo-aligned structure (CLAUDE) — Done
- Explicit contracts/scoring/tests (GPT5) — Done
- Playwright-only tests; no Puppeteer — Done
- AI/dashboards deferred behind flags — Done

---

## Next steps

1. Scaffold directories/files and minimal analyzer harness
2. Wire into analyzer registry and JSON reporting
3. Implement Search + 404 analyzers with unit/integration tests
4. Expand to Forms, CTAs, Journeys, then Lead-gen/Newsletter
5. Add Playwright E2E fixtures and tune weights
