# Project Rules: Interactive Pioneer Directory

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [State Architecture Rules](#4-state-architecture-rules)
5. [Form and Control Rules](#5-form-and-control-rules)
6. [List and Data Transformation Rules](#6-list-and-data-transformation-rules)
7. [Accessibility Rules (WCAG 2.0 AA)](#7-accessibility-rules-wcag-20-aa)
8. [Git and Atomic Commit Rules](#8-git-and-atomic-commit-rules)
9. [Definition of Done](#9-definition-of-done)

---

## 1. Purpose and Scope

### 1.1 Purpose

This document is the official **code of conduct for Artificial Intelligence (AI) assistants** developing the **Interactive Pioneer Directory** project (`EX2`). It specifies architectural rules, state management paradigms, form controls, accessibility requirements, and commit conventions that every AI assistant must strictly follow when writing, modifying, or auditing code.

The project demonstrates state-of-the-art React 19 principles:
- **Pure Derived State:** Calculating filtered and sorted lists on-the-fly during render rather than synchronizing redundant state.
- **Zero `useEffect`:** Eliminating synchronization bugs and cascading re-renders by handling user interactions in event handlers.
- **Accessible Focus Management:** Preserving keyboard flow by programmatically refocusing heading landmarks upon item deletion.
- **Strict Accessibility:** Delivering live announcements, accessible forms, and high-contrast styling meeting Web Content Accessibility Guidelines (WCAG) 2.0 Level AA.

### 1.2 Scope

These rules govern all files and code artifacts created for `EX2`, including:
- Component files: `ScientistDirectory.jsx` and any auxiliary UI modules.
- Stylesheets: CSS Modules (`*.module.css`) and global styling resets.
- Application root: `App.jsx`, `main.jsx`, and `index.html`.
- Documentation, task decompositions, verification scripts, and Git commit messages.
- `EX2` is completely standalone: it must **never** import components, styles, or logic from `EX1`.

---

## 2. What the AI Must Do

The following table defines mandatory requirements. Each rule has a unique ID, rule statement, and architectural reason.

| ID | Rule | Reason |
|---|---|---|
| DO-01 | Store only raw, independent user inputs in component state: `people`, `query`, `minIq`, and `sortBy`. | Eliminates stale state bugs and synchronization overhead caused by caching duplicate filtered data. |
| DO-02 | Compute the visible, filtered, and sorted directory list synchronously during rendering as a derived variable. | Ensures the view always reflects the latest state immediately without requiring effect hooks or delayed state dispatches. |
| DO-03 | Apply immutable update patterns for all state transitions (for example, `setPeople(prev => prev.filter(...))`). | Preserves state immutability, enabling predictable reconciliation and avoiding mutation-induced rendering glitches. |
| DO-04 | Generate unique, accessible IDs for all form controls using the React `useId()` hook. | Guarantees universally unique DOM identifiers across Server-Side Rendering (SSR) and client renders without ID collisions. |
| DO-05 | Explicitly associate every `<input>` and `<select>` control with its `<label>` using the `htmlFor` attribute. | Fulfills WCAG 2.0 AA Form Control requirements, allowing screen readers and click targets to activate the input reliably. |
| DO-06 | Read numeric input values using `event.target.valueAsNumber` and supply a fallback default when `Number.isNaN()` evaluates to true. | Prevents `NaN` from polluting state calculations when the user empties a number input field. |
| DO-07 | Wrap search and filter controls in a semantic `<form role="search">` and invoke `event.preventDefault()` on submit. | Provides the standard landmark role for search regions and prevents accidental page reloads upon pressing Enter. |
| DO-08 | Use stable, immutable string/number identifiers from the dataset (such as `person.id`) as React `key` props. | Enables efficient Virtual DOM reconciliation and prevents list items from swapping internal state during deletions. |
| DO-09 | Use the non-mutating `Array.prototype.toSorted()` method to sort the derived list. | Prevents in-place mutation of the original `people` array in state. |
| DO-10 | Provide an accessible, descriptive `aria-label` on every delete button (for example, `aria-label="Delete Marie Curie from directory"`). | Distinguishes identical "Delete" button labels in screen reader element lists by giving full contextual identity. |
| DO-11 | Announce dynamic result counts and empty state updates using a semantic `<output role="status" aria-live="polite">` element. | Fulfills WCAG Status Messages (Criterion 4.1.3), notifying assistive technology users of list changes without stealing focus. |
| DO-12 | Programmatically move focus to the directory results heading after an item is deleted. | Prevents keyboard focus from resetting to `<body>` or becoming lost when the active element is removed from the DOM. |
| DO-13 | Maintain high-contrast colors ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large text/borders) and visible `:focus-visible` rings. | Ensures visual clarity for users with low vision and keyboard-only navigators under WCAG 2.0 AA guidelines. |
| DO-14 | Follow Conventional Commits format for the 3 required atomic commits of EX2. | Preserves clear, traceable project milestones and complies with repository auditing requirements. |

---

## 3. What the AI Must Not Do

The following table lists prohibited practices. Violating any of these constitutes a failed deliverable.

| ID | Rule | Reason |
|---|---|---|
| DONT-01 | Never declare a `useEffect` hook inside `ScientistDirectory.jsx` or any child component. | Derived state and event-driven updates eliminate the need for effect synchronization; effects introduce redundant renders and state tearing. |
| DONT-02 | Never maintain a `filteredPeople` or `visiblePeople` state variable via `useState`. | Caching derived values in state duplicates the source of truth, requiring brittle synchronization logic. |
| DONT-03 | Never mutate arrays in state using mutating methods such as `.sort()`, `.splice()`, `.push()`, or direct index assignment. | State mutations break React's change detection and cause components to fail to re-render. |
| DONT-04 | Never use array index values as React `key` props (for example, `key={index}`). | Causes component state to attach to the wrong item when elements are deleted, filtered, or reordered. |
| DONT-05 | Never render input controls without an explicit accompanying `<label>` connected by `htmlFor`. | Disconnected inputs fail WCAG accessibility audits and create ambiguous inputs for screen reader users. |
| DONT-06 | Never allow keyboard focus to collapse to the document root after removing an item from the list. | Disorients keyboard-only users who must re-tab through the entire page from the beginning. |
| DONT-07 | Never import components, styles, or data schemas from `EX1`. | EX2 is an independent exercise; cross-project dependencies violate modularity and break grading pipelines. |
| DONT-08 | Never use `outline: none` on focusable elements without providing an enhanced, visible alternative focus ring. | Strips accessibility visual cues, violating WCAG 2.0 Success Criterion 2.4.7 (Focus Visible). |
| DONT-09 | Never rely on color alone to communicate deleted status, high IQ, or active sorting states. | Violates WCAG Success Criterion 1.4.1 (Use of Color), excluding users with color vision deficiencies. |
| DONT-10 | Never commit multiple unrelated features or mix documentation with implementation in a single Git commit. | Violates the atomic commit standard and obscures the educational progression. |

---

## 4. State Architecture Rules

### 4.1 Minimal State Representation

The component state must be strictly confined to independent user inputs:

```javascript
// ONLY these 4 state variables are permitted:
const [people, setPeople] = useState(INITIAL_PEOPLE);
const [query, setQuery] = useState('');
const [minIq, setMinIq] = useState(100);
const [sortBy, setSortBy] = useState('name-asc');
```

### 4.2 Synchronous Derived List Calculation

Filter and sort operations must execute purely during rendering:

```javascript
// Pure derived computation during render:
const normalizedQuery = query.trim().toLowerCase();

const visiblePeople = people
  .filter((person) => {
    const matchesName = person.name.toLowerCase().includes(normalizedQuery);
    const matchesIq = Number.isNaN(minIq) || person.iq >= minIq;
    return matchesName && matchesIq;
  })
  .toSorted((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'iq-asc':
        return a.iq - b.iq;
      case 'iq-desc':
        return b.iq - a.iq;
      default:
        return 0;
    }
  });
```

### 4.3 Zero `useEffect` Policy

```bash
# Automated rule verification command
grep -rn "useEffect" src/components/
# Must output zero matches
```

All interactions (filtering, sorting, deleting, resetting) are direct user actions and must be handled synchronously inside event handler functions.

---

## 5. Form and Control Rules

### 5.1 ID Generation via `useId`

Every control must acquire a scoped ID to connect `<label>` and `<input>`:

```javascript
const searchId = useId();
const minIqId = useId();
const sortById = useId();
```

### 5.2 Numeric Value Parsing

Always extract numbers using `valueAsNumber` and guard against `NaN`:

```javascript
const handleMinIqChange = (e) => {
  const val = e.target.valueAsNumber;
  setMinIq(Number.isNaN(val) ? 0 : val);
};
```

### 5.3 Form Landmark and PreventDefault

```jsx
<form
  role="search"
  aria-label="Pioneer directory filters"
  onSubmit={(e) => e.preventDefault()}
>
  {/* controls */}
</form>
```

---

## 6. List and Data Transformation Rules

### 6.1 Normalized Dataset Schema

The initial dataset must contain rich, historical pioneer records with stable, immutable IDs:

```javascript
const INITIAL_PEOPLE = [
  { id: 'pioneer-01', name: 'Marie Curie', field: 'Radioactivity & Physics', iq: 185 },
  { id: 'pioneer-02', name: 'Albert Einstein', field: 'Theoretical Physics', iq: 160 },
  { id: 'pioneer-03', name: 'Alan Turing', field: 'Computer Science & Cryptography', iq: 185 },
  { id: 'pioneer-04', name: 'Ada Lovelace', field: 'Computing & Mathematics', iq: 170 },
  { id: 'pioneer-05', name: 'Nikola Tesla', field: 'Electrical Engineering', iq: 160 },
  { id: 'pioneer-06', name: 'Rosalind Franklin', field: 'X-Ray Crystallography', iq: 175 },
];
```

### 6.2 Non-Mutating Array Sorting

Sorting must use `toSorted()` (ECMAScript 2023 / modern browsers) or a shallow copy `[...array].sort()` to ensure the original array is never mutated.

---

## 7. Accessibility Rules (WCAG 2.0 AA)

### 7.1 Dynamic Result Announcement

Display the active match count inside a live region:

```jsx
<output role="status" aria-live="polite" className={styles.statusCount}>
  Showing {visiblePeople.length} of {people.length} pioneers
</output>
```

### 7.2 Programmatic Focus Management Upon Deletion

When a user deletes a card, move focus to the directory heading so keyboard navigators maintain context:

```javascript
const resultsHeadingRef = useRef(null);

const handleDelete = (id) => {
  setPeople((prev) => prev.filter((p) => p.id !== id));
  // Shift keyboard focus to results heading
  resultsHeadingRef.current?.focus();
};
```

The heading must be focusable via `tabIndex={-1}`:

```jsx
<h2 ref={resultsHeadingRef} tabIndex={-1} className={styles.resultsHeading}>
  Pioneer Roster
</h2>
```

### 7.3 Descriptive Delete Buttons

```jsx
<button
  type="button"
  onClick={() => handleDelete(person.id)}
  aria-label={`Remove ${person.name} from directory`}
>
  Delete
</button>
```

---

## 8. Git and Atomic Commit Rules

The work in `EX2` must be structured into exactly **3 mandatory atomic commits**:

1. **Commit 1 (Documentation):**  
   `docs(ex2): add project-rules and task decomposition`
2. **Commit 2 (Implementation):**  
   `feat(ex2): implement interactive ScientistDirectory with search, filters, sorting and delete`
3. **Commit 3 (Verification & Evidence):**  
   `test(ex2): add keyboard focus and zero-useEffect verification evidence`

---

## 9. Definition of Done

A deliverable is complete only when all the following criteria pass:

- [ ] `ScientistDirectory.jsx` contains **zero `useEffect` hooks** (`grep -rn "useEffect" src/` produces 0 matches).
- [ ] No `filteredPeople` or `visiblePeople` state exists in `useState`.
- [ ] Filtered and sorted results are computed synchronously during rendering.
- [ ] Form controls use `useId()` and all `<label>` tags have `htmlFor`.
- [ ] Number input uses `valueAsNumber` with fallback handling for `NaN`.
- [ ] Search form has `role="search"` and calls `preventDefault()` on submit.
- [ ] List keys use stable `person.id` (no index keys).
- [ ] Deleting an item smoothly shifts focus to the results heading (`tabIndex={-1}`).
- [ ] Results count is announced via `<output role="status" aria-live="polite">`.
- [ ] Reset button restores the complete original dataset and clears filters.
- [ ] All interactive elements are fully operable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`).
- [ ] Lighthouse Accessibility score is 100%.
- [ ] The 3 mandatory atomic commits follow the Conventional Commits specification.
