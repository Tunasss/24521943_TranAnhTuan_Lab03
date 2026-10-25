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

## Conclusion

By enforcing strict code-of-conduct rules (`project-rules.md`), static analysis (`grep` checks), and DevTools verification (React Profiler, Chrome Network throttling, Accessibility Tree), all AI hallucination traps and legacy anti-patterns were systematically identified, documented, and eliminated from the final production codebase.
