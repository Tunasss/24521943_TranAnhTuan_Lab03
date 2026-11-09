# Task Decomposition: PUBG Vietnam Airdrop Arena (WBS)

## Project Overview

- **Project:** PUBG Vietnam Airdrop Arena & Championship
- **Course:** Web Application Development (LAB 03 - HW3)
- **Student:** Trần Anh Tuấn (24521943)
- **Total Planned Time:** 480 Minutes (8.0 Hours)
- **Accessibility Standard:** WCAG 2.0 Level AA

---

## Work Breakdown Structure (WBS) Summary

| Work Package ID | Work Package Title | Allocated Time (Minutes) | Cumulative Time (Hours) |
|:---|:---|:---:|:---:|
| **WP-01** | Domain Contracts & Mock Datasets (`arena.js`) | 35 | 0.58 |
| **WP-02** | Mock Server API with 409 Conflict Simulation (`claimApi.js`) | 45 | 1.33 |
| **WP-03** | Drift-Free Timer Hook (`usePubgAirdropTimer.js`) | 50 | 2.17 |
| **WP-04** | Countdown UI with Derived Drop Phases (`AirdropCountdown.jsx`) | 50 | 3.00 |
| **WP-05** | Optimistic Claim Engine with Lock & 409 Rollback (`CrateClaimPanel.jsx`) | 65 | 4.08 |
| **WP-06** | Pure Derived Esports Leaderboard (`Leaderboard.jsx`) | 50 | 4.92 |
| **WP-07** | Responsive Styling, VND Currency & 375px Layout | 55 | 5.83 |
| **WP-08** | Verification (Background Tab, Double-Click, 409, Lighthouse) | 70 | 7.00 |
| **WP-09** | AI Failure Audit Documentation (`AI_FAILURE_AUDIT.md`) | 60 | 8.00 |
| **Total** | **9 Work Packages** | **480 Minutes** | **8.0 Hours** |

---

## Detailed Work Package Specifications

### Work Package 1: Domain Contracts & Mock Datasets (`arena.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-01` |
| **Task** | Create `src/data/arena.js` with JSDoc contracts and mock data for crates and squads. |
| **Input** | DropPhase union (`'WARMUP'` \| `'AIRDROP_LIVE'` \| `'LOOTED_OUT'` \| `'EXPIRED'`), Crate schema, and Squad standing schema. |
| **Output** | `src/data/arena.js` exporting `INITIAL_CRATES` and `SQUADS`. |
| **Acceptance Criteria** | 1. JSDoc `@typedef` for `DropPhase`, `PubgCrateDrop`, `PubgVnSquadStanding`.<br>2. 3 initial crates with future `dropEpochMs`.<br>3. Standings for The Expendables (te), Cerberus Esports (ces), Roy Esports (roy), AGG (agg).<br>4. Data frozen via `Object.freeze`. |
| **Allocated Minutes** | 35 |

---

### Work Package 2: Mock Server API with 409 Conflict Simulation (`claimApi.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-02` |
| **Task** | Create `src/api/claimApi.js` with latency, stock tracking, and 409 Conflict responses. |
| **Input** | `crateId` and optional `{ signal }`. |
| **Output** | Asynchronous `claimCrate()` and `getServerOffsetMs()`. |
| **Acceptance Criteria** | 1. 400-900ms simulated network latency.<br>2. 409 Conflict rejection when stock is 0 or under randomized contention.<br>3. AbortController cancellation returning `DOMException('Aborted', 'AbortError')`.<br>4. Accurate inventory management. |
| **Allocated Minutes** | 45 |

---

### Work Package 3: Drift-Free Timer Hook (`usePubgAirdropTimer.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-03` |
| **Task** | Implement `usePubgAirdropTimer(targetEpochMs, serverOffsetMs)` calculating remaining time from epoch. |
| **Input** | Target timestamp in milliseconds and optional server clock offset. |
| **Output** | `{ remainingMs, isLive: remainingMs === 0 }`. |
| **Acceptance Criteria** | 1. Zero counter decrementing (`no setSeconds(s => s - 1)`).<br>2. 200ms sync interval with immediate invocation.<br>3. `visibilitychange` listener resynchronizes immediately upon tab focus.<br>4. Full cleanup on unmount. |
| **Allocated Minutes** | 50 |

---

### Work Package 4: Countdown UI with Derived Drop Phases (`AirdropCountdown.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-04` |
| **Task** | Create `AirdropCountdown.jsx` deriving phases purely during render. |
| **Input** | `remainingMs`, total stock, and drop window duration. |
| **Output** | Accessible countdown header with formatted `<time>` (mm:ss) and coarse polite announcements. |
| **Acceptance Criteria** | 1. Phase derived purely (`WARMUP`, `AIRDROP_LIVE`, `LOOTED_OUT`, `EXPIRED`).<br>2. `<output role="status" aria-live="polite">` announces only on phase change or 10s intervals.<br>3. Semantic `<time>` element with ISO duration format. |
| **Allocated Minutes** | 50 |

---

### Work Package 5: Optimistic Claim Engine with Lock & 409 Rollback (`CrateClaimPanel.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-05` |
| **Task** | Build `CrateClaimPanel.jsx` supporting in-flight locks, optimistic decrement, and snapshot rollback. |
| **Input** | Array of crates, active drop phase, and `claimCrate` API. |
| **Output** | Interactive crate grid with accessible `<section role="alert">` and claim locks. |
| **Acceptance Criteria** | 1. `claimingId` lock prevents rapid duplicate submissions.<br>2. Stock decremented optimistically.<br>3. 409 Conflict triggers immediate rollback to snapshot.<br>4. In-flight request aborted on unmount. |
| **Allocated Minutes** | 65 |

---

### Work Package 6: Pure Derived Esports Leaderboard (`Leaderboard.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-06` |
| **Task** | Create `Leaderboard.jsx` supporting name search and multi-criteria sorting without `useEffect`. |
| **Input** | `SQUADS` dataset. |
| **Output** | Accessible `<table>` with `<caption>`, `<th scope="col">`, `<th scope="row">`. |
| **Acceptance Criteria** | 1. Filtered and sorted purely during render via `toSorted()`.<br>2. Form controls mapped via `useId()`.<br>3. Results count in `<output role="status">`.<br>4. Zero `useEffect` hooks. |
| **Allocated Minutes** | 50 |

---

### Work Package 7: Responsive Styling, VND Currency & 375px Layout

| Field | Detail |
|:---|:---|
| **ID** | `WP-07` |
| **Task** | Design CSS Modules for all components conforming to WCAG 2.0 AA. |
| **Input** | Dark military esports aesthetic requirements and currency formatting specs. |
| **Output** | `App.module.css`, `AirdropCountdown.module.css`, `CrateClaimPanel.module.css`, `Leaderboard.module.css`. |
| **Acceptance Criteria** | 1. Contrast ratio $\ge 4.5:1$.<br>2. Prices formatted in VND (`250.000 ₫`).<br>3. `:focus-visible` with 3px outline.<br>4. Zero horizontal window scrollbar at 375px. |
| **Allocated Minutes** | 55 |

---

### Work Package 8: Verification (Background Tab, Double-Click, 409, Lighthouse)

| Field | Detail |
|:---|:---|
| **ID** | `WP-08` |
| **Task** | Capture empirical DevTools proof of anti-drift, double-click prevention, 409 rollback, and Lighthouse audit. |
| **Input** | Complete HW3 application. |
| **Output** | 5 verification screenshots in `HW/HW3/evidence/`. |
| **Acceptance Criteria** | 1. Background tab switch maintains millisecond accuracy.<br>2. Rapid click spam emits exactly 1 network request.<br>3. Simulated 409 rolls back inventory and renders alert.<br>4. Lighthouse Accessibility score is 100/100. |
| **Allocated Minutes** | 70 |

---

### Work Package 9: AI Failure Audit Documentation (`AI_FAILURE_AUDIT.md`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-09` |
| **Task** | Update root `AI_FAILURE_AUDIT.md` logging genuine AI defects in HW3. |
| **Input** | Observed AI errors during HW3 (timer counter decrementing, unhandled 409 rollback). |
| **Output** | Rigorous engineering audit with prompts, defective code, DevTools proof, and commit fixes. |
| **Acceptance Criteria** | 1. Min. 3 failure entries with empirical proof.<br>2. Root architectural causes documented.<br>3. Verified commit hashes included. |
| **Allocated Minutes** | 60 |
