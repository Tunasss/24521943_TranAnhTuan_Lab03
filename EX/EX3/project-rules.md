# Project Rules: PUBG VN Live Match Telemetry

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [State Machine Architecture Rules](#4-state-machine-architecture-rules)
5. [Asynchronous Data-Fetching and Cancellation Rules](#5-asynchronous-data-fetching-and-cancellation-rules)
6. [User Interface and Semantic Layout Rules](#6-user-interface-and-semantic-layout-rules)
7. [Accessibility Rules (WCAG 2.0 AA)](#7-accessibility-rules-wcag-20-aa)
8. [Git and Atomic Commit Rules](#8-git-and-atomic-commit-rules)
9. [Definition of Done](#9-definition-of-done)

---

## 1. Purpose and Scope

### 1.1 Purpose

This document serves as the mandatory **code of conduct for Artificial Intelligence (AI) assistants** implementing the **PUBG VN Live Match Telemetry** application (`EX3`). It outlines architectural requirements, state machine constraints, network cancellation policies, accessible user interface standards, and Git conventions that every AI assistant must strictly follow when writing, modifying, or testing code.

The project demonstrates:
- **Explicit Finite State Machine (FSM):** Managing remote asynchronous states via a single discriminated state object instead of uncoordinated boolean flags.
- **Race Condition Prevention with `AbortController`:** Safely cancelling in-flight fetch requests when users switch squads rapidly or unmount components.
- **Perceptual Performance & Zero Layout Shift:** Rendering accessible skeleton placeholders with fixed minimum dimensions to maintain Cumulative Layout Shift (CLS) at zero.
- **Resilient Error Recovery:** Trapping simulated network failures and providing explicit retry mechanisms without degrading UI flow.

### 1.2 Scope

These rules govern all assets developed for `EX3`, specifically:
- Mock API implementation: `src/api/telemetryApi.js` (`fetchKraftonPubgTelemetry`).
- Component modules: `PubgMatchTelemetry.jsx` and `SquadSelector.jsx`.
- Stylesheets: CSS Modules (`*.module.css`) and global styling resets.
- Application entry points: `App.jsx`, `main.jsx`, and `index.html`.
- Verification suites, documentation, and Git commits.
- `EX3` is completely standalone: it must **never** import files, styles, or logic from `EX1` or `EX2`.

---

## 2. What the AI Must Do

The following table defines mandatory requirements. Each rule has a unique identifier (ID), requirement statement, and architectural rationale.

| ID | Rule | Reason |
|---|---|---|
| DO-01 | Model telemetry remote state as a single state object `{ status, data, error }` with four explicit status states: `'IDLE'`, `'LOADING'`, `'SUCCESS'`, and `'ERROR'`. | Prevents impossible UI states (such as both `isLoading === true` and `isError === true`) and provides deterministic rendering. |
| DO-02 | Create a new `AbortController` inside `useEffect` and supply its `signal` to `fetchKraftonPubgTelemetry`. | Allows the browser engine to cancel pending asynchronous tasks immediately when component dependencies change. |
| DO-03 | Return a cleanup function from `useEffect` that invokes `controller.abort()`. | Prevents race condition bugs, memory leaks, and updating unmounted component state when switching squads. |
| DO-04 | Catch and silently ignore `AbortError` instances inside the asynchronous error handling block. | Aborted requests represent deliberate user navigation, not application failures, and must never display an error alert. |
| DO-05 | Declare `[squadId, retryTick]` explicitly as the dependency array for the fetching `useEffect`. | Guarantees data refetching only when the user selects a new squad or explicitly clicks the Retry button. |
| DO-06 | Implement `fetchKraftonPubgTelemetry(squadId, { signal })` with a configurable delay (600–1200ms) and an intentional 35% failure rate to simulate real-world mobile esports connectivity. | Provides a realistic mock environment for verifying loading states, network cancellations, and retry mechanisms. |
| DO-07 | Display a skeleton loading placeholder with `aria-busy="true"`, `aria-label="Loading squad telemetry"`, and a CSS `min-height: 220px`. | Eliminates Cumulative Layout Shift (CLS) by reserving the exact spatial geometry of the telemetry card before data arrives. |
| DO-08 | Enclose error states in a semantic `<section role="alert" aria-live="assertive">` containing an explanatory message and an accessible Retry `<button>`. | Immediately alerts screen readers to network interruptions and provides an intuitive keyboard path to re-attempt the fetch. |
| DO-09 | Present squad selection buttons inside a semantic `<fieldset>` with `<legend>` and designate the selected squad using `aria-pressed="true"`. | Informs assistive technology users of group context and toggle button selection status according to WAI-ARIA standards. |
| DO-10 | Render telemetry performance statistics (such as Kills, Survival Time, Damage, and Rank) using a Description List (`<dl>`, `<dt>`, `<dd>`). | Associates statistical labels and data values semantically in the Accessibility Tree. |
| DO-11 | Disable all skeleton shimmer and pulse animations under the `@media (prefers-reduced-motion: reduce)` media query. | Fulfills WCAG 2.0 AA Success Criterion 2.3.3 (Animation from Interactions), protecting users with vestibular disorders. |
| DO-12 | Maintain a minimum color contrast ratio of 4.5:1 for normal text and ensure high-visibility `:focus-visible` outlines. | Guarantees readability and keyboard usability under WCAG 2.0 Level AA requirements. |
| DO-13 | Ensure the telemetry interface fits comfortably on small viewports (down to 375px) without horizontal scrolling. | Meets modern responsive web standards and WCAG reflow criteria for handheld devices. |
| DO-14 | Follow Conventional Commits format for the 2 mandatory atomic commits of EX3. | Maintains strict traceability across milestone deliverables. |

---

## 3. What the AI Must Not Do

The following table lists prohibited practices. Violating any of these constitutes an automatic deliverable rejection.

| ID | Rule | Reason |
|---|---|---|
| DONT-01 | Never use "boolean soup" state (multiple separate boolean state variables such as `isLoading`, `isError`, `isSuccess`, `data`). | Multiple uncoordinated boolean flags permit invalid contradictory states (e.g., both loading and error true). |
| DONT-02 | Never leave the `useEffect` dependency array empty (`[]`) or omit active dependencies. | Omitting dependencies causes stale closures and prevents the component from reacting when the user switches squads. |
| DONT-03 | Never install or import third-party data-fetching libraries (such as Axios, React Query, SWR, or RTK Query). | The objective of this exercise is to master core browser `fetch`, `AbortController`, and React 19 primitives from scratch. |
| DONT-04 | Never use polling loops (`setInterval` or recursive `setTimeout`) to poll for telemetry updates. | Polling drains mobile battery, wastes network bandwidth, and complicates lifecycle teardown during tests. |
| DONT-05 | Never use `window.alert()`, `window.confirm()`, or `window.prompt()` for error messaging. | Browser modal dialogs freeze thread execution, disrupt assistive technology, and degrade user experience. |
| DONT-06 | Never treat `AbortError` as an application error or set `status: 'ERROR'` when an abort occurs. | Aborting is a deliberate cancellation; showing an error banner on cancelled requests frustrates users. |
| DONT-07 | Never import components, data, or styles from `EX1` or `EX2`. | EX3 must remain completely modular and independently executable. |
| DONT-08 | Never rely on color alone (such as green for victory or red for elimination) to communicate match rank or status. | Excludes users with color vision deficiencies, violating WCAG 2.0 Success Criterion 1.4.1. |
| DONT-09 | Never remove browser focus outlines (`outline: none`) without supplying an enhanced, visible focus ring. | Deprives keyboard-only users of focus indicators, violating WCAG 2.0 Success Criterion 2.4.7. |
| DONT-10 | Never allow the skeleton loader to have zero or unconstrained height before content loads. | Causes jarring layout shifts when remote telemetry data renders, degrading Google Core Web Vitals. |

---

## 4. State Machine Architecture Rules

### 4.1 Discriminated State Schema

The telemetry state must be maintained in a single state object conforming to this exact structure:

```javascript
// State structure:
const [telemetryState, setTelemetryState] = useState({
  status: 'IDLE', // 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
  data: null,
  error: null,
});
```

### 4.2 State Transitions

1. **`IDLE` $\rightarrow$ `LOADING`:** When `squadId` changes or a retry is triggered, reset error and set status to `LOADING`.
2. **`LOADING` $\rightarrow$ `SUCCESS`:** When data arrives successfully, set status to `SUCCESS`, store `data`, and clear `error`.
3. **`LOADING` $\rightarrow$ `ERROR`:** When the request fails (excluding `AbortError`), set status to `ERROR` and store the error message.
4. **`LOADING` $\rightarrow$ Cancelled:** When a user switches squads before loading completes, `controller.abort()` cancels the request without changing state to `ERROR`.

```javascript
// Example implementation:
setTelemetryState({ status: 'LOADING', data: null, error: null });

try {
  const result = await fetchKraftonPubgTelemetry(squadId, { signal: controller.signal });
  setTelemetryState({ status: 'SUCCESS', data: result, error: null });
} catch (err) {
  if (err.name === 'AbortError') {
    // Request was cancelled cleanly; ignore
    return;
  }
  setTelemetryState({
    status: 'ERROR',
    data: null,
    error: err.message || 'Failed to connect to KRAFTON telemetry servers.',
  });
}
```

---

## 5. Asynchronous Data-Fetching and Cancellation Rules

### 5.1 Explicit Lifecycle Cleanup with `AbortController`

```javascript
useEffect(() => {
  const controller = new AbortController();

  async function loadTelemetry() {
    setTelemetryState({ status: 'LOADING', data: null, error: null });

    try {
      const data = await fetchKraftonPubgTelemetry(squadId, { signal: controller.signal });
      setTelemetryState({ status: 'SUCCESS', data, error: null });
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setTelemetryState({
        status: 'ERROR',
        data: null,
        error: err.message || 'Telemetry connection error.',
      });
    }
  }

  loadTelemetry();

  return () => {
    controller.abort();
  };
}, [squadId, retryTick]);
```

---

## 6. User Interface and Semantic Layout Rules

### 6.1 Skeleton Loader Specification

The loading skeleton must preserve the exact geometry of the telemetry card:

```jsx
{telemetryState.status === 'LOADING' && (
  <div
    className={styles.skeletonCard}
    aria-busy="true"
    aria-label="Loading squad telemetry data"
  >
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonBody} />
  </div>
)}
```

```css
.skeletonCard {
  min-height: 220px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .skeletonCard,
  .skeletonHeader,
  .skeletonBody {
    animation: none;
  }
}
```

### 6.2 Semantic Squad Selector

```jsx
<fieldset className={styles.squadFieldset}>
  <legend className={styles.legend}>Select PUBG Vietnam Squad</legend>
  <div className={styles.squadButtonGrid}>
    {SQUADS.map((squad) => (
      <button
        key={squad.id}
        type="button"
        aria-pressed={selectedSquadId === squad.id}
        onClick={() => setSelectedSquadId(squad.id)}
        className={selectedSquadId === squad.id ? styles.activeSquadBtn : styles.squadBtn}
      >
        {squad.name}
      </button>
    ))}
  </div>
</fieldset>
```

### 6.3 Semantic Error Alert with Retry

```jsx
{telemetryState.status === 'ERROR' && (
  <section role="alert" aria-live="assertive" className={styles.errorAlert}>
    <h2 className={styles.errorTitle}>Telemetry Uplink Error</h2>
    <p>{telemetryState.error}</p>
    <button
      type="button"
      onClick={() => setRetryTick((tick) => tick + 1)}
      className={styles.retryButton}
    >
      Retry Telemetry Fetch
    </button>
  </section>
)}
```

---

## 7. Accessibility Rules (WCAG 2.0 AA)

### 7.1 WAI-ARIA Attributes
- `aria-busy="true"` on the skeleton container while fetching.
- `role="alert"` and `aria-live="assertive"` on error announcements.
- `aria-pressed="true"` on the currently selected squad button.
- Meaningful label associations on the `<fieldset>` via `<legend>`.

### 7.2 Color Contrast and Visual Indicators
- Text contrast must meet or exceed **4.5:1** against dark and light surface colors.
- Interactive buttons must provide high-contrast visible focus rings (`:focus-visible`).
- Match victory and placement ranks must display textual ranks alongside badge indicators.

### 7.3 Responsive Reflow down to 375px
- Layout must adjust fluidly to 375px width without horizontal scrollbars.

---

## 8. Git and Atomic Commit Rules

The implementation of `EX3` must be completed in **2 mandatory atomic commits**:

1. **Commit 1 (Documentation):**  
   `docs(ex3): add project-rules and task decomposition`
2. **Commit 2 (Implementation & Verification):**  
   `feat(ex3): implement live telemetry component with state machine, abort cleanup, and accessible skeleton`

---

## 9. Definition of Done

A deliverable is complete only when all the following verification checkpoints pass:

- [ ] State is managed by one state object `{ status, data, error }` with four explicit statuses.
- [ ] Zero uncoordinated boolean flags (`isLoading`, `isError`, etc.) exist in component state.
- [ ] `AbortController` is initialized in `useEffect` and aborted in the cleanup return function.
- [ ] `AbortError` is silently caught and ignored during rapid squad switching.
- [ ] Dependency array contains `[squadId, retryTick]`; zero empty dependency arrays.
- [ ] Mock API incorporates artificial network delay (600–1200ms) and simulated 35% failure rate.
- [ ] Skeleton placeholder has `aria-busy="true"` and `min-height: 220px` to guarantee zero layout shift.
- [ ] Animations are disabled when `prefers-reduced-motion: reduce` is active.
- [ ] Error alert uses `role="alert"` and provides a functioning Retry button.
- [ ] Squad toggle buttons use `aria-pressed` within `<fieldset>` and `<legend>`.
- [ ] All interactive elements are fully operable via keyboard.
- [ ] Page scores 100% in Google Lighthouse Accessibility audits.
- [ ] The 2 mandatory atomic commits adhere to the Conventional Commits specification.
