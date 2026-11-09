# Project Rules: Production Studio Drum Kit

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [Keyboard Handling Rules](#4-keyboard-handling-rules)
5. [React 19 Effect and Hook Rules](#5-react-19-effect-and-hook-rules)
6. [Web Audio API Rules](#6-web-audio-api-rules)
7. [Accessibility Rules (WCAG 2.0 AA)](#7-accessibility-rules-wcag-20-aa)
8. [Component Architecture Rules](#8-component-architecture-rules)
9. [Git and Atomic Commit Rules](#9-git-and-atomic-commit-rules)
10. [Definition of Done](#10-definition-of-done)

---

## 1. Purpose and Scope

This document establishes the binding engineering rules and code of conduct for developing the **Production Studio Drum Kit** application using **React 19** and **Vite**. The application provides 7 responsive low-latency drum pads triggered either via direct pointer interaction or via physical keyboard shortcuts (`KeyW`, `KeyA`, `KeyS`, `KeyD`, `KeyJ`, `KeyK`, `KeyL`). It includes synthesized click-free Web Audio sounds, a screen-reader-accessible hit log (`<output aria-live="polite">`), and a real-time decibel level meter with textual equivalents.

---

## 2. What the AI Must Do

| ID | Mandatory Rule | Technical Rationale |
|:---|:---|:---|
| **REQ-01** | Map physical keyboard keys strictly using `e.code` (`KeyW`, `KeyA`, `KeyS`, `KeyD`, `KeyJ`, `KeyK`, `KeyL`). | Guarantees hardware-level layout consistency regardless of input method editor (IME) software like UniKey (Telex/VNI) or international layouts (AZERTY/QWERTZ). |
| **REQ-02** | Ignore keyboard repeat events (`if (e.repeat) return;`). | Prevents audio distortion, oscillator flooding, and unbounded state thrashing when a key is held down. |
| **REQ-03** | Bypass drum triggering when keyboard focus is inside editable form controls (`INPUT`, `TEXTAREA`, `SELECT`). | Allows users to type normally inside input fields without accidentally firing audio hits. |
| **REQ-04** | Call `e.preventDefault()` exclusively on mapped drum keys. | Preserves standard browser keyboard navigation (Tab, Enter, Space, F-keys) while avoiding unwanted window scrolling. |
| **REQ-05** | Reset pressed state deterministically on `keyup`. | Synchronizes visual active states with physical key release cycles. |
| **REQ-06** | Create a single shared `AudioContext` lazily on the first user gesture. | Complies with modern browser Autoplay policies and prevents audio pipeline blocking. |
| **REQ-07** | Apply click-free exponential gain envelopes and disconnect audio nodes on completion. | Prevents sudden DC offset clicks (audio pops) and avoids Web Audio memory leaks. |
| **REQ-08** | Implement drum pads as semantic `<button type="button">` with `aria-pressed`. | Communicates interactive button semantics and toggle/press state directly to assistive technologies. |
| **REQ-09** | Enclose the hit log in an `<output aria-live="polite">` element. | Automatically announces new drum hits to screen reader users without interrupting active speech. |
| **REQ-10** | Couple `<meter>` with an explicit textual value label (e.g., `Level: 85%`). | Satisfies WCAG 1.3.1 by ensuring meter measurements are accessible non-visually. |

---

## 3. What the AI Must Not Do

| ID | Forbidden Action | Consequence of Violation |
|:---|:---|:---|
| **PROHIB-01** | Never use `e.keyCode`, `e.which`, or `e.key` for drum trigger mapping. | `keyCode` and `which` are deprecated Web APIs; `e.key` changes when modifiers or Vietnamese IMEs (UniKey) compose characters (e.g., `KeyW` becomes `ư`). |
| **PROHIB-02** | Never omit the cleanup function in `useEffect` for window event listeners. | Creates zombie event listeners, memory leaks, and duplicate audio triggers on hot reload or component re-render. |
| **PROHIB-03** | Never create an unconstrained or non-reusable `AudioContext` per keypress. | Hits the browser limit for active `AudioContext` instances (typically 6), throwing errors. |
| **PROHIB-04** | Never leave oscillator or gain nodes connected indefinitely. | Leaks audio graph nodes in the browser audio thread, causing performance degradation. |
| **PROHIB-05** | Never wrap components in generic `<div>`-soup when semantic elements apply. | Degrades the Accessibility Tree and landmark navigation for assistive tech. |
| **PROHIB-06** | Never introduce keyboard traps; all focusable elements must be navigable via Tab/Shift+Tab. | Violates WCAG 2.1.2 (No Keyboard Trap). |
| **PROHIB-07** | Never hardcode colors without satisfying contrast ratios ($\ge 4.5:1$). | Violates WCAG 1.4.3 (Contrast Minimum). |
| **PROHIB-08** | Never allow horizontal window scrolling at 375px mobile viewport. | Violates WCAG 1.4.10 (Reflow). |

---

## 4. Keyboard Handling Rules

1. **Hardware Position Fidelity:** Only `e.code` is inspected to identify keys. The mapped codes are:
   - `KeyW` $\rightarrow$ Kick (`pad-w`)
   - `KeyA` $\rightarrow$ Snare (`pad-a`)
   - `KeyS` $\rightarrow$ Hi-Hat (`pad-s`)
   - `KeyD` $\rightarrow$ Tom (`pad-d`)
   - `KeyJ` $\rightarrow$ Clap (`pad-j`)
   - `KeyK` $\rightarrow$ Crash (`pad-k`)
   - `KeyL` $\rightarrow$ Ride (`pad-l`)
2. **Input Exclusion Guard:**
   ```javascript
   const target = e.target;
   const tagName = target?.tagName;
   if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target?.isContentEditable) {
     return;
   }
   ```
3. **Repeat Prevention:** Key repeat events generated by the OS holding down a physical key must be rejected:
   ```javascript
   if (e.repeat) return;
   ```
4. **Selective Cancellation:** Only call `e.preventDefault()` if `padMap.has(e.code)`.

---

## 5. React 19 Effect and Hook Rules

1. **Custom Hook Encapsulation:** Keyboard listening logic resides in `src/hooks/useDrumKeyboard.js`.
2. **Honest Dependencies:** `useEffect` must list all referenced values (`padMap`, `onTriggerPad`, `isEnabled`) or use a ref-bridge if a stable callback is guaranteed.
3. **Strict Teardown:** The effect cleanup must remove both `'keydown'` and `'keyup'` event listeners from `window`:
   ```javascript
   window.addEventListener('keydown', handleKeyDown);
   window.addEventListener('keyup', handleKeyUp);
   return () => {
     window.removeEventListener('keydown', handleKeyDown);
     window.removeEventListener('keyup', handleKeyUp);
   };
   ```

---

## 6. Web Audio API Rules

1. **Lazy AudioContext Initialization:** The `AudioContext` is created only when the first `playPad()` call occurs in response to an explicit user interaction (pointer down or key down).
2. **Suspension Auto-Resume:** If the context state is `'suspended'`, call `audioCtx.resume()`.
3. **Click-Free Gain Envelopes:**
   - Gain starts at attack level (e.g., 0.8 to 1.0).
   - Use `gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15)` to taper smoothly to zero without audible clicks or pops.
4. **Graph Teardown:** Attach an event listener to the oscillator node's `'ended'` event to disconnect both oscillator and gain nodes from the destination:
   ```javascript
   osc.onended = () => {
     osc.disconnect();
     gain.disconnect();
   };
   ```

---

## 7. Accessibility Rules (WCAG 2.0 AA)

1. **Semantic Elements:** Drum pads are rendered as `<button type="button" aria-pressed={isActive}>`.
2. **Visible and Accessible Labels:** Each button displays the drum label (e.g., "Kick") and physical key indicator (e.g., `[W]`) wrapped inside readable text elements.
3. **Screen Reader Live Announcements:** Recent drum triggers append to an `<output aria-live="polite">` container with descriptive log entries (`Kick - level 85%`).
4. **Dual Modality Meter:** The `<meter>` element is visually accompanied by a sibling text node (`Level: 85%`) to provide equivalent information to all users.
5. **Focus Indicators:** `:focus-visible` must display a conspicuous 3px outline with a 2px offset.
6. **Mobile Reflow (375px):** Pad grid must automatically wrap on small viewports without triggering horizontal scrolling.

---

## 8. Component Architecture Rules

1. **Pure Functional Components:** Class components and legacy `defaultProps` are prohibited.
2. **Immutable State Transitions:** State arrays (`activeIds`, `hits`) are updated immutably using array spreading and slicing (e.g., retaining the latest 8 hits).
3. **Modular CSS:** All styles are authored using CSS Modules (`App.module.css`, `DrumPad.module.css`, `HitLog.module.css`) without `!important` declarations.

---

## 9. Git and Atomic Commit Rules

Every commit must be atomic, cleanly separated, and message-formatted according to Conventional Commits:

| Phase | Conventional Commit Message |
|:---|:---|
| Docs | `docs(hw1): add project-rules and task decomposition` |
| Scaffold | `chore(hw1): scaffold react19 vite project` |
| Audio & Data | `feat(hw1): add pad data model and click-free audio engine` |
| Keyboard Hook | `feat(hw1): add useDrumKeyboard hook with e.code and repeat guard` |
| UI & Meter | `feat(hw1): add accessible pads, hit log and level meter` |
| Verification | `test(hw1): add accessibility and keyboard verification evidence` |

---

## 10. Definition of Done

1. `npm run build` passes with zero errors.
2. `npm run lint` passes with 0 errors and 0 warnings.
3. Physical keys `W`, `A`, `S`, `D`, `J`, `K`, `L` trigger respective pads regardless of UniKey IME mode.
4. Holding a key produces only one trigger (`e.repeat` is guarded).
5. Typing in a text input does not trigger drum sounds.
6. Lighthouse Accessibility score is 100/100.
7. Mobile 375px viewport displays without horizontal scrollbars.
8. Evidence screenshots are captured and verified in `HW/HW1/evidence/`.
