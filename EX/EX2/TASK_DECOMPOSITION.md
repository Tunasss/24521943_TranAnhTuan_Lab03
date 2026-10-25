# Task Decomposition: Interactive Pioneer Directory

**Document Type:** Work Breakdown Structure (WBS)  
**Project:** Interactive Pioneer Directory (React 19 + Vite + CSS Modules)  
**Total Estimated Time:** 45 minutes  
**Governed By:** [project-rules.md](./project-rules.md)

---

## Table of Contents

1. [Work Package 1 — Normalized Data Schema with Stable IDs](#1-work-package-1--normalized-data-schema-with-stable-ids)
2. [Work Package 2 — Name Search (Case-Insensitive)](#2-work-package-2--name-search-case-insensitive)
3. [Work Package 3 — Min-IQ Filter and Sort with toSorted](#3-work-package-3--min-iq-filter-and-sort-with-tosorted)
4. [Work Package 4 — Delete and Reset with Focus Management](#4-work-package-4--delete-and-reset-with-focus-management)
5. [Work Package 5 — Live Status Counter and Empty State](#5-work-package-5--live-status-counter-and-empty-state)
6. [Work Package 6 — Verification and Auditing](#6-work-package-6--verification-and-auditing)
7. [Time Allocation Summary](#7-time-allocation-summary)

---

## 1. Work Package 1 — Normalized Data Schema with Stable IDs

**Objective:** Define the baseline dataset of historical scientific pioneers with immutable IDs, create the initial directory layout structure, and establish state management containing only raw input values.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 1.1 | Define `INITIAL_PEOPLE` dataset with normalized pioneer records | Historical pioneer records (name, field, IQ, achievement) | Array of pioneer objects in `src/data/pioneers.js` | Each object contains immutable string `id` (e.g. `'pioneer-01'`), string `name`, string `field`, and numeric `iq` | 2 |
| 1.2 | Scaffold `ScientistDirectory.jsx` with four independent state primitives | `INITIAL_PEOPLE` data constant | Pure function component with `people`, `query`, `minIq`, and `sortBy` state | Component declares exactly 4 `useState` variables; zero `filteredPeople` or redundant cached arrays | 3 |
| 1.3 | Render initial directory list as a semantic unordered list (`<ul>`) with stable keys | `people` state array | Rendered directory cards in `<ul>` list items | Every list item maps with `key={person.id}`; zero array index keys used | 2 |

**Work Package 1 Subtotal: 7 minutes**

---

## 2. Work Package 2 — Name Search (Case-Insensitive)

**Objective:** Implement real-time, case-insensitive text search over pioneer names, wiring an accessible `<form role="search">` with unique control IDs.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 2.1 | Generate unique form control ID with `useId()` and attach `<label htmlFor>` | React 19 `useId` hook | Accessible search `<input>` with connected `<label>` | `<label>` has `htmlFor={searchId}`; clicking the label focuses the search input | 2 |
| 2.2 | Wrap search controls in `<form role="search">` and intercept form submission | User keystrokes and Enter key presses | Semantic search form with `onSubmit={(e) => e.preventDefault()}` | Pressing Enter inside the search box does not trigger a page refresh | 2 |
| 2.3 | Compute case-insensitive name filter synchronously during render | `query` string state and `people` state | Derived array containing records where `name.toLowerCase().includes(query.toLowerCase())` | Whitespace is trimmed; matching is immediate with zero lag and zero `useEffect` | 3 |

**Work Package 2 Subtotal: 7 minutes**

---

## 3. Work Package 3 — Min-IQ Filter and Sort with toSorted

**Objective:** Implement numeric minimum IQ filtering with safe `NaN` fallback handling and multi-criteria sorting using the non-mutating `Array.prototype.toSorted()` method.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 3.1 | Implement minimum IQ number input with `valueAsNumber` and `Number.isNaN()` guard | User number input event | Controlled number input bound to `minIq` state | Erasing the input defaults safely to `0` or fallback threshold without writing `NaN` to state | 2 |
| 3.2 | Implement sort dropdown with options for Name (A-Z, Z-A) and IQ (Ascending, Descending) | Select dropdown change events | Controlled `<select>` element bound to `sortBy` state | Dropdown has explicit `<label htmlFor>` using `useId()`; options cover all 4 sort variations | 2 |
| 3.3 | Combine filter criteria and apply non-mutating `toSorted()` during render | Filtered list and `sortBy` selection | Final `visiblePeople` derived array | Sorting preserves original `people` array in state; sort logic evaluates deterministically on render | 4 |

**Work Package 3 Subtotal: 8 minutes**

---

## 4. Work Package 4 — Delete and Reset with Focus Management

**Objective:** Enable item deletion and directory reset with immutable state updates, descriptive action button labels, and programmatic focus shifting to preserve keyboard context.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 4.1 | Implement immutable delete handler using `setPeople(prev => prev.filter(...))` | Target pioneer `id` | Updated `people` state without mutating prior array | Selected item is removed from state; remaining items maintain correct internal state and keys | 2 |
| 4.2 | Add descriptive `aria-label` to each individual delete button | Pioneer `name` string | Accessible `<button>` element | Button has `aria-label="Delete ${person.name} from directory"`; label distinguishes actions on screen readers | 2 |
| 4.3 | Implement focus management to shift focus to results heading upon item deletion | React `useRef` attached to `<h2 tabIndex={-1}>` | Refocus call `headingRef.current?.focus()` inside delete handler | Active focus moves to the results heading immediately after deletion without falling back to `<body>` | 3 |
| 4.4 | Implement Reset button to restore `INITIAL_PEOPLE` and clear search/filter inputs | Click event on Reset button | Handled state reset resetting `people`, `query`, `minIq`, and `sortBy` | Directory restores all original records and defaults controls back to initial baseline | 2 |

**Work Package 4 Subtotal: 9 minutes**

---

## 5. Work Package 5 — Live Status Counter and Empty State

**Objective:** Provide accessible feedback for result counts and zero-match empty states using live status regions and high-contrast styling.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 5.1 | Implement `<output role="status" aria-live="polite">` announcing active matches | `visiblePeople.length` and `people.length` | Semantic live announcement element | Output text reads "Showing X of Y pioneers"; assistive technology announces count updates politely | 3 |
| 5.2 | Render informative empty state message when zero pioneers match criteria | `visiblePeople.length === 0` conditional | Fallback paragraph explaining no pioneers match the search query | Displays actionable advice (e.g. "Adjust your query or min-IQ threshold to see pioneers"); includes Reset button | 3 |

**Work Package 5 Subtotal: 6 minutes**

---

## 6. Work Package 6 — Verification and Auditing

**Objective:** Execute static analysis, performance inspection, keyboard navigation validation, and Lighthouse accessibility audits to verify zero-effect architecture and WCAG 2.0 AA conformance.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 6.1 | Verify zero `useEffect` hooks across source code via automated grep command | Source code in `src/` | Terminal output from grep command | `grep -rn "useEffect" src/` produces zero matches | 1 |
| 6.2 | Verify single-pass render count during filter and sort using React Profiler | Profiler session recording user actions | Component render log | Modifying search, min-IQ, or sort triggers exactly 1 render per user action without cascading re-renders | 2 |
| 6.3 | Test keyboard-only navigation flow (Tab, Enter, Space, Focus Shift) | Physical keyboard interaction | Recorded navigation checkpoint | All controls reachable via keyboard; focus outline clearly visible; focus shifts to heading after delete | 2.5 |
| 6.4 | Perform Google Lighthouse accessibility and contrast audit | Live application at `localhost:5173` | Lighthouse audit report | Accessibility category scores 100%; color contrast across all controls $\ge 4.5:1$ | 2.5 |

**Work Package 6 Subtotal: 8 minutes**

---

## 7. Time Allocation Summary

The table below summarizes planned time allotments across the six work packages. The sum equals exactly the 45-minute project allotment.

| Work Package | Title | Estimated Time (Minutes) |
|---|---|---|
| WP-1 | Normalized Data Schema with Stable IDs | 7 |
| WP-2 | Name Search (Case-Insensitive) | 7 |
| WP-3 | Min-IQ Filter and Sort with toSorted | 8 |
| WP-4 | Delete and Reset with Focus Management | 9 |
| WP-5 | Live Status Counter and Empty State | 6 |
| WP-6 | Verification and Auditing | 8 |
| **Total** | **Full Project Duration** | **45** |
