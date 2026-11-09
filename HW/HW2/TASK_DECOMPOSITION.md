# Task Decomposition: 88-Key Polyphonic Piano & FIFO Sequencer (WBS)

## Project Overview

- **Project:** 88-Key Polyphonic Piano & FIFO Sequencer
- **Course:** Web Application Development (LAB 03 - HW2)
- **Student:** Trần Anh Tuấn (24521943)
- **Total Planned Time:** 360 Minutes (6.0 Hours)
- **Accessibility Standard:** WCAG 2.0 Level AA

---

## Work Breakdown Structure (WBS) Summary

| Work Package ID | Work Package Title | Allocated Time (Minutes) | Cumulative Time (Hours) |
|:---|:---|:---:|:---:|
| **WP-01** | Mathematical Key Generation Utility (`pianoKeys.js`) | 30 | 0.50 |
| **WP-02** | Polyphonic Synthesis Engine with FIFO Voice Stealing (`PolyphonicSynth.js`) | 55 | 1.42 |
| **WP-03** | Memoized PianoKey & Render Isolation Architecture (`PianoKey.jsx`) | 50 | 2.25 |
| **WP-04** | Pointer & Keyboard Interaction Integration | 40 | 2.92 |
| **WP-05** | High-Precision FIFO Event Sequence Recorder (`sequenceRecorder.js`) | 45 | 3.67 |
| **WP-06** | Abortable Sequence Replay Engine with Variable Speed (`replaySequence.js`) | 50 | 4.50 |
| **WP-07** | Accessible Piano CSS Grid Layout & Mobile Reflow | 45 | 5.25 |
| **WP-08** | Performance Profiling, Polyphony Verification & Evidence Capture | 45 | 6.00 |
| **Total** | **8 Work Packages** | **360 Minutes** | **6.0 Hours** |

---

## Detailed Work Package Specifications

### Work Package 1: Mathematical Key Generation Utility (`pianoKeys.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-01` |
| **Task** | Create `src/utils/pianoKeys.js` exporting `generatePianoKeys()` and key count utilities. |
| **Input** | Standard MIDI specifications from MIDI 21 ($A_0$) to MIDI 108 ($C_8$). |
| **Output** | Array of 88 key descriptor objects `{ midi, noteName, isBlack, freqHz }`. |
| **Acceptance Criteria** | 1. $f = 440 \times 2^{(midi - 69) / 12}$ implemented with zero hardcoded array items.<br>2. Exactly 88 keys returned.<br>3. Exactly 52 white keys and 36 black keys.<br>4. MIDI 21 $\rightarrow$ A0 (27.5 Hz), MIDI 69 $\rightarrow$ A4 (440 Hz), MIDI 108 $\rightarrow$ C8 (4186 Hz). |
| **Allocated Minutes** | 30 |

---

### Work Package 2: Polyphonic Synthesis Engine with FIFO Voice Stealing (`PolyphonicSynth.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-02` |
| **Task** | Implement `PolyphonicSynth` class with 8-voice concurrency cap and FIFO stealing. |
| **Input** | AudioContext and note trigger commands `{ midi, freqHz }`. |
| **Output** | `src/audio/PolyphonicSynth.js` with `noteOn()`, `noteOff()`, and `stopAll()`. |
| **Acceptance Criteria** | 1. `maxVoices = 8` enforced via Map.<br>2. When 9th note is played, oldest voice is stolen using `voices.keys().next().value`.<br>3. `noteOff` applies `exponentialRampToValueAtTime(0.0001, currentTime + 0.04)` to prevent clicks.<br>4. Nodes cleanly disconnected on `'ended'` event. |
| **Allocated Minutes** | 55 |

---

### Work Package 3: Memoized PianoKey & Render Isolation Architecture (`PianoKey.jsx`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-03` |
| **Task** | Implement `PianoKey.jsx` wrapped in `React.memo` with stable event handler props. |
| **Input** | Props: `{ midi, noteName, isBlack, isPressed, onNoteOn, onNoteOff }`. |
| **Output** | Pure memoized button component rendering note name inside `<span>`. |
| **Acceptance Criteria** | 1. Wrapped in `React.memo`.<br>2. Render strictly 1 `PianoKey` on note press (verified via React DevTools Profiler).<br>3. `aria-pressed={isPressed}` and `aria-label={noteName}` present.<br>4. Zero re-renders of neighboring 87 keys. |
| **Allocated Minutes** | 50 |

---

### Work Package 4: Pointer & Keyboard Interaction Integration

| Field | Detail |
|:---|:---|
| **ID** | `WP-04` |
| **Task** | Wire up pointer events (`onPointerDown`, `onPointerUp`, `onPointerLeave`) and keyboard focus triggers in `App.jsx`. |
| **Input** | User touch/click gestures and keyboard Enter/Space activations. |
| **Output** | Smooth multi-touch and mouse-drag piano playing behavior without stuck notes. |
| **Acceptance Criteria** | 1. Sliding pointer across keys triggers `noteOn` and `noteOff` cleanly.<br>2. Releasing pointer or leaving key area stops note immediately.<br>3. Stable callbacks defined via `useCallback(..., [])`. |
| **Allocated Minutes** | 40 |

---

### Work Package 5: High-Precision FIFO Event Sequence Recorder (`sequenceRecorder.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-05` |
| **Task** | Implement `SequenceRecorder` class in `src/audio/sequenceRecorder.js`. |
| **Input** | Real-time `noteOn` and `noteOff` events with `performance.now()` timestamps. |
| **Output** | FIFO array of recorded events `{ midi, freqHz, durationMs, deltaMs }`. |
| **Acceptance Criteria** | 1. Uses `performance.now()`, never `Date.now()`.<br>2. `deltaMs` records elapsed time since previous note onset.<br>3. `clear()` and `getEvents()` methods provide defensive copies.<br>4. Zero memory leaks on repeated recording passes. |
| **Allocated Minutes** | 45 |

---

### Work Package 6: Abortable Sequence Replay Engine with Variable Speed (`replaySequence.js`)

| Field | Detail |
|:---|:---|
| **ID** | `WP-06` |
| **Task** | Implement asynchronous `replaySequence()` supporting 0.5x, 1x, 2x playback and `AbortController` cancellation. |
| **Input** | Recorded events array, playback speed factor, `PolyphonicSynth` instance, and `{ signal }`. |
| **Output** | `src/audio/replaySequence.js` with instant cancelability. |
| **Acceptance Criteria** | 1. Delays and note durations scaled by `deltaMs / speed`.<br>2. `signal.addEventListener('abort')` clears timeouts and rejects with `AbortError`.<br>3. Stop Sequence immediately silences audio via `synth.stopAll()`.<br>4. Unmount during replay safely cancels playback with zero console warnings. |
| **Allocated Minutes** | 50 |

---

### Work Package 7: Accessible Piano CSS Grid Layout & Mobile Reflow

| Field | Detail |
|:---|:---|
| **ID** | `WP-07` |
| **Task** | Author CSS Modules for 88 keys with natural black key overlapping and keyboard-scrollable container. |
| **Input** | Standard piano key geometry and WCAG 2.0 AA contrast specifications. |
| **Output** | `Piano.module.css` and `App.module.css`. |
| **Acceptance Criteria** | 1. Piano container has `overflow-x: auto` and `tabIndex={0}` with `aria-label`.<br>2. Black keys positioned above white keys with proper offset.<br>3. Pressed state uses elevation and border change (not color-only).<br>4. Page itself has 0 horizontal scroll at 375px viewport. |
| **Allocated Minutes** | 45 |

---

### Work Package 8: Performance Profiling, Polyphony Verification & Evidence Capture

| Field | Detail |
|:---|:---|
| **ID** | `WP-08` |
| **Task** | Run automated profiler test (1 key render), 9th note FIFO voice stealing test, abortable replay test, and Lighthouse audit. |
| **Input** | Complete HW2 application. |
| **Output** | Verification screenshots captured into `HW/HW2/evidence/`. |
| **Acceptance Criteria** | 1. Profiler confirms strictly 1 `PianoKey` commit per note.<br>2. 9th concurrent note steals the oldest voice.<br>3. Lighthouse Accessibility score is 100/100.<br>4. Evidence artifacts saved in `HW/HW2/evidence/`. |
| **Allocated Minutes** | 45 |
