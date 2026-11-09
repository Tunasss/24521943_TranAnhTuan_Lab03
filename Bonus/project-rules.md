# Project Rules: Situationship State Machine ("Hẹn Hò Nhưng Không Yêu")

## 1. Purpose

This document establishes the architectural standards and code-of-conduct guidelines for the **"Hẹn Hò Nhưng Không Yêu" (Situationship Analyzer)** project. The application models ambiguous romantic relationships through a mathematically sound Finite State Machine (FSM) implemented in React 19, incorporating real-time ghosting timeout countdowns, derived red-flag risk evaluation, and WCAG 2.0 AA accessible interactive telemetry.

---

## 2. AI Code of Conduct

### 2.1 AI MUST Do

| ID | Mandatory Directive | Architectural Reason |
| :--- | :--- | :--- |
| **MUST-01** | Implement state transitions exclusively through a pure, deterministic reducer function in `src/state/relationshipMachine.js`. | Guarantees testability, auditability, and predictability without hidden mutation side effects. |
| **MUST-02** | Guard state transitions with strict predicates (e.g. forbid transitioning to `OFFICIAL_LOVE` if `aiDoScore < emScore`). | Enforces domain invariant integrity directly in the reducer before committing state changes. |
| **MUST-03** | Use wall-clock elapsed timing and clear all active `setTimeout`/`setInterval` instances in effect cleanup functions. | Prevents resource leaks, stale closure race conditions, and phantom timeout triggers after unmount. |
| **MUST-04** | Derive all visual meters, scores, and warning messages synchronously during render. | Adheres to React 19 single source of truth guidelines and eliminates redundant synchronization effects. |
| **MUST-05** | Wrap all live status updates inside `<output role="status" aria-live="polite">` elements with explicit text labels. | Ensures screen-reader users receive prompt, non-intrusive notification of relationship status changes without visual-only cues. |
| **MUST-06** | Maintain full responsiveness across viewports down to 375px width with zero horizontal window scrollbars. | Meets WCAG 2.0 AA Reflow criteria (Success Criterion 1.4.10) for mobile user agents. |

### 2.2 AI MUST NOT Do

| ID | Prohibited Practice | Prevention Reason |
| :--- | :--- | :--- |
| **NOT-01** | Never mutate the previous state object or modify nested signal arrays in place. | In-place mutations break React shallow comparison, leading to missed renders and corrupted time-travel histories. |
| **NOT-02** | Never trigger `window.alert()` or blocking native modal dialogs upon ghosting timeouts or validation errors. | Disrupts assistive technologies, traps keyboard focus, and halts background timer cycles. |
| **NOT-03** | Never use generic `<div>` containers when semantic HTML elements (`<article>`, `<section>`, `<header>`, `<button>`, `<output>`, `<dl>`) apply. | Preserves accessibility tree integrity and adheres to zero-div-soup architectural requirements. |
| **NOT-04** | Never omit cleanup routines from timer effects or rely on unlisted closure values. | Omitting cleanup triggers memory leaks and invokes ghost transitions after manual user resets. |
| **NOT-05** | Never convey red-flag severity solely through red or green color swatches. | Violates WCAG 2.0 AA Guideline 1.4.1 (Use of Color); text descriptors and numeric scores must accompany all indicators. |

---

## 3. Finite State Machine (FSM) Domain Rules

The relationship lifecycle is constrained to the following formal states and event transitions:

### 3.1 States
- `FRIENDS`: Initial baseline state of Platonic connection.
- `DATING_NO_LOVE`: Ambiguous situationship state ("Hẹn hò nhưng không nhận lời yêu").
- `OFFICIAL_LOVE`: Committed romantic partnership state.
- `GHOSTED_EXIT`: Terminated relationship state resulting from unaddressed communication silence.

### 3.2 Transition Matrix

| Current State | Event Trigger | Guard Condition | Next State | Side Effect / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `FRIENDS` | `START_DATING` | None | `DATING_NO_LOVE` | Initializes `lastMessageAt = Date.now()`, clears signals. |
| `DATING_NO_LOVE` | `COMMIT` | `aiDoScore >= emScore` | `OFFICIAL_LOVE` | Transitions to exclusive partnership. |
| `DATING_NO_LOVE` | `COMMIT` | `aiDoScore < emScore` | `DATING_NO_LOVE` | Blocked transition; increments warning counter. |
| `DATING_NO_LOVE` | `PARTNER_REPLIED` | None | `DATING_NO_LOVE` | Resets `lastMessageAt` to current timestamp, decrements timeout urgency. |
| `DATING_NO_LOVE` | `ADD_SIGNAL` | Valid signal type | `DATING_NO_LOVE` | Appends signal (`seen_no_reply`: +20, `reply_after_3_days`: +15, `sweet_talk_no_action`: +10). |
| `DATING_NO_LOVE` | `GHOST_TIMEOUT` | 5000ms elapsed without reply | `GHOSTED_EXIT` | Finalizes relationship termination. |
| `ANY` | `RESET` | None | `FRIENDS` | Resets state machine to initial pristine state. |

---

## 4. Ghosting Timer Rules

1. **Active Window:** The ghosting timer is armed **only** while `state.status === 'DATING_NO_LOVE'`.
2. **Interval Duration:** Inactivity threshold is set to 5000ms (5 seconds).
3. **Reset Invariants:** Receiving a `PARTNER_REPLIED` event immediately resets the reference timestamp and clears the pending timer.
4. **Effect Dependencies:** The timer `useEffect` must depend strictly on `[state.status, state.lastMessageAt]` to avoid stale closure references.
5. **Cleanup:** Return a cleanup closure that calls `clearTimeout(timerId)` to ensure no orphaned timeouts survive component lifecycle shifts.

---

## 5. Accessibility & UX Rules

1. **Semantic Structure:** The analyzer must be wrapped in a semantic `<main>` landmark with `<header>`, `<section>`, and `<article>` subcomponents.
2. **Interactive Controls:** All action triggers must be semantic `<button type="button">` elements with visible text and `:focus-visible` high-contrast outlines.
3. **Live Region Status:** The red-flag score, risk assessment, and countdown are published via `<output role="status" aria-live="polite">`.
4. **Color Contrast:** All foreground text and interactive borders must maintain a contrast ratio $\ge 4.5:1$ against adjacent backgrounds.
5. **Mobile Reflow:** Zero horizontal overflow at 375px viewport width.

---

## 6. Definition of Done (DoD)

- [x] State machine fully implemented in `src/state/relationshipMachine.js` with pure reducer and transition guards.
- [x] Interactive UI created in `src/components/SituationshipAnalyzer.jsx` using `useReducer`.
- [x] 5-second ghosting timer dispatches `GHOST_TIMEOUT` when partner fails to reply in situationship.
- [x] Partner reply button dispatches `PARTNER_REPLIED` and resets the countdown timer.
- [x] Red-flag signals append points and update the accessible live meter synchronously.
- [x] Lighthouse Accessibility score is 100/100 with zero console warnings.
- [x] Automated evidence screenshots captured and committed to `Bonus/evidence/`.
