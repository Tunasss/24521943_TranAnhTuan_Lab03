# Work Breakdown Structure (WBS): Situationship Analyzer

## 1. Project Overview

- **Project:** "Hẹn Hò Nhưng Không Yêu" (Situationship Finite State Machine)
- **Architecture:** React 19, `useReducer`, Pure Finite State Machine, Real-Time Inactivity Timer
- **Total Estimated Duration:** 90 Minutes (1.5 Hours)
- **Accessibility Standard:** WCAG 2.0 AA Compliant Documentation and UI

---

## 2. Work Packages

### WP-01: FSM State Machine Modeling & Domain Contracts

| Field | Specification |
| :--- | :--- |
| **ID** | WP-01 |
| **Task** | Implement pure `relationshipReducer` with states, actions, signal penalties, and transition guards. |
| **Input** | State machine specifications (`FRIENDS`, `DATING_NO_LOVE`, `OFFICIAL_LOVE`, `GHOSTED_EXIT`). |
| **Output** | `src/state/relationshipMachine.js` with pure reducer and action helpers. |
| **Acceptance Criteria** | State transitions follow the formal transition matrix; illegal transitions are no-ops; COMMIT is blocked when `aiDoScore < emScore`; signals add specified weights. |
| **Minutes** | 20 |

---

### WP-02: Situationship Analyzer Component & Timer Hook Wiring

| Field | Specification |
| :--- | :--- |
| **ID** | WP-02 |
| **Task** | Build `SituationshipAnalyzer.jsx` with `useReducer` and the 5-second ghosting timer. |
| **Input** | `relationshipReducer`, React 19 `useEffect`, `useReducer`. |
| **Output** | `src/components/SituationshipAnalyzer.jsx` with real-time countdown and dispatch actions. |
| **Acceptance Criteria** | In `DATING_NO_LOVE`, 5s timer triggers `GHOST_TIMEOUT`; clicking partner replied dispatches `PARTNER_REPLIED` and resets timer; cleanup removes timer. |
| **Minutes** | 25 |

---

### WP-03: Red-Flag Meter, Derived Telemetry & Accessible Output

| Field | Specification |
| :--- | :--- |
| **ID** | WP-03 |
| **Task** | Implement derived red-flag risk evaluation and accessible `<output role="status" aria-live="polite">` announcer. |
| **Input** | State signals array and score calculations. |
| **Output** | Accessible meter UI with numeric percentages, qualitative badges, and live screen-reader regions. |
| **Acceptance Criteria** | Red-flag level calculated synchronously during render; no color-only indicators; status output announces state transitions and warnings. |
| **Minutes** | 15 |

---

### WP-04: Responsive Layout & Mobile Reflow Styling

| Field | Specification |
| :--- | :--- |
| **ID** | WP-04 |
| **Task** | Author CSS Modules for visual hierarchy, high-contrast states, and mobile reflow. |
| **Input** | Design specs, WCAG contrast guidelines, 375px mobile viewport targets. |
| **Output** | `SituationshipAnalyzer.module.css` and `App.module.css`. |
| **Acceptance Criteria** | Contrast ratio $\ge 4.5:1$ across all text; `:focus-visible` styling on all buttons; zero horizontal scroll at 375px width. |
| **Minutes** | 15 |

---

### WP-05: Automated Headless Verification & Evidence Capture

| Field | Specification |
| :--- | :--- |
| **ID** | WP-05 |
| **Task** | Write and execute Puppeteer automated verification script for ghosting timer, reply cancel, and mobile reflow. |
| **Input** | Running Vite preview server on port 5184. |
| **Output** | 4 high-resolution screenshot evidence files in `Bonus/evidence/`. |
| **Acceptance Criteria** | `01-ghosting-5s-timeout.png`, `02-partner-replied-cancel.png`, `03-lighthouse-100.png`, `04-mobile-375px-reflow.png` generated and verified. |
| **Minutes** | 15 |

---

## 3. Summary Timeline

| Work Package ID | Name | Duration (Minutes) | Cumulative Time |
| :--- | :--- | :--- | :--- |
| **WP-01** | FSM State Machine Modeling | 20 | 20 min |
| **WP-02** | Analyzer Component & Ghosting Timer | 25 | 45 min |
| **WP-03** | Red-Flag Meter & Live Announcements | 15 | 60 min |
| **WP-04** | Responsive CSS Modules & Reflow | 15 | 75 min |
| **WP-05** | Headless Verification & Evidence | 15 | 90 min (1.5 hrs) |
