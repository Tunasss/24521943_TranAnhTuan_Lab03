# Task Decomposition: Semantic Developer Profile Card

**Document Type:** Work Breakdown Structure (WBS)  
**Project:** Semantic Developer Profile Card (React 19 + Vite + CSS Modules)  
**Total Estimated Time:** 35 minutes  
**Governed By:** [project-rules.md](./project-rules.md)

---

## Table of Contents

1. [Work Package 1 — SkillBadge Component](#1-work-package-1--skillbadge-component)
2. [Work Package 2 — DeveloperCard Semantic Structure with dl Metrics](#2-work-package-2--developercard-semantic-structure-with-dl-metrics)
3. [Work Package 3 — Avatar with HTTPS, Dimensions, and Initials Fallback](#3-work-package-3--avatar-with-https-dimensions-and-initials-fallback)
4. [Work Package 4 — CSS Module with Custom Properties and 375px Layout](#4-work-package-4--css-module-with-custom-properties-and-375px-layout)
5. [Work Package 5 — Verification and Auditing](#5-work-package-5--verification-and-auditing)
6. [Time Allocation Summary](#6-time-allocation-summary)

---

## 1. Work Package 1 — SkillBadge Component

**Objective:** Implement the pure function `SkillBadge` component and its dedicated CSS Module to render technical and gaming skill badges with clear category and proficiency indicators.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 1.1 | Define component contract and prop interface using ECMAScript 6 (ES6) default parameters | Component specifications for `name`, `level`, and `category` props | Pure function signature in `src/components/SkillBadge.jsx` | Props are destructured with defaults (`level = "Intermediate"`, `category = "engineering"`); zero `defaultProps` usage | 2 |
| 1.2 | Implement semantic markup using an inline `<span>` element with an accessible title attribute | Destructured props | Rendered JSX containing an outer `<span>` element | The badge renders the skill name and proficiency level cleanly without using `<div>` elements | 2 |
| 1.3 | Create and bind `SkillBadge.module.css` with distinct category styles | Visual design criteria and color contrast guidelines | `src/components/SkillBadge.module.css` imported into `SkillBadge.jsx` | Text contrast against the badge background exceeds 4.5:1; distinct classes exist for engineering and gaming badges | 2 |

**Work Package 1 Subtotal: 6 minutes**

---

## 2. Work Package 2 — DeveloperCard Semantic Structure with dl Metrics

**Objective:** Build the primary `DeveloperCard` component using strict semantic HTML5 tags, establishing the profile identity, a Description List (`<dl>`) for metrics, and an unordered list (`<ul>`) of skill badges, while enforcing zero `<div>` tags.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 2.1 | Scaffold the outer card shell with `<article>`, `<header>`, `<hgroup>`, `<h2>`, and `<p>` | Profile data object (`name`, `title`, `bio`, `avatarUrl`) | Structural shell in `src/components/DeveloperCard.jsx` | Root is an `<article aria-labelledby="dev-title">`; `<hgroup>` binds `<h2 id="dev-title">` and subtitle `<p>` | 2 |
| 2.2 | Implement profile metrics using Description List (`<dl>`, `<dt>`, `<dd>`) and React `<Fragment key={id}>` | Array of metric objects (`id`, `label`, `value`) | Semantic metadata section rendered within `<dl>` | Each key-value pair is wrapped in `<Fragment key={metric.id}>`; `<dt>` holds label and `<dd>` holds value; zero `<div>` wrappers | 3 |
| 2.3 | Render skills section as an unordered list (`<ul>`) of list items (`<li>`) wrapping `SkillBadge` | Array of skill objects (`id`, `name`, `level`, `category`) | Skills section rendered within `<ul>` | List has `aria-label="Skills and proficiencies"`; each item is an `<li>` with a stable `key={skill.id}` | 2 |
| 2.4 | Enforce strict zero `<div>` tag rule across the component structure | JSX tree in `src/components/DeveloperCard.jsx` | Validated `DeveloperCard.jsx` | All layout groupings utilize semantic tags or React fragments; zero `<div>` elements exist in the file | 1 |

**Work Package 2 Subtotal: 8 minutes**

---

## 3. Work Package 3 — Avatar with HTTPS, Dimensions, and Initials Fallback

**Objective:** Implement the profile avatar with mandatory HTTPS validation, explicit width and height attributes to prevent layout shift, and an automatic fallback to developer initials upon image load failure.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 3.1 | Implement `<img>` tag with HTTPS protocol validation and explicit dimensions | Avatar URL string, developer name | `<img>` JSX element with `width={96}` and `height={96}` | Avatar URL starts with `https://`; width and height attributes are present; `alt` reads `Avatar of ${name}` | 2 |
| 3.2 | Implement error boundary state with React `useState` and `onError` handler | Image error event from browser | Local `imageError` state flag in `DeveloperCard.jsx` | When the image fails to load or URL is empty, `onError` sets `imageError` to `true` without breaking UI rendering | 2 |
| 3.3 | Render accessible initials fallback container when image loading fails | Developer full name string and `imageError` state | Semantic `<span>` fallback displaying 2-letter uppercase initials | Initials are extracted dynamically (for example, "Alex Chen" yields "AC"); element has `role="img"` and an accessible `aria-label` | 2 |

**Work Package 3 Subtotal: 6 minutes**

---

## 4. Work Package 4 — CSS Module with Custom Properties and 375px Layout

**Objective:** Author `DeveloperCard.module.css` utilizing CSS custom properties for tokens, ensuring WCAG 2.0 AA contrast compliance, responsive reflow down to a 375px viewport width, and prominent focus indicators.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 4.1 | Define CSS custom properties (variables) for palette, typography, and spacing tokens | Design system specifications | Token definitions inside `:root` or card container class | Tokens defined for background, card surface, primary text, muted text, accent, and focus outline | 2 |
| 4.2 | Implement card layout and `<dl>` key-value grid using CSS Grid and Flexbox | Semantic elements without `<div>` wrappers | Styled card in `src/components/DeveloperCard.module.css` | `<dl>` displays terms and details in a balanced grid; normal text contrast against background meets or exceeds 4.5:1 | 3 |
| 4.3 | Ensure mobile responsive layout down to 375px width without horizontal scrolling | Viewport width of 375 pixels (small mobile device) | Responsive layout rules and media queries | Card width reflows smoothly to 375px; zero horizontal scrollbar appears (`overflow-x: hidden` / responsive sizing) | 2 |
| 4.4 | Configure high-visibility keyboard focus indicators for interactive elements | Focus ring specifications | `:focus-visible` CSS rules | Focus ring displays at least a 2px solid outline with 3:1 contrast against adjacent background colors | 1 |

**Work Package 4 Subtotal: 8 minutes**

---

## 5. Work Package 5 — Verification and Auditing

**Objective:** Execute automated CLI checks, inspect the browser Accessibility Tree, and run Lighthouse audits to verify that all semantic, security, and accessibility standards are satisfied.

| ID | Task | Input | Output | Acceptance Criteria | Minutes |
|---|---|---|---|---|---|
| 5.1 | Run automated grep command to verify zero `<div>` tags inside `DeveloperCard.jsx` | `src/components/DeveloperCard.jsx` | Terminal output from grep command | `grep -c "<div" src/components/DeveloperCard.jsx` returns exactly `0` | 1 |
| 5.2 | Run automated grep command to ensure zero insecure `http://` URLs exist | All source files under `src/` | Terminal output from grep command | `grep -rn "http://" src/` produces zero matches across the codebase | 1 |
| 5.3 | Inspect browser Accessibility Tree in Developer Tools (DevTools) | Running application on localhost | Documented Accessibility Tree hierarchy | Card landmark exposes `article` role with name matching profile title; list and description list semantics are intact | 2.5 |
| 5.4 | Perform Google Lighthouse accessibility and best practices audit | Rendered profile card page | Lighthouse audit report | Lighthouse Accessibility category scores 100%; zero critical or serious contrast/semantic issues reported | 2.5 |

**Work Package 5 Subtotal: 7 minutes**

---

## 6. Time Allocation Summary

The table below summarizes the planned duration for each work package. The sum equals exactly the 35-minute project allotment.

| Work Package | Title | Estimated Time (Minutes) |
|---|---|---|
| WP-1 | SkillBadge Component | 6 |
| WP-2 | DeveloperCard Semantic Structure with dl Metrics | 8 |
| WP-3 | Avatar with HTTPS, Dimensions, and Initials Fallback | 6 |
| WP-4 | CSS Module with Custom Properties and 375px Layout | 8 |
| WP-5 | Verification and Auditing | 7 |
| **Total** | **Full Project Duration** | **35** |
