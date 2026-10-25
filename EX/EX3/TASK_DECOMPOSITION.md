# Task Decomposition: PUBG VN Live Match Telemetry

**Document Type:** Work Breakdown Structure (WBS)  
**Project:** PUBG VN Live Match Telemetry (React 19 + Vite + CSS Modules)  
**Total Estimated Time:** 35 minutes  
**Governed By:** [project-rules.md](./project-rules.md)

---

## Table of Contents

1. [Work Package 1 — Squad Dataset](#1-work-package-1--squad-dataset)
2. [Work Package 2 — Mock API with Delay, 35% Failure, and Abort Support](#2-work-package-2--mock-api-with-delay-35-failure-and-abort-support)
3. [Work Package 3 — Four-State Machine in the Component](#3-work-package-3--four-state-machine-in-the-component)
4. [Work Package 4 — AbortController Cleanup and Squad Selector](#4-work-package-4--abortcontroller-cleanup-and-squad-selector)
5. [Work Package 5 — Skeleton Loader and Error Alert with Retry](#5-work-package-5--skeleton-loader-and-error-alert-with-retry)
6. [Work Package 6 — Verification and Auditing](#6-work-package-6--verification-and-auditing)
7. [Time Allocation Summary](#7-time-allocation-summary)

---

## 1. Work Package 1 — Squad Dataset

**Objective:** Define the Vietnamese esports PUBG tournament squad dataset, including team IDs, team names, roster members, and realistic statistical performance records.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 1.1 | Author `SQUADS` metadata array in `src/data/pubgSquads.js` | Vietnamese PUBG esports team profiles (e.g. Cerberus Esports, The Expendables, Genius Esports) | Array of team objects with `id`, `name`, `tag`, and `roster` | Contains at least 4 competitive squads with unique immutable IDs; export is frozen | 2 |
| 1.2 | Define telemetry metrics schema for squad match data | Telemetry schema requirements (kills, damage, placement, survival time) | Record schema matching KRAFTON telemetry specifications | Schema contains numeric `placement`, `totalKills`, `damageDealt`, and string `survivalDuration` | 2 |

**Work Package 1 Subtotal: 4 minutes**

---

## 2. Work Package 2 — Mock API with Delay, 35% Failure, and Abort Support

**Objective:** Implement `fetchKraftonPubgTelemetry` in `src/api/telemetryApi.js` with simulated network latency (600–1200ms), an intentional 35% failure rate, and full `AbortSignal` listener integration.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 2.1 | Implement promise-based delay simulation with `AbortSignal` listener | Millisecond delay range (600–1200ms) and `options.signal` | Asynchronous timer resolving match telemetry | If `signal.aborted` is triggered during the timer, immediately reject with a `DOMException('Aborted', 'AbortError')` | 2 |
| 2.2 | Implement 35% simulated network failure mechanism | `Math.random()` threshold check | Random error rejection with descriptive uplink failure message | Exactly ~35% of non-aborted invocations reject with an Error (`"KRAFTON Telemetry Server 503: Uplink Timeout"`) | 2 |
| 2.3 | Assemble `fetchKraftonPubgTelemetry(squadId, { signal })` export | Target `squadId` string and options object | Exported async function returning squad telemetry | Function returns valid telemetry for existing squad IDs or rejects on signal abort / simulated failure | 2 |

**Work Package 2 Subtotal: 6 minutes**

---

## 3. Work Package 3 — Four-State Machine in the Component

**Objective:** Implement `PubgMatchTelemetry.jsx` using a single discriminated state object with statuses `'IDLE'`, `'LOADING'`, `'SUCCESS'`, and `'ERROR'` to eliminate uncoordinated boolean state.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 3.1 | Declare single `telemetryState` object with initial status `'IDLE'` | Component initialization | `useState({ status: 'IDLE', data: null, error: null })` | Zero individual boolean state variables (`isLoading`, `isError`) in the component | 2 |
| 3.2 | Render telemetry statistics upon `'SUCCESS'` state using Description List | Loaded match telemetry data | Rendered `<dl>` displaying match rank, kills, damage, and survival time | Semantic `<dl>` elements map key metrics; placement rank displays prominent visual and text label | 2 |
| 3.3 | Enforce deterministic state transitions across all 4 statuses | Status transition actions | Validated JSX conditional render block | Component strictly branches into Skeleton (`LOADING`), Stats (`SUCCESS`), Alert (`ERROR`), or Placeholder (`IDLE`) | 2 |

**Work Package 3 Subtotal: 6 minutes**

---

## 4. Work Package 4 — AbortController Cleanup and Squad Selector

**Objective:** Wire `useEffect` with `AbortController` cleanup on `[squadId, retryTick]` and render an accessible `<fieldset>` squad switcher with `aria-pressed`.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 4.1 | Implement `useEffect` with `AbortController` and cleanup invocation | `squadId` and `retryTick` state values | Active effect dispatching fetch and cleanup returning `controller.abort()` | Effect cancels pending request on dependency change; catches and ignores `AbortError` instances | 3 |
| 4.2 | Build accessible squad selector within `<fieldset>` and `<legend>` | `SQUADS` array and `selectedSquadId` state | Toggle button group with `aria-pressed` | Selected button indicates `aria-pressed="true"`; keyboard navigation cycles cleanly through buttons | 3 |

**Work Package 4 Subtotal: 6 minutes**

---

## 5. Work Package 5 — Skeleton Loader and Error Alert with Retry

**Objective:** Create an accessible skeleton loader with `min-height: 220px` to guarantee zero layout shift (CLS = 0) and an error alert section with an accessible Retry action.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 5.1 | Build accessible skeleton placeholder with `min-height: 220px` and `aria-busy` | `'LOADING'` state condition | Skeleton UI component in `src/components/PubgMatchTelemetry.module.css` | Skeleton reserves 220px vertical space; marked with `aria-busy="true"` and `aria-label="Loading telemetry"` | 3 |
| 5.2 | Disable skeleton pulse animations under `prefers-reduced-motion` | Media query for reduced motion | CSS `@media (prefers-reduced-motion: reduce)` rules | Shimmer and pulse animations completely cease when reduced motion preference is enabled | 2 |
| 5.3 | Implement error announcement section with accessible Retry button | `'ERROR'` state condition with error message | `<section role="alert" aria-live="assertive">` with Retry button | Clicking Retry increments `retryTick`, triggering re-fetch without changing active squad selection | 2 |

**Work Package 5 Subtotal: 7 minutes**

---

## 6. Work Package 6 — Verification and Auditing

**Objective:** Execute simulated Slow 3G throttling tests, rapid squad switching race condition audits, forced failure verification, and Google Lighthouse accessibility audits.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 6.1 | Verify race condition immunity during rapid squad button switching | Rapid successive clicks across 4 squad buttons | Console output and network trace | Prior in-flight requests abort cleanly; only the final selected squad's data renders; zero state tearing | 2 |
| 6.2 | Verify error alert display and Retry functionality under simulated 35% failure | Simulated network error trigger | Visible error alert with working Retry button | Error renders inside `<section role="alert">`; clicking Retry successfully resumes fetching | 1.5 |
| 6.3 | Verify zero Cumulative Layout Shift (CLS = 0) between skeleton and content | Performance layout trace | Layout shift metric | Layout shift is 0.000 due to fixed 220px minimum height container | 1 |
| 6.4 | Perform Google Lighthouse accessibility and responsive 375px audit | Rendered application at `localhost:5175` | Lighthouse audit report | Accessibility category scores 100%; responsive layout adapts to 375px without horizontal scrolling | 1.5 |

**Work Package 6 Subtotal: 6 minutes**

---

## 7. Time Allocation Summary

The table below summarizes planned time allotments across the six work packages. The sum equals exactly the 35-minute project allotment.

| Work Package | Title | Estimated Time (Minutes) |
|---|---|---|
| WP-1 | Squad Dataset | 4 |
| WP-2 | Mock API with Delay, 35% Failure, and Abort Support | 6 |
| WP-3 | Four-State Machine in the Component | 6 |
| WP-4 | AbortController Cleanup and Squad Selector | 6 |
| WP-5 | Skeleton Loader and Error Alert with Retry | 7 |
| WP-6 | Verification and Auditing | 6 |
| **Total** | **Full Project Duration** | **35** |
