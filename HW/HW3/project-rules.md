# Project Rules: PUBG Vietnam Airdrop Arena

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [Timer Architecture and Anti-Drift Rules](#4-timer-architecture-and-anti-drift-rules)
5. [Optimistic Claiming, Concurrency Locks & 409 Rollback](#5-optimistic-claiming-concurrency-locks--409-rollback)
6. [Leaderboard and Pure Derived State Rules](#6-leaderboard-and-pure-derived-state-rules)
7. [Accessibility Rules (WCAG 2.0 AA)](#7-accessibility-rules-wcag-20-aa)
8. [Git and Atomic Commit Rules](#8-git-and-atomic-commit-rules)
9. [AI Failure Audit Guidelines](#9-ai-failure-audit-guidelines)
10. [Definition of Done](#10-definition-of-done)

---

## 1. Purpose and Scope

This document defines the strict engineering guidelines and code of conduct for building the **PUBG Vietnam Airdrop Arena & Championship** platform using **React 19** and **Vite**. The system manages synchronized flash airdrops with drift-free countdown timers, handles high-concurrency ticket/crate claims with optimistic inventory deduction and rollback upon 409 Conflict, and displays a pure-derived, sortable live esports squad leaderboard formatted in Vietnamese Dong (VND).

---

## 2. What the AI Must Do

| ID | Mandatory Rule | Technical Rationale |
|:---|:---|:---|
| **REQ-01** | Compute remaining countdown time strictly from a target epoch: `targetEpochMs - (Date.now() + serverOffsetMs)`. | Guarantees exact millisecond accuracy unaffected by JavaScript event-loop delays, CPU throttling, or browser background tab deprioritization. |
| **REQ-02** | Resynchronize timer immediately upon `visibilitychange` when document becomes `visible`. | Instantly corrects clock drift when user switches back from background tabs or wakes the system. |
| **REQ-03** | Implement an in-flight `claimingId` state lock before initiating claim requests. | Prevents duplicate click spam and race conditions before asynchronous responses return. |
| **REQ-04** | Decrement inventory stock optimistically using immutable functional state updates. | Provides instantaneous visual feedback for fast-paced e-commerce/gaming drops. |
| **REQ-05** | Rollback state to pre-claim snapshot upon receiving a `409 Conflict` response. | Restores single source of truth when server detects inventory exhaustion or concurrent contention. |
| **REQ-06** | Derive filtered and sorted leaderboard data purely during render using `.toSorted()`. | Eliminates redundant `useEffect` hooks and prevents cascading re-render loops. |
| **REQ-07** | Format all currency values using `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`. | Complies with Vietnamese financial localization standards. |
| **REQ-08** | Announce claim errors in `<section role="alert">` with a manual Dismiss button. | Ensures screen readers announce failures without disruptive native `window.alert()`. |
| **REQ-09** | Enclose leaderboard data in semantic `<table>` with `<caption>`, `<th scope="col">`, and `<th scope="row">`. | Provides comprehensive data-table navigation semantics for screen reader users. |
| **REQ-10** | Provide responsive reflow at 375px viewport with table scrolling inside its own container. | Complies with WCAG 1.4.10 without triggering window horizontal overflow. |

---

## 3. What the AI Must Not Do

| ID | Forbidden Action | Consequence of Violation |
|:---|:---|:---|
| **PROHIB-01** | Never use a decrementing counter (`setSeconds(s => s - 1)`) for countdown timers. | Counters accumulate massive drift in background tabs due to browser timer throttling ($> 1000\text{ms}$ per tick). |
| **PROHIB-02** | Never omit event listener cleanup for `document.addEventListener('visibilitychange')`. | Leaks zombie listeners and triggers duplicate state updates across unmount cycles. |
| **PROHIB-03** | Never use `window.alert()` or `window.confirm()` for user feedback. | Blocks the JavaScript UI thread and creates severe accessibility barriers. |
| **PROHIB-04** | Never store filtered/sorted leaderboard arrays in secondary React state. | Duplicates state, creates out-of-sync bugs, and triggers 2 renders per user input. |
| **PROHIB-05** | Never announce countdown ticks every single second in ARIA live regions. | Causes screen-reader speech flooding, drowning out all other interactive controls. |
| **PROHIB-06** | Never mutate arrays or state objects in-place (`.sort()`, `.splice()`). | Violates React immutability, causing `Object.is` bail-outs and skipped re-renders. |
| **PROHIB-07** | Never leave pending claim network requests un-aborted on component unmount. | Causes memory leaks and attempts to setState on unmounted components. |

---

## 4. Timer Architecture and Anti-Drift Rules

1. **Epoch-Based Calculation:**
   ```javascript
   const calcRemaining = () => Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));
   ```
2. **Frequency and Event Guards:**
   - Interval runs at 200ms (`setInterval(sync, 200)`).
   - Document visibility change:
     ```javascript
     const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible') sync();
     };
     document.addEventListener('visibilitychange', handleVisibilityChange);
     ```
3. **Dependency Array:** Explicitly declare `[targetEpochMs, serverOffsetMs]`.
4. **Cleanup:**
   ```javascript
   return () => {
     clearInterval(intervalId);
     document.removeEventListener('visibilitychange', handleVisibilityChange);
   };
   ```

---

## 5. Optimistic Claiming, Concurrency Locks & 409 Rollback

1. **In-Flight Lock:**
   ```javascript
   if (claimingId !== null) return;
   ```
2. **Snapshot Capture & Optimistic Update:**
   ```javascript
   const previousSnapshot = crates;
   setClaimingId(crateId);
   setCrates(prev => prev.map(c => c.id === crateId ? { ...c, remainingStock: Math.max(0, c.remainingStock - 1) } : c));
   ```
3. **409 Rollback:**
   ```javascript
   try {
     const updated = await claimCrate(crateId, { signal: controller.signal });
     // Reconcile with authoritative server stock
   } catch (err) {
     if (err.name === 'AbortError') return;
     if (err.status === 409 || err.message?.includes('409')) {
       setCrates(previousSnapshot); // Rollback
       setClaimError(`409 Conflict: ${err.message}`);
     }
   } finally {
     setClaimingId(null);
   }
   ```

---

## 6. Leaderboard and Pure Derived State Rules

1. **Pure Derivation:**
   ```javascript
   const visibleSquads = squads
     .filter(s => s.squadName.toLowerCase().includes(query.trim().toLowerCase()))
     .toSorted((a, b) => {
       if (sortBy === 'wwcd') return b.wwcdCount - a.wwcdCount;
       if (sortBy === 'placement') return b.placementPts - a.placementPts;
       return b.killPts - a.killPts;
     });
   ```
2. **ZERO `useEffect`:** Derivation takes place strictly in render scope.

---

## 7. Accessibility Rules (WCAG 2.0 AA)

1. **Coarse Countdown Live Region:** Announce remaining time only on phase transitions or at 10-second milestones, not on every 200ms tick.
2. **Semantic Tables:** Include `<caption>`, `<th scope="col">` for column headers, and `<th scope="row">` for squad names.
3. **Buttons with State:** Claim buttons feature `disabled={isLocked}` and `aria-busy={claimingId === crate.id}`.
4. **Contrast & Focus:** Minimum 4.5:1 contrast ratio; `:focus-visible` with 3px cyan outline and 2px offset.
5. **375px Reflow:** Table container styled with `overflow-x: auto; tabIndex={0}` to prevent outer viewport overflow.

---

## 8. Git and Atomic Commit Rules

| Phase | Conventional Commit Message |
|:---|:---|
| Docs | `docs(hw3): add project-rules and task decomposition` |
| Scaffold | `chore(hw3): scaffold react19 vite project` |
| Data & Mock API | `feat(hw3): add arena domain contracts and mock claim API` |
| Drift-Free Timer | `feat(hw3): add drift-free usePubgAirdropTimer hook` |
| Countdown UI | `feat(hw3): add countdown UI with derived drop phases` |
| Optimistic Claim | `feat(hw3): add optimistic claim with in-flight lock and 409 rollback` |
| Leaderboard | `feat(hw3): add filterable and sortable leaderboard` |
| Styling & Reflow | `style(hw3): compose arena page with responsive styles` |
| Verification | `test(hw3): add drift, double-click and rollback verification evidence` |

---

## 9. AI Failure Audit Guidelines

Every AI failure encountered during development must be documented in `AI_FAILURE_AUDIT.md` with:
1. Exact prompt provided.
2. Defective AI code.
3. Root architectural cause.
4. DevTools screenshot or log proof.
5. Engineering fix and Git commit hash.

---

## 10. Definition of Done

1. `npm run build` and `npm run lint` succeed with 0 errors and 0 warnings.
2. Background tab timer drift is zero.
3. Rapid clicking on claim buttons sends exactly 1 request.
4. Simulated 409 Conflict triggers immediate rollback and accessible alert.
5. Leaderboard filter/sort produces 0 cascading re-renders.
6. Lighthouse Accessibility score is 100/100.
7. Evidence artifacts captured in `HW/HW3/evidence/`.
