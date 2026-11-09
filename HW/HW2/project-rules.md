# Project Rules: 88-Key Polyphonic Piano & FIFO Sequencer

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [Key Generation and Mathematical Rules](#4-key-generation-and-mathematical-rules)
5. [Polyphonic Voice Architecture and FIFO Stealing Rules](#5-polyphonic-voice-architecture-and-fifo-stealing-rules)
6. [Render Isolation and React 19 Performance Rules](#6-render-isolation-and-react-19-performance-rules)
7. [Sequencer and Abortable Replay Rules](#7-sequencer-and-abortable-replay-rules)
8. [Accessibility Rules (WCAG 2.0 AA)](#8-accessibility-rules-wcag-20-aa)
9. [Git and Atomic Commit Rules](#9-git-and-atomic-commit-rules)
10. [Definition of Done](#10-definition-of-done)

---

## 1. Purpose and Scope

This document specifies the software architecture, performance constraints, and accessibility requirements for the **88-Key Polyphonic Piano and FIFO Sequencer** developed using **React 19** and **Vite**. The application dynamically synthesizes an 88-key standard acoustic grand piano keyboard (A0 to C8) using pure mathematical tuning formulas, manages polyphony via an 8-voice FIFO voice stealing algorithm in Web Audio API, isolates component renders with `React.memo` so playing a note re-renders strictly one key, and provides a multi-speed abortable sequence recording and playback engine.

---

## 2. What the AI Must Do

| ID | Mandatory Rule | Technical Rationale |
|:---|:---|:---|
| **REQ-01** | Compute all 88 keys algorithmically from MIDI numbers 21 (`A0`) through 108 (`C8`). | Eliminates verbose hardcoded markup; guarantees standard 12-TET tuning with $f = 440 \times 2^{(midi - 69) / 12}$. |
| **REQ-02** | Validate exactly 52 white keys and 36 black keys in generated dataset. | Enforces geometric and musicological accuracy matching physical 88-key grand pianos. |
| **REQ-03** | Track active voices in an ES6 `Map` capped at a strict maximum of 8 voices (`maxVoices = 8`). | Restricts CPU audio processing thread load and implements deterministic voice allocation. |
| **REQ-04** | Implement FIFO voice stealing via `voices.keys().next().value` when capacity is exceeded. | Automatically releases the oldest voice without audio glitches when playing 9+ concurrent notes. |
| **REQ-05** | Apply click-free exponential release ramps (`exponentialRampToValueAtTime`) on `noteOff`. | Prevents abrupt waveform truncation and audible pop artifacts. |
| **REQ-06** | Wrap `PianoKey` in `React.memo` and provide stable callback references. | Prevents all 88 keys from re-rendering when a single key is pressed, ensuring 60fps rendering performance. |
| **REQ-07** | Record events as `{ midi, freqHz, durationMs, deltaMs }` in a FIFO array using `performance.now()`. | Captures high-precision timing intervals independent of wall-clock drift. |
| **REQ-08** | Integrate `AbortController` into `replaySequence()` for instant playback cancellation. | Ensures immediate audio silencing on Stop or component unmount, preventing orphaned timer leaks. |
| **REQ-09** | Provide an accessible scrollable piano container with `overflow-x: auto` and `tabIndex={0}`. | Allows full keyboard navigation and exploration across the 88-key layout on constrained viewports. |
| **REQ-10** | Announce recording and replay state changes via `<output role="status" aria-live="polite">`. | Guarantees non-visual users are immediately aware of sequencer state transitions. |

---

## 3. What the AI Must Not Do

| ID | Forbidden Action | Consequence of Violation |
|:---|:---|:---|
| **PROHIB-01** | Never hardcode 88 JSX key elements or static JSON files. | Violates algorithmic generation invariant and bloats bundle size. |
| **PROHIB-02** | Never exceed 8 concurrent active Web Audio oscillators. | Violates FIFO polyphony constraints and causes audio buffer starvation. |
| **PROHIB-03** | Never trigger a re-render of 88 keys when playing a single key. | Fails React DevTools Profiler audit; causes severe UI thread lag and frame drops. |
| **PROHIB-04** | Never recreate `onNoteOn` or `onNoteOff` callbacks with changing state dependencies. | Breaks `React.memo` shallow prop comparisons, defeating render isolation. |
| **PROHIB-05** | Never use `setInterval` or un-cancelable `setTimeout` chains for sequence replay. | Causes memory leaks, audio playback overlap, and impossible cancellation after component unmount. |
| **PROHIB-06** | Never use `Date.now()` for sequence interval delta calculations. | Inaccurate millisecond resolution vulnerable to system clock adjustments. |
| **PROHIB-07** | Never allow horizontal page scrollbars at 375px; horizontal scroll is permitted ONLY inside the piano track. | Violates mobile-first WCAG 1.4.10 reflow requirements. |

---

## 4. Key Generation and Mathematical Rules

1. **MIDI Range:** Inclusive boundary from MIDI 21 ($A_0$, $27.5\text{ Hz}$) to MIDI 108 ($C_8$, $4186.01\text{ Hz}$).
2. **Frequency Formula:**
   $$f = 440 \times 2^{\frac{midi - 69}{12}}$$
3. **Note Naming:**
   - Note array: `['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`
   - Octave computation: `Math.floor(midi / 12) - 1`
   - Black key classification: `noteName.includes('#')`
4. **Verification Invariants:**
   - Total keys: 88
   - White keys: 52
   - Black keys: 36
   - MIDI 69 $\rightarrow$ A4 $\rightarrow$ 440.00 Hz

---

## 5. Polyphonic Voice Architecture and FIFO Stealing Rules

1. **Lazy Initialization:** `AudioContext` is created only on the first user interaction.
2. **Capacity Enforcement:**
   ```javascript
   if (this.voices.size >= this.maxVoices) {
     const oldestMidi = this.voices.keys().next().value;
     this.noteOff(oldestMidi);
   }
   ```
3. **Envelope Configuration:**
   - Attack: instantaneous start at amplitude `0.2`.
   - Release: `gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.04)`.
   - Stop oscillator at `currentTime + 0.05`.
   - Event listener on `osc.onended` disconnects both oscillator and gain nodes and purges the entry from `this.voices`.
4. **Master Killswitch:** `stopAll()` releases all active voices immediately.

---

## 6. Render Isolation and React 19 Performance Rules

1. **Component Wrapping:**
   ```jsx
   export const PianoKey = memo(function PianoKey({ midi, noteName, isBlack, isPressed, onNoteOn, onNoteOff }) {
     // Callback props MUST be stable functions to maintain memoization
   });
   ```
2. **Stable Callback Invariants:** In `App.jsx`, `onNoteOn` and `onNoteOff` are memoized using `useCallback(..., [])` and utilize functional updates (`setPressedMidis(prev => ...)`).
3. **Profiler Metric:** Pressing a single key must show strictly **1 component render** in React DevTools Profiler, not 88.

---

## 7. Sequencer and Abortable Replay Rules

1. **FIFO Sequence Recorder:**
   - Records each event as `{ midi, freqHz, durationMs, deltaMs }`.
   - Uses `performance.now()` passed explicitly to prevent time discrepancies.
2. **Abortable Replay Engine:**
   - Multiplies playback timing by speed factor (`deltaMs / speed`, `durationMs / speed`).
   - Uses a cancellable delay:
     ```javascript
     await new Promise((resolve, reject) => {
       const timer = setTimeout(resolve, delayMs);
       signal.addEventListener('abort', () => {
         clearTimeout(timer);
         reject(new DOMException('Aborted', 'AbortError'));
       }, { once: true });
     });
     ```
   - On abort, invokes `synth.stopAll()` and throws.
   - UI catches `err.name === 'AbortError'` and resets to `IDLE` cleanly without errors.

---

## 8. Accessibility Rules (WCAG 2.0 AA)

1. **Semantic Elements:** Each key is a `<button type="button" aria-pressed={isPressed} aria-label={noteName}>`.
2. **Keyboard Operable:** Keys can be triggered via pointer and focused/navigated via keyboard.
3. **Non-Color Dependent Pressed State:** Pressed keys show clear physical offset (`transform: translateY(3px)`), borders, and inset box shadows.
4. **Contrast Compliance:** Controls and text labels maintain contrast $\ge 4.5:1$.
5. **Piano Viewport Scrolling:** The container provides `overflow-x: auto`, `tabIndex={0}`, and `aria-label="88-Key Piano Keyboard Track"`.

---

## 9. Git and Atomic Commit Rules

| Phase | Commit Message |
|:---|:---|
| Docs | `docs(hw2): add project-rules and task decomposition` |
| Scaffold | `chore(hw2): scaffold react19 vite project` |
| Key Formula | `feat(hw2): generate 88 piano keys from midi formula` |
| Synth Engine | `feat(hw2): add polyphonic synth with FIFO voice stealing` |
| Key Memoization | `feat(hw2): add memoized PianoKey and render isolation` |
| Sequencer | `feat(hw2): add FIFO recorder and abortable replay with speed control` |
| Styling & A11y | `style(hw2): add responsive piano layout and focus styles` |
| Verification | `test(hw2): add profiler and polyphony verification evidence` |

---

## 10. Definition of Done

1. Keys generated strictly via formula (88 total: 52 white, 36 black).
2. Polyphonic synth limits active voices to 8 with verified FIFO voice stealing on the 9th note.
3. React Profiler proves only 1 `PianoKey` renders on keypress.
4. Sequence recorder records notes and replays at 0.5x, 1x, 2x with working instant Stop.
5. All automated builds and lints pass with 0 errors and 0 warnings.
6. Evidence screenshots verified in `HW/HW2/evidence/`.
