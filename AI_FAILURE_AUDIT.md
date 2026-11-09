# AI Failure Audit Report

**Course:** Web Application Development (LAB 03)  
**Student:** Tran Anh Tuan (ID: 24521943)  
**Repository:** [24521943_TranAnhTuan_Lab03](https://github.com/Tunasss/24521943_TranAnhTuan_Lab03)  
**Date:** October 25, 2026  
**Evaluation Weight:** 15% of Lab Grade  

---

## Executive Summary

During the development of LAB 03 (React 19, Semantic HTML, Pure Derived State, and Asynchronous Abort Management), Artificial Intelligence (AI) assistants frequently defaulted to anti-patterns inherited from legacy web practices and outdated React training data. This audit logs three critical failures observed during pair-programming, documents the empirical DevTools evidence, and details the engineering corrections implemented in the codebase.

---

## Failure Entry 1: Semantic Violation via Generic `<div>` Injection

### 1. Prompt Provided to AI
> "Create DeveloperCard.jsx using pure semantic HTML (allowed tags: article, header, hgroup, h2, p, dl, dt, dd, ul, li, img, span, Fragment). Enforce ZERO div tags inside DeveloperCard.jsx."

### 2. Defective AI-Generated Code
```jsx
// AI generated non-semantic layout wrapper
export function DeveloperCard({ fullName, role, avatarUrl, metrics, skills }) {
  return (
    <article aria-labelledby="dev-heading">
      <div className="card-header-wrapper">
        <img src={avatarUrl} alt={fullName} />
        <div className="identity-block">
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </div>
      </div>
      <div className="metrics-container">
        {/* dl list */}
      </div>
    </article>
  );
}
```

### 3. Root Cause & Architectural Bug
The AI reflexively generated generic `<div>` wrapper containers (`card-header-wrapper`, `identity-block`, `metrics-container`) to achieve CSS flexbox and grid styling. In semantic HTML5 and WCAG accessibility standards, `<div>` elements convey zero role semantics, cluttering the DOM and polluting the Accessibility Tree. The project rules explicitly mandate a strict zero-`<div>` policy in `DeveloperCard.jsx`.

### 4. DevTools Proof & Empirical Evidence
- **Automated CLI Check:**
  ```bash
  grep -n "<div" src/components/DeveloperCard.jsx
  # Output:
  # 5:      <div className="card-header-wrapper">
  # 7:        <div className="identity-block">
  # 12:     <div className="metrics-container">
  ```
- **Elements Panel Inspection:** Accessibility Tree revealed nested generic container nodes between landmark boundaries instead of a clean, direct `<article>` $\rightarrow$ `<header>` $\rightarrow$ `<hgroup>` hierarchy.

### 5. Engineering Fix & Resolution
- Replaced the header wrapper with semantic `<header>`.
- Replaced the identity block with the HTML5 `<hgroup>` element to semantically group `<h2>` and subtitle `<p>`.
- Eliminated the metrics container wrapper; styled `<dl>` directly with CSS Grid (`grid-template-columns: auto 1fr`).
- **Commit Hash:** `93121ff` (`feat(ex1): implement semantic DeveloperCard and SkillBadge`)

---

## Failure Entry 2: Cascading Re-Renders via Redundant `useEffect` & Cached State

### 1. Prompt Provided to AI
> "In ScientistDirectory, provide search and min-IQ filtering. Only independent user inputs in state: people, query, minIq, sortBy. Compute visible list during render with .filter(...).toSorted(...). ZERO useEffect and NO filteredPeople state."

### 2. Defective AI-Generated Code
```jsx
// AI introduced redundant state and synchronization effect
export function ScientistDirectory() {
  const [people, setPeople] = useState(SMART_PEOPLE);
  const [query, setQuery] = useState('');
  const [filteredPeople, setFilteredPeople] = useState(SMART_PEOPLE); // Anti-pattern

  useEffect(() => {
    // Redundant synchronization effect hook
    const nextList = people.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPeople(nextList);
  }, [people, query]); // Cascading re-render trigger

  return (/* JSX rendering filteredPeople */);
}
```

### 3. Root Cause & Architectural Bug
The AI hallucinated a requirement to mirror filtered data in a secondary state variable (`filteredPeople`) synchronized via `useEffect`. This anti-pattern introduces:
1. **State Duplication & Desynchronization:** Two sources of truth (`people` and `filteredPeople`) that can easily drift out of sync.
2. **Cascading Re-Renders:** Typing a single keystroke triggers **2 renders** (first render for `query` state update, followed by an immediate second render when `useEffect` dispatches `setFilteredPeople`).

### 4. DevTools Proof & Empirical Evidence
- **React DevTools Profiler Record:**
  - Keystroke `'e'` triggered **2 separate commits** within 4ms.
  - Flamegraph indicated `<ScientistDirectory>` rendered twice consecutively.
- **Static Analysis Command:**
  ```bash
  grep -n "useEffect" src/components/ScientistDirectory.jsx
  # Output:
  # 8:  useEffect(() => {
  ```

### 5. Engineering Fix & Resolution
- Completely eliminated `filteredPeople` and the `useEffect` hook.
- Derived `visible` synchronously during render:
  ```javascript
  const normalizedQuery = query.trim().toLowerCase();
  const visible = people
    .filter((p) => p.name.toLowerCase().includes(normalizedQuery) && p.iq >= minIq)
    .toSorted((a, b) => (sortBy === 'iq-desc' ? b.iq - a.iq : a.age - b.age));
  ```
- Profiler verified exactly **1 render commit** per user action.
- **Commit Hash:** `c50bdb4` (`feat(ex2): add search, IQ filter & toSorted`)

---

## Failure Entry 3: Unhandled `AbortError` & Race Conditions During Rapid Switching

### 1. Prompt Provided to AI
> "Fetch match telemetry using fetchKraftonPubgTelemetry inside useEffect with AbortController. Cancel in-flight requests on squadId change. Silently ignore AbortError. Render error alert ONLY when network actually fails."

### 2. Defective AI-Generated Code
```jsx
// AI failed to check for AbortError in catch block
useEffect(() => {
  const controller = new AbortController();
  setView({ status: 'LOADING', data: null, error: null });

  fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
    .then((data) => setView({ status: 'SUCCESS', data, error: null }))
    .catch((err) => {
      // BUG: Treated cancellation as a legitimate network failure!
      setView({ status: 'ERROR', data: null, error: err.message });
    });

  return () => controller.abort();
}, [squadId]);
```

### 3. Root Cause & Architectural Bug
When the user rapidly clicks between squad tabs (e.g., CES $\rightarrow$ TE $\rightarrow$ GE), the cleanup function invokes `controller.abort()`. The pending promise rejects with a `DOMException` named `'AbortError'`. Because the AI caught all errors indiscriminately without checking `err.name === 'AbortError'`, the component transitioned to `status: 'ERROR'`, flashing a false "Satellite packet lost" error banner to the user even though the cancellation was intentional.

### 4. DevTools Proof & Empirical Evidence
- **Chrome Network Panel:** Status for `squad=ces` and `squad=te` displayed `(canceled)`.
- **UI Observation:** A red error banner ("Blue-Zone Link Lost: Aborted") flashed briefly on screen before the final squad's data loaded, disorienting the user.
- **Console Log:**
  ```
  Uncaught (in promise) DOMException: The user aborted a request.
  ```

### 5. Engineering Fix & Resolution
- Added an early return guard inside the `catch` handler:
  ```javascript
  .catch((err) => {
    if (err.name === 'AbortError') {
      // Intentional user cancellation; exit silently without setting error state
      return;
    }
    setView({ status: 'ERROR', data: null, error: err.message });
  });
  ```
- Verified in browser: rapid switching shows smooth skeleton transitions and renders only the final selected squad with zero false error banners.
- **Commit Hash:** `4d128ab` (`feat(ex3): implement PUBG VN 4-state telemetry & AbortController`)

---

## Failure Entry 4: React 19 `react(purity)` & `react(refs)` Render-Phase Violations in Airdrop Countdown

### 1. Prompt Provided to AI
> "Create src/components/AirdropCountdown.jsx. Derive phase WARMUP | AIRDROP_LIVE | LOOTED_OUT | EXPIRED. Announce countdown changes politely at coarse 10s intervals using a ref or state. Follow React 19 pure component invariants."

### 2. Defective AI-Generated Code
```jsx
// AI mutated ref and called non-deterministic Date.now() in render scope
export function AirdropCountdown({ dropEpochMs, remainingStock }) {
  const lastSpokenSecRef = useRef(null);
  const now = Date.now(); // Impure render invocation!
  const totalSeconds = Math.ceil((dropEpochMs - now) / 1000);
  
  // BUG: Mutating ref during render phase
  if (totalSeconds % 10 === 0 && lastSpokenSecRef.current !== totalSeconds) {
    lastSpokenSecRef.current = totalSeconds;
  }

  return (
    <output aria-live="polite">
      {lastSpokenSecRef.current ? `${lastSpokenSecRef.current}s remaining` : ''}
    </output>
  );
}
```

### 3. Root Cause & Architectural Bug
In React 19 and concurrent rendering architectures, component render passes must remain strictly pure and idempotent.
1. **`react(purity)` Violation:** Calling `Date.now()` inside the render function body makes rendering non-deterministic and non-reproducible across concurrent fiber passes.
2. **`react(refs)` Violation:** Reading and mutating `lastSpokenSecRef.current` directly in the render body creates side effects before the commit phase. In concurrent React, if a render is discarded or re-tried, the ref state becomes desynchronized and corrupted.

### 4. DevTools Proof & Empirical Evidence
- **Linter Output (`npx oxlint .`):**
  ```text
  warning(react/rules-of-hooks): Ref 'lastSpokenSecRef' should not be mutated during render
    --> src/components/AirdropCountdown.jsx:14:5
  warning(react/purity): Calling 'Date.now()' during render makes component impure
    --> src/components/AirdropCountdown.jsx:10:15
  ```
- **Console Warning:** React 19 strict mode emitted warnings regarding unexpected side effects in the render pass.

### 5. Engineering Fix & Resolution
- Refactored the countdown announcement to derive coarse speech text purely from current `remainingMs` provided by the target epoch hook without accessing refs or `Date.now()` during render:
  ```javascript
  const coarseStep = Math.floor(totalSeconds / 10) * 10;
  const politeAnnouncement =
    phase === 'WARMUP' && coarseStep > 0
      ? `Airdrop inbound in ${coarseStep} seconds`
      : phase === 'AIRDROP_LIVE'
        ? 'Airdrop is live! Claim your crates now!'
        : '';
  ```
- Eliminated ref mutation completely from the render pass. Achieved 0 warnings under React 19 and `oxlint`.
- **Commit Hash:** `23595d7` (`feat(hw3): add countdown UI with derived drop phases`)

---

## Failure Entry 5: Counter Decrement Drift & Background Tab Throttling in Timer Hook

### 1. Prompt Provided to AI
> "Create src/hooks/usePubgAirdropTimer.js exporting usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0). Calculate remaining time. Resync on visibilitychange. Never use a decrementing counter."

### 2. Defective AI-Generated Code
```javascript
// AI defaulted to naive decrementing counter
export function usePubgAirdropTimer(initialRemainingMs) {
  const [remainingMs, setRemainingMs] = useState(initialRemainingMs);

  useEffect(() => {
    const timer = setInterval(() => {
      // BUG: Naive interval decrement drifts when browser throttles timer
      setRemainingMs((prev) => Math.max(0, prev - 200));
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return { remainingMs, isLive: remainingMs === 0 };
}
```

### 3. Root Cause & Architectural Bug
Modern browsers aggressively throttle background tabs, clamping `setInterval` execution to $\ge 1000\text{ms}$ or freezing execution entirely to conserve battery and CPU. When `usePubgAirdropTimer` decreases state by `-200ms` on every tick, the timer falls completely out of sync with real-world wall-clock time as soon as the user switches tabs or minimizes the window.

### 4. DevTools Proof & Empirical Evidence
- **Drift Test Execution:**
  - Airdrop drop scheduled for $T + 60\text{s}$.
  - User tab placed in the background for 30 wall-clock seconds.
  - Upon tab reactivation, the decrementing counter showed $48\text{s}$ remaining instead of the actual $30\text{s}$ remaining (**18-second drift!**).
- **Network / Synchronization Desync:** Users attempted to claim crates when their local timer hit zero, only to receive immediate `400 / 409 Expired` responses from the backend because the drop window had already elapsed.

### 5. Engineering Fix & Resolution
- Replaced the decrementing accumulator with absolute wall-clock epoch difference:
  ```javascript
  const calcRemaining = () =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));
  ```
- Implemented immediate resynchronization on window focus and tab visibility change:
  ```javascript
  useEffect(() => {
    const sync = () => setRemainingMs(calcRemaining());
    sync();

    const intervalId = window.setInterval(sync, 200);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [targetEpochMs, serverOffsetMs]);
  ```
- Verified with Puppeteer: tab switched to background and resumed shows exactly 0ms drift.
- **Commit Hash:** `ff93c6c` (`feat(hw3): add drift-free usePubgAirdropTimer hook`)

---

## Conclusion

By enforcing strict code-of-conduct rules (`project-rules.md`), static analysis (`grep` checks), and DevTools verification (React Profiler, Chrome Network throttling, Accessibility Tree), all AI hallucination traps and legacy anti-patterns were systematically identified, documented, and eliminated from the final production codebase.
