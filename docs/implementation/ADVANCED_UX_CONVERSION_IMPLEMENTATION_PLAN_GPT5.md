# Advanced UX & Conversion Analysis — Implementation Plan (Enterprise-Grade)

Analysis target: ENHANCEMENT_OPPORTUNITIES.md — Section 4
Timeframe: 2–3 weeks (3 sprints of 1 week for predictable delivery)
Owner: UX/Conversion Feature Squad

---

## Objectives

- Add a modular analysis suite that evaluates UX and conversion factors across pages and flows.
- Provide actionable, prioritized recommendations with quantified impact and confidence.
- Integrate into existing Domain Audit pipeline, reports (JSON, HTML/PDF), and dashboards.

---

## Scope (features to implement)

1. Site search functionality analysis
2. 404 error page quality assessment
3. User journey optimization analysis
4. Form usability and conversion assessment
5. Call-to-action (CTA) placement and quality analysis
6. Lead generation form optimization
7. Newsletter signup effectiveness

Out of scope (v1): live A/B experiment inference, email deliverability tests, server logs ingestion.

---

## Architecture & Modules

- Package namespace: `src/ux/` (analysis + heuristics + scoring)
  - `src/ux/core/uxAnalyzer.js` — entry point; orchestrates detectors, metrics, scoring
  - `src/ux/core/contracts.js` — TS-style JSDoc typedefs for inputs/outputs
  - `src/ux/core/scoring.js` — weight config, composite scorers, normalization
  - `src/ux/detectors/*` — feature-specific detectors (DOM/runtime/crawl graph)
  - `src/ux/heuristics/*` — reusable heuristics (above-the-fold, contrast, etc.)
  - `src/ux/rules/*` — rule sets that convert signals to findings
  - `src/ux/recommendations/*` — remediation text + examples
- Integration points
  - Crawler DOM snapshots and network traces (existing `src/crawler*` + Playwright runs)
  - Existing analyzers bus: register `uxAnalyzer` in multi-analyzer pipeline
  - Reporting: extend JSON schema + HTML/PDF sections via reporting layer
- Config
  - `config/ux.config.js` (weights, thresholds, feature flags)
  - Feature flags per category for incremental rollout
- Storage/Schema additions
  - Extend existing audit JSON with `ux` node (see Data Contracts)
- Observability
  - Structured logs per rule; metrics counters for coverage; timing per category

---

## Data Contracts (JSDoc-style types)

Input (per page):

- PageAuditInput
  - url: string
  - dom: SerializedDomSnapshot
  - viewport: { width: number, height: number }
  - performance: { lcpMs?: number, tbtMs?: number, cls?: number }
  - network: Array<{ url, type, status, sizeBytes, start, end }>
  - jsErrors: Array<{ message, stack, sourceUrl, line, col }>
  - links: Array<{ href, rel, text, position }>
  - forms: Array<FormMeta> (extracted)
  - screenshots?: { viewportPng?: Buffer }
  - httpStatus: number
  - headers: Record<string,string>

Output (per page):

- UXPageReport
  - score: number (0–100)
  - categories: {
    search: CategoryReport,
    notFound: CategoryReport,
    journeys: CategoryReport,
    forms: CategoryReport,
    cta: CategoryReport,
    leadGen: CategoryReport,
    newsletter: CategoryReport
    }
  - findings: Array<UXFinding>

Shared types:

- CategoryReport: { score: number, weight: number, findings: UXFinding[] }
- UXFinding: {
  id: string, category: string, severity: 'low'|'medium'|'high',
  title: string, evidence: any, recommendation: string,
  estimatedImpact: { conversionLiftPct?: number, frictionDropPct?: number },
  confidence: number (0–1)
  }

---

## Scoring Model

- Category weights (configurable):
  - search: 10, notFound: 10, journeys: 25, forms: 20, cta: 20, leadGen: 10, newsletter: 5
- Each rule yields a 0–1 signal; category score = 100 \* weighted average of signals.
- Page score = weighted average of categories; Site score = percentile aggregation over key pages plus homepage weighting.

---

## Cross-Cutting Heuristics & Utilities

- Above-the-fold estimation: uses viewport height and element bounding boxes from snapshot
- Contrast ratio calculator: WCAG AA/AAA check for CTAs and text
- Visibility heuristic: CSS display/opacity/overlap and z-index checks
- Click target sizing: minimum 44x44px for touch
- Form semantics: label-for, aria, required, autocomplete, input type
- Journey graph: internal link graph with BFS depth, dead-end and loop detection
- 404 detection: status/headers/body signals; soft-404 detection via content similarity and template markers

---

## Feature Implementations (step-by-step)

### 1) Site Search Functionality Analysis

Steps:

1. Detector: `detectors/searchDetector.js`
   - Find `<form role="search">`, inputs with `type=search`, common selectors (#search, .search-form)
   - Identify dedicated results pages (query params like `q=`, `/search` routes)
   - Check presence on key templates (home, blog, docs, catalog)
2. Metrics:
   - Search discoverability (present in header/footer/global nav)
   - Input semantics (label, placeholder, aria, autocomplete)
   - Results quality proxies: unique title, result count text, pagination, filters
   - Performance: results page TTI/LCP if known
3. Rules -> Findings:
   - Missing site search on content-heavy sites
   - Poor input semantics or missing labels
   - Results page lacks no-results guidance or suggestions
4. Scoring: normalize by site type (config: content-heavy vs brochure)
5. Tests: unit fixtures for presence/absence; integration with sample pages

Acceptance:

- 95%+ precision on detecting search presence
- High-confidence findings for missing labels and no-results UX

### 2) 404 Error Page Quality Assessment

Steps:

1. Crawler: enqueue invalid URL per domain (e.g., `/__da-missing-404`)
2. Detector: `detectors/notFoundDetector.js`
   - HTTP 404/410 vs soft-404 (200 + “not found” template signals)
   - Presence of helpful elements: search box, popular links, home link, contact/support
   - Consistent branding and navigation
3. Rules:
   - Soft-404 (high severity)
   - Missing helpful actions (medium)
   - 404 page not indexed (ensure `noindex`) (medium)
4. Scoring: penalize soft-404 heavily; bonus for helpful recovery paths
5. Tests: e2e route generation, assertion of findings

Acceptance:

- Detect soft-404 in common CMS templates
- Provide concrete remediation text

### 3) User Journey Optimization Analysis

Steps:

1. Build internal link graph (reuse crawler outputs) in `heuristics/journeyGraph.js`
2. Identify key journeys (configurable):
   - Home -> Category -> Product -> Cart -> Checkout (ecom)
   - Home -> Services -> Contact/Book
   - Content -> Signup/Newsletter
3. Signals:
   - Depth from home; dead ends; orphan pages; loop/ring structures
   - Breadcrumb presence and correctness
   - Click-path length to goals; visibility of next-step CTAs
   - Consistency between desktop/mobile nav (if snapshots available)
4. Rules:
   - Critical path exceeds threshold depth
   - Missing breadcrumbs on deep pages
   - Orphan high-value pages (have inbound = 0)
5. Scoring: weight by business goal priority
6. Tests: synthetic site graph fixtures; unit tests for path lengths

Acceptance:

- Journey metrics computed for >90% internal pages
- Flag long/blocked paths with actionable next steps

### 4) Form Usability & Conversion Assessment

Steps:

1. Detector: `detectors/formDetector.js`
   - Enumerate forms; collect fields, labels, types, required; validation attributes
   - Detect inline errors (elements with `aria-live`, `.error`, `role=alert`)
2. Heuristics:
   - Labels present; `for`/`id` linkage; placeholder-only anti-pattern
   - Autocomplete attributes for common fields; input types for mobile keyboard
   - Field count; optional vs required; grouping; progressive disclosure
   - Tab order and focus management
3. Rules:
   - Missing labels (high)
   - Excessive fields for goal type (medium/high)
   - Poor error messaging or no inline validation (medium)
   - Missing accessibility attributes (medium)
4. Scoring: base on friction index = fieldsWeighted + errors + mobile penalties
5. Tests: fixtures with bad/good forms; Playwright to trigger validation

Acceptance:

- Detects label and autocomplete issues reliably
- Produces prioritized field-level remediation list

### 5) CTA Placement & Quality Analysis

Steps:

1. Detector: `detectors/ctaDetector.js`
   - Identify buttons/links with action verbs; role=button; `data-cta`
   - Compute position and visibility (above-the-fold, sticky)
2. Heuristics:
   - Contrast ratio (AA minimum), size (>=44x44), whitespace, proximity to copy
   - Single primary CTA per view; avoid competing CTAs
   - Consistent wording and hierarchy
3. Rules:
   - Primary CTA not above-the-fold on key pages (high)
   - Low contrast or small targets (high)
   - Multiple conflicting CTAs (medium)
4. Scoring: CTA effectiveness index combining visibility, clarity, contrast
5. Tests: visual bounding boxes from DOM snapshot; contrast unit tests

Acceptance:

- Correctly flags non-visible/low-contrast CTAs with evidence screenshots

### 6) Lead Generation Form Optimization

Steps:

1. Build on Form detector with goal classification (lead vs checkout vs auth)
2. Heuristics:
   - Minimize required fields; telephone capture optional; company/role when justified
   - Privacy notice visibility; consent checkboxes; submit microcopy clarity
   - Thank-you page or inline success state with next step
3. Rules:
   - Over-collecting for top-of-funnel (high)
   - Missing consent or privacy notice (high in regulated locales)
   - No confirmation/next-step (medium)
4. Scoring: lead friction index; compliance gates
5. Tests: fixtures with B2B lead forms; assertions on field counts and consent

Acceptance:

- Actionable recommendations to remove/mark optional fields and add consent

### 7) Newsletter Signup Effectiveness

Steps:

1. Detector: `detectors/newsletterDetector.js`
   - Identify newsletter forms by input names, copy, endpoints (/subscribe)
   - Placement (footer, modal, sidebar, inline)
2. Heuristics:
   - Double opt-in messaging (if mentioned), success state clarity
   - Minimal fields (email-only preferred)
   - Accessibility and mobile usability
3. Rules:
   - Excess fields (medium), unclear consent (medium), poor placement (low/medium)
4. Scoring: simplicity + clarity index
5. Tests: fixtures for common providers (Mailchimp etc.) patterns (non-branded)

Acceptance:

- Flags friction and unclear consent; suggests simpler form with example text

---

## Integration Plan

- Pipeline wiring
  - Add `uxAnalyzer` to analyzer registry executed after DOM and network data are available
  - Ensure a synthetic 404 crawl target is injected per domain
- Reporting
  - JSON: extend schema with `ux` node { pageReports[], siteSummary }
  - HTML/PDF: new "UX & Conversion" section with per-category scores and top findings
  - Evidence attachments: element snippets, bounding boxes, contrast values
- CLI / Config
  - `--enable-ux` flag (default on once stable), `--ux-depth`, `--ux-jobs` for concurrency
  - `config/ux.config.js` for weights and thresholds

---

## Testing Strategy

- Unit (Jest)
  - Heuristics, scoring, detectors with DOM fixtures in `tests/unit/ux/`
- Integration
  - Crawl small synthetic sites in `tests/integration/ux/` covering each feature
- E2E (Playwright)
  - Spin up fixture pages; validate findings and screenshots
- Performance tests
  - Ensure analyzer adds < 100ms median per page on typical sites
- Regression
  - Golden JSON snapshots of `UXPageReport` for fixtures

---

## Performance, Reliability, and Security

- Performance budgets: < 1.5ms per rule per page; < 100ms total per page at P50
- Caching: memoize expensive selectors; reuse computed styles where possible
- Timeout guards for DOM queries; fail-safe defaults
- No PII persistence in logs; redact field values; only collect meta
- Feature flags to disable categories quickly

---

## Deliverables & Milestones

Week 1

- Core modules (contracts, scoring, analyzer harness)
- 404 assessment + site search detectors with tests
- Reporting JSON schema extension

Week 2

- Forms + CTA detectors, heuristics, and rules
- Journey graph metrics (depth, breadcrumbs, dead-ends)
- HTML/PDF report sections (initial)

Week 3

- Lead-gen and Newsletter specializations
- Playwright E2E coverage, evidence attachments
- Weight tuning, docs, and stability hardening

---

## Acceptance Criteria (DoD)

- New analyzer behind `--enable-ux` with config; default on post-stabilization
- JSON and HTML reports include UX scores and top findings with evidence
- Unit coverage >= 85% for `src/ux/**`; integration tests for all categories
- Performance within budgets; no sensitive data logged or stored
- Clear remediation guidance for every high/medium finding

---

## Proposed File/Directory Map

- src/ux/core/uxAnalyzer.js
- src/ux/core/contracts.js
- src/ux/core/scoring.js
- src/ux/detectors/searchDetector.js
- src/ux/detectors/notFoundDetector.js
- src/ux/detectors/formDetector.js
- src/ux/detectors/ctaDetector.js
- src/ux/detectors/newsletterDetector.js
- src/ux/heuristics/contrast.js
- src/ux/heuristics/visibility.js
- src/ux/heuristics/journeyGraph.js
- src/ux/rules/\*.js
- src/ux/recommendations/\*.md
- tests/unit/ux/\*.test.js
- tests/integration/ux/\*.test.js
- tests/e2e/ux/\*.spec.js
- config/ux.config.js

---

## Risk & Mitigation

- False positives in heuristic detection → add confidence scores, allow rule suppression
- Variability across frameworks/CMS → broaden selector libraries; config-based patterns
- Performance regression → staged rollout with flags and budgets, profiling

---

## Requirements Coverage

- Site search analysis — planned (detectors, rules, tests)
- 404 page quality — planned (synthetic route, soft-404 rules)
- User journey optimization — planned (graph metrics, rules)
- Form usability & conversion — planned (semantics, validation, friction index)
- CTA placement & quality — planned (visibility, contrast, hierarchy)
- Lead-gen optimization — planned (fields, consent, next steps)
- Newsletter effectiveness — planned (simplicity, consent, placement)

Status: All items covered with milestones, tests, and integration details.

---

## Next Steps (Optional Enhancements)

- Lightweight ML ranking of recommendations by expected impact
- Heatmap proxy using viewport fold and element density
- Cross-device snapshots to validate mobile-specific heuristics
