# Task Decomposition: Production Studio Drum Kit (WBS)

## Project Overview

- **Project:** Production Studio Drum Kit
- **Course:** Web Application Development (LAB 03 - HW1)
- **Student:** Trần Anh Tuấn (24521943)
- **Total Planned Time:** 240 Minutes (4.0 Hours)
- **Accessibility Standard:** WCAG 2.0 Level AA

---

## Work Breakdown Structure (WBS) Summary

| Work Package ID | Work Package Title | Allocated Time (Minutes) | Cumulative Time (Hours) |
|:---|:---|:---:|:---:|
| **WP-01** | Pad Data Model (`DRUM_PADS` & `PAD_MAP`) | 20 | 0.33 |
| **WP-02** | Click-Free Web Audio Synthesis Engine (`drumSynth.js`) | 40 | 1.00 |
| **WP-03** | Physical Keyboard Hook (`useDrumKeyboard.js`) | 35 | 1.58 |
| **WP-04** | Accessible Drum Pad Components (`DrumPad.jsx`) | 35 | 2.17 |
| **WP-05** | Live Hit Log & Decibel Level Meter (`HitLog.jsx`) | 40 | 2.83 |
| **WP-06** | Responsive CSS Modules & 375px Reflow Styling | 40 | 3.50 |
| **WP-07** | Comprehensive Verification & Evidence Capture | 30 | 4.00 |
| **Total** | **7 Work Packages** | **240 Minutes** | **4.0 Hours** |

---

## Detailed Work Package Specifications

### Work Package 1: Pad Data Model (`DRUM_PADS` & `PAD_MAP`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-01` |
| **Task** | Create `src/data/pads.js` exporting `DRUM_PADS` and `PAD_MAP` Map keyed by `e.code`. |
| **Input** | Audio specification for 7 drum sounds (Kick, Snare, Hi-Hat, Tom, Clap, Crash, Ride) with respective physical key bindings (`KeyW` to `KeyL`). |
| **Output** | `src/data/pads.js` with frozen data structures and $O(1)$ lookup Map. |
| **Acceptance Criteria** | 1. Exactly 7 pads defined.<br>2. Each object contains `{ id, label, code, freqHz, decaySec }`.<br>3. `PAD_MAP.get('KeyW')` resolves to Kick pad in $O(1)$ time.<br>4. Data is frozen via `Object.freeze`. |
| **Allocated Minutes** | 20 |

---

### Work Package 2: Click-Free Web Audio Synthesis Engine (`drumSynth.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-02` |
| **Task** | Implement `src/audio/drumSynth.js` exporting `playPad(pad)` with click-free gain ramp and automatic node disposal. |
| **Input** | Pad object containing fundamental synthesis frequency and envelope configuration. |
| **Output** | Low-latency synthesis function returning normalized peak level (`0.0` to `1.0`). |
| **Acceptance Criteria** | 1. Single module-scoped `AudioContext` created lazily on first call.<br>2. `audioCtx.resume()` called if suspended.<br>3. Exponential decay envelope applied via `exponentialRampToValueAtTime(0.0001, now + decaySec)`.<br>4. Zero audible DC-offset pops.<br>5. Nodes disconnected on `'ended'` event to eliminate memory leaks. |
| **Allocated Minutes** | 40 |

---

### Work Package 3: Physical Keyboard Hook (`useDrumKeyboard.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-03` |
| **Task** | Implement custom React hook `useDrumKeyboard(padMap, onTriggerPad, isEnabled)` in `src/hooks/useDrumKeyboard.js`. |
| **Input** | Map of physical key codes and state update callback `(padId, phase) => void`. |
| **Output** | Pure lifecycle hook with robust event listener registration and unmount cleanup. |
| **Acceptance Criteria** | 1. Listens strictly to `e.code` (`KeyW`, etc.), never `keyCode` or `e.key`.<br>2. Bypasses triggers when `e.repeat === true`.<br>3. Bypasses triggers when target is `INPUT`, `TEXTAREA`, or `SELECT`.<br>4. `e.preventDefault()` invoked only for mapped key codes.<br>5. `keyup` invokes `onTriggerPad(pad.id, 'up')`.<br>6. Cleanup function removes all listeners cleanly. |
| **Allocated Minutes** | 35 |

---

### Work Package 4: Accessible Drum Pad Components (`DrumPad.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-04` |
| **Task** | Build `src/components/DrumPad.jsx` as a semantic interactive component. |
| **Input** | Props: `{ label, keyHint, isActive, onPress }`. |
| **Output** | Semantic `<button type="button">` with `aria-pressed` and keyboard accessibility. |
| **Acceptance Criteria** | 1. Zero `<div>` wrapper tags used in `DrumPad.jsx`.<br>2. `aria-pressed={isActive}` communicates active press state.<br>3. Visible label and key hint presented inside `<span>` tags.<br>4. Supports pointer events (`onPointerDown`) and Enter/Space keyboard activations. |
| **Allocated Minutes** | 35 |

---

### Work Package 5: Live Hit Log & Decibel Level Meter (`HitLog.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-05` |
| **Task** | Create `src/components/HitLog.jsx` displaying the last 8 hits in an accessible live region with a dual-modality decibel meter. |
| **Input** | `hits` array of `{ id, label, level, time }` and current peak `level`. |
| **Output** | Accessible log wrapped in `<output aria-live="polite">` and visual `<meter>` paired with text label. |
| **Acceptance Criteria** | 1. `<output aria-live="polite">` announces hits to screen readers.<br>2. `<ol>` displays up to 8 recent hits formatted as `"Label - level XX%"`.<br>3. `<meter min="0" max="100" value={level}>` reflects audio amplitude.<br>4. Visible text label `"Level: XX%"` ensures non-visual equivalence (WCAG 1.3.1).<br>5. Stable keys generated via `crypto.randomUUID()`. |
| **Allocated Minutes** | 40 |

---

### Work Package 6: Responsive CSS Modules & 375px Reflow Styling

| Field | Detail |
|:---|:---|
| **ID** | `WP-06` |
| **Task** | Author CSS Modules for `App`, `DrumPad`, and `HitLog` adhering to WCAG 2.0 AA. |
| **Input** | Visual hierarchy requirements, dark studio color theme, and responsive breakpoints. |
| **Output** | `App.module.css`, `DrumPad.module.css`, `HitLog.module.css`. |
| **Acceptance Criteria** | 1. Contrast ratio $\ge 4.5:1$ on all text and UI boundaries.<br>2. Distinct `:focus-visible` outline (3px solid `#38bdf8`, 2px offset).<br>3. Active press styling uses border and transform change, not color-only.<br>4. Drum grid reflows seamlessly at 375px width with zero horizontal window scrollbars. |
| **Allocated Minutes** | 40 |

---

### Work Package 7: Comprehensive Verification & Evidence Capture

| Field | Detail |
|:---|:---|
| **ID** | `WP-07` |
| **Task** | Run automated tests, linter, production build, and generate verification screenshots into `HW/HW1/evidence/`. |
| **Input** | Completed HW1 application. |
| **Output** | Clean build, clean console, and 4 audit screenshots. |
| **Acceptance Criteria** | 1. `npm run build` and `npm run lint` exit with 0 errors.<br>2. `grep -rn "keyCode" src/` produces 0 matches.<br>3. UniKey Telex input does not intercept physical `KeyW`-`KeyL` codes.<br>4. Lighthouse Accessibility audit scores 100/100.<br>5. Evidence screenshots saved in `HW/HW1/evidence/`. |
| **Allocated Minutes** | 30 |
