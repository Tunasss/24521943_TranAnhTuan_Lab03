# Project Rules: Semantic Developer Profile Card

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [What the AI Must Do](#2-what-the-ai-must-do)
3. [What the AI Must Not Do](#3-what-the-ai-must-not-do)
4. [Semantic HTML Rules](#4-semantic-html-rules)
5. [Component Architecture and React 19 Rules](#5-component-architecture-and-react-19-rules)
6. [Media and Security Rules](#6-media-and-security-rules)
7. [Accessibility Rules (WCAG 2.0 AA)](#7-accessibility-rules-wcag-20-aa)
8. [Git and Atomic Commit Rules](#8-git-and-atomic-commit-rules)
9. [Definition of Done](#9-definition-of-done)

---

## 1. Purpose and Scope

### 1.1 Purpose

This document serves as the official **code of conduct for Artificial Intelligence (AI) assistants** collaborating on the **Semantic Developer Profile Card** project. It specifies mandatory architectural constraints, semantic markup rules, component standards, security policies, and accessibility guidelines that every AI assistant must strictly follow when writing, refactoring, reviewing, or testing code.

The primary objective is to build an engineer and pro-gamer profile card using **React 19**, **Vite**, and **CSS Modules** (Cascading Style Sheets Modules) that demonstrates:

- **Strict Semantic HTML5:** Expressive, meaningful document structure without generic container soup.
- **Zero Divs in DeveloperCard:** Proving that layout and grouping can be achieved entirely through semantic tags and CSS layout modules.
- **Flawless Accessibility:** Adherence to Web Content Accessibility Guidelines (WCAG) 2.0 Level AA standards.
- **Defensive Engineering:** Secure resource handling, explicit media dimensions, and resilient error fallbacks.

### 1.2 Scope

These rules govern all AI-generated contributions in this project, specifically:

- Component source files: `DeveloperCard.jsx` and `SkillBadge.jsx`.
- Stylesheet modules: `DeveloperCard.module.css` and `SkillBadge.module.css`.
- Application shell and root documents: `App.jsx` and `index.html`.
- Documentation, task decomposition, and verification scripts.
- Git commit messages and version control procedures.

---

## 2. What the AI Must Do

The following table defines the mandatory actions the AI assistant must perform. Each rule includes an identifier (ID), the requirement, and the rationale.

| ID | Rule | Reason |
|---|---|---|
| DO-01 | Build components as pure function components taking props via ECMAScript 6 (ES6) destructuring with default parameters. | Pure functions avoid unintended side effects, make rendering deterministic, and simplify component testing. |
| DO-02 | Construct `DeveloperCard.jsx` exclusively with semantic HTML5 elements from the approved list: `<article>`, `<header>`, `<hgroup>`, `<h2>`, `<p>`, `<dl>`, `<dt>`, `<dd>`, `<ul>`, `<li>`, `<img>`, `<span>`, and React `<Fragment>`. | Semantic elements expose clear structural roles to assistive technologies and search engines without relying on arbitrary CSS classes. |
| DO-03 | Connect the root `<article>` of the profile card to its heading via `aria-labelledby` referencing the `id` attribute of the `<h2>` element. | Establishes an accessible name for the article landmark in the Accessibility Tree, allowing screen reader users to identify the region immediately. |
| DO-04 | Use a Description List (`<dl>`, `<dt>`, `<dd>`) to present developer metrics (such as years of experience, completed repositories, or competitive rank). | Description lists represent key-value metadata pairs accurately in the Document Object Model (DOM), unlike unstructured paragraphs or tables. |
| DO-05 | Wrap each `<dt>` and `<dd>` pair inside a React `<Fragment key={item.id}>` when mapping over metrics. | React fragments allow key assignment to list items without inserting extraneous wrapper nodes into the DOM tree. |
| DO-06 | Render technical and gaming skills inside an unordered list (`<ul>`) where each item is a list item (`<li>`) containing a `<SkillBadge />`. | Communicates the total count and position of skills to screen readers via native list semantics. |
| DO-07 | Specify explicit numeric `width` and `height` attributes on every `<img>` element. | Enables the browser to compute the aspect ratio before image bytes arrive, preventing Cumulative Layout Shift (CLS). |
| DO-08 | Implement an image loading error handler (`onError`) that renders an initials fallback when an avatar fails to load or the URL is missing. | Prevents broken image icons and maintains visual and functional polish under offline or failed network conditions. |
| DO-09 | Scope styles through CSS Modules (`*.module.css`) and define color, spacing, and typography using CSS custom properties (variables). | Ensures local encapsulation, eliminates global selector conflicts, and makes design tokens easy to maintain. |
| DO-10 | Maintain a minimum color contrast ratio of at least 4.5:1 for normal text and 3:1 for large text and UI components against their background. | Fulfills WCAG 2.0 Level AA Success Criterion 1.4.3 (Contrast Minimum) for readability by users with low vision. |
| DO-11 | Ensure responsive reflow down to a 375-pixel viewport width without causing horizontal scrolling or clipped content. | Complies with mobile viewport standards and WCAG reflow principles on narrow handheld devices. |
| DO-12 | Maintain high-visibility focus indicators for all focusable and interactive elements. | Guarantees that keyboard-only users can trace focus position at all times without ambiguity. |
| DO-13 | Follow the Conventional Commits specification for every Git commit (for example, `feat(card): implement semantic dl metrics`). | Maintains a standardized, auditable project history and enables automated changelog generation. |
| DO-14 | Expand every abbreviation upon its first introduction in comments and documentation (for example, "Document Object Model (DOM)"). | Keeps technical documentation self-contained, transparent, and accessible to developers of all experience levels. |

---

## 3. What the AI Must Not Do

The following table outlines prohibited patterns. Introducing any of these violations constitutes a failed deliverable.

| ID | Rule | Reason |
|---|---|---|
| DONT-01 | Never use a `<div>` element inside `DeveloperCard.jsx` for any reason. | Violates the core semantic requirement of the exercise and introduces unnecessary non-semantic wrapper bloat. |
| DONT-02 | Never import React as a namespace (`import * as React from 'react'`). | Deprecated in modern ES6 module workflows; impedes modern bundler tree-shaking and bloats production bundle size. |
| DONT-03 | Never use React `defaultProps` on function components. | Deprecated in React 19; ES6 default parameter syntax is the official standard. |
| DONT-04 | Never declare React class components (`class Component extends React.Component`). | Class components add boilerplate, obsolete lifecycle methods, and run counter to modern React 19 paradigms. |
| DONT-05 | Never use array index values as React `key` props (for example, `key={index}`). | Index keys cause subtle reconciliation bugs, stale state bindings, and visual glitches when items are reordered or filtered. |
| DONT-06 | Never allow insecure HTTP (`http://`) image URLs; use HTTPS (`https://`) exclusively. | Mixed content is blocked by modern browsers and exposes end users to Man-In-The-Middle (MITM) tampering. |
| DONT-07 | Never use `dangerouslySetInnerHTML` under any circumstances. | Bypasses React's automatic string escaping and introduces Cross-Site Scripting (XSS) vulnerabilities. |
| DONT-08 | Never use generic or placeholder image `alt` text such as "avatar", "photo", or "image". | Screen readers already announce the presence of an image; generic text clutters speech synthesis with redundant noise. |
| DONT-09 | Never rely on color alone to convey meaning, status, or validation state. | Violates WCAG 2.0 Success Criterion 1.4.1 (Use of Color), excluding users with color vision deficiencies. |
| DONT-10 | Never disable default browser focus outlines (`outline: none` or `outline: 0`) without providing an enhanced, visible alternative. | Disables keyboard accessibility and renders interactive components unusable for keyboard navigators. |
| DONT-11 | Never introduce external utility-first CSS frameworks (such as Tailwind CSS or Bootstrap) unless explicitly instructed. | The exercise specifies vanilla CSS Modules to demonstrate pure layout and CSS custom property mastery. |
| DONT-12 | Never make atomic Git commits containing multiple unrelated functional changes or bundle multiple work packages into a single commit. | Destroys traceability, hinders bisecting regressions, and breaks the project's educational milestone structure. |

---

## 4. Semantic HTML Rules

### 4.1 Permitted Tag Whitelist for `DeveloperCard.jsx`

To uphold absolute semantic purity, `DeveloperCard.jsx` must only be assembled from the following 13 elements and React fragments:

1. `<article>`: Top-level standalone profile card container.
2. `<header>`: Introductory section of the card holding profile identity.
3. `<hgroup>`: Semantic grouping tag binding the developer's name with their professional title/tagline.
4. `<h2>`: Primary card heading stating the developer's full name.
5. `<p>`: Biography, summary paragraph, or descriptive text.
6. `<dl>`: Description list wrapping key-value profile metrics.
7. `<dt>`: Description term specifying a metric label (e.g., "Code Rank", "Experience").
8. `<dd>`: Description details specifying the corresponding metric value (e.g., "Grandmaster", "6 Years").
9. `<ul>`: Unordered list grouping skills and technical proficiencies.
10. `<li>`: Individual skill list item wrapping a badge.
11. `<img>`: Profile avatar with explicit dimensions and HTTPS source.
12. `<span>`: Inline badge text or visual indicator wrapper.
13. `<Fragment>` (or `<>`): Structural React grouping wrapper that emits zero DOM elements.

### 4.2 Absolute Zero Div Enforcement

**Strict Requirement:** There must be exactly **ZERO `<div>` tags** inside `DeveloperCard.jsx`.

```bash
# Automated rule verification command
grep -c "<div" src/components/DeveloperCard.jsx
# Must output: 0
```

### 4.3 Semantic Structure Layout Blueprint

The expected JSX hierarchy within `DeveloperCard.jsx` is structured as follows:

```jsx
<article className={styles.card} aria-labelledby="developer-name">
  <header className={styles.header}>
    <img
      src={avatarUrl}
      alt={`Avatar of ${name}`}
      width={96}
      height={96}
      className={styles.avatar}
      onError={handleImageError}
    />
    <hgroup className={styles.identity}>
      <h2 id="developer-name" className={styles.name}>{name}</h2>
      <p className={styles.title}>{title}</p>
    </hgroup>
  </header>

  <p className={styles.bio}>{bio}</p>

  <dl className={styles.metrics}>
    {metrics.map((metric) => (
      <Fragment key={metric.id}>
        <dt className={styles.metricTerm}>{metric.label}</dt>
        <dd className={styles.metricDetail}>{metric.value}</dd>
      </Fragment>
    ))}
  </dl>

  <ul className={styles.skillList} aria-label="Technical and gaming skills">
    {skills.map((skill) => (
      <li key={skill.id} className={styles.skillItem}>
        <SkillBadge name={skill.name} level={skill.level} category={skill.category} />
      </li>
    ))}
  </ul>
</article>
```

---

## 5. Component Architecture and React 19 Rules

### 5.1 Pure Function Components

- All components (`DeveloperCard` and `SkillBadge`) must be implemented as stateless or minimally-stateful pure functions.
- Rendering logic must be deterministic: identical props and state must produce identical JSX.

### 5.2 Prop Handling and Modern Defaults

- Props must be destructured directly in the function signature.
- Default values must be declared via ES6 default parameter syntax.
- The deprecated `Component.defaultProps` API must **never** be used.

```jsx
// CORRECT: ES6 default parameters
export function SkillBadge({ name, level = "Intermediate", category = "engineering" }) {
  // ...
}

// PROHIBITED: defaultProps
SkillBadge.defaultProps = { level: "Intermediate" }; // NEVER DO THIS
```

### 5.3 Import Declarations

- Avoid importing the entire React namespace.
- Import only needed named identifiers directly from `'react'`.

```jsx
// CORRECT
import { useState, Fragment } from 'react';

// PROHIBITED
import * as React from 'react';
```

### 5.4 Stable Identity Keys

- Every mapped item rendered in an iteration must receive a unique, immutable `id` from its data object (such as `metric.id` or `skill.id`).
- Under no circumstance should array indexes (`(item, index) => <li key={index}>`) be used as keys.

---

## 6. Media and Security Rules

### 6.1 Secure HTTPS Origin Enforcement

All image URLs must use the secure `https://` protocol. Insecure `http://` protocols are strictly forbidden to ensure end-user integrity and privacy.

```bash
# Automated verification command
grep -rn "http://" src/
# Must return zero matches
```

### 6.2 Explicit Dimensions to Guard Against Layout Shift

Every `<img>` tag must include explicit `width` and `height` attributes (such as `width={96}` and `height={96}`). This allows the browser rendering engine to reserve the exact layout box prior to download, keeping the Cumulative Layout Shift (CLS) score at 0.

### 6.3 Resilient Avatar Fallback Mechanism

When an avatar image fails to load (due to network timeout, HTTP 404, or invalid URI) or when no URL is provided, the component must seamlessly transition to a semantic fallback displaying the developer's uppercase initials inside a styled element with an accessible label.

```jsx
const [imageError, setImageError] = useState(false);

// Fallback calculation helper
const getInitials = (fullName) => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

{imageError || !avatarUrl ? (
  <span
    className={styles.avatarFallback}
    role="img"
    aria-label={`Initials avatar for ${name}`}
  >
    {getInitials(name)}
  </span>
) : (
  <img
    src={avatarUrl}
    alt={`Avatar of ${name}`}
    width={96}
    height={96}
    className={styles.avatar}
    onError={() => setImageError(true)}
  />
)}
```

### 6.4 Cross-Site Scripting (XSS) Immunity

Never use `dangerouslySetInnerHTML`. React automatically escapes values interpolated within JSX expressions (`{value}`), treating them as plain strings rather than executable HTML markup.

---

## 7. Accessibility Rules (WCAG 2.0 AA)

### 7.1 Accessible Landmark Naming

The card's root container `<article>` must include an `aria-labelledby` attribute linked to the unique DOM `id` of the profile's primary heading (`<h2>`). This gives assistive technology users immediate context when navigating by landmarks.

### 7.2 Meaningful Non-Redundant Text Alternatives

The avatar's `alt` attribute must describe the person succinctly (e.g., `alt="Portrait of Alex Chen"`). Do not prepend "photo of" or "image of", as screen readers already declare the graphic role automatically.

### 7.3 Contrast Ratios

All text and interactive controls must adhere to WCAG 2.0 AA contrast requirements:
- **Normal text (< 18pt or < 14pt bold):** Minimum contrast ratio of **4.5:1** against the card background.
- **Large text (>= 18pt or >= 14pt bold):** Minimum contrast ratio of **3.0:1**.
- **Interactive borders and focus indicators:** Minimum contrast ratio of **3.0:1** against adjacent colors.

### 7.4 Visible Keyboard Focus

Interactive elements and badges with interaction states must provide clear, high-contrast focus rings:

```css
.interactiveElement:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 3px;
}
```

### 7.5 Narrow Viewport Reflow (375px)

The card must be fully responsive and fit within a **375-pixel viewport width** (standard small mobile screen) without triggering horizontal scrolling or truncating vital metrics.

---

## 8. Git and Atomic Commit Rules

### 8.1 Atomic Commit Principle

Every Git commit must represent one discrete, testable, and cohesive logical change. Never mix component creation with verification audits or multiple distinct components into a single commit.

### 8.2 Conventional Commits Standard

All commit messages must adhere to the Conventional Commits format:

```
<type>(<scope>): <short imperative description>
```

Approved types:
- `docs`: Documentation updates and rules files.
- `chore`: Project scaffolding, dependency setups, and configuration.
- `feat`: Implementation of a new feature or component.
- `style`: CSS Modules, custom properties, and visual adjustments.
- `test`: Automated verification, linters, accessibility checks, and audits.

### 8.3 Required Commit Sequence for EX1

1. `docs(ex1): add project-rules and task decomposition`
2. `feat(ex1): implement SkillBadge component with CSS Module`
3. `feat(ex1): implement DeveloperCard semantic structure with dl metrics`
4. `feat(ex1): implement avatar with HTTPS, dimensions and initials fallback`
5. `style(ex1): add CSS Module custom properties and 375px responsive layout`
6. `test(ex1): verify zero divs, HTTPS media, accessibility tree, and Lighthouse`

---

## 9. Definition of Done

A deliverable is considered complete **only** when all the following verification checkpoints evaluate to **PASS**:

- [ ] `DeveloperCard.jsx` contains **zero `<div>` elements**, verified by `grep -c "<div" src/components/DeveloperCard.jsx` returning `0`.
- [ ] Every element in `DeveloperCard.jsx` belongs to the approved 13-tag whitelist.
- [ ] Metric items are formatted as a Description List (`<dl>`, `<dt>`, `<dd>`) using `<Fragment key={id}>`.
- [ ] Avatar image specifies explicit `width` and `height` attributes and uses an `https://` URI.
- [ ] An initials fallback renders automatically upon image load failure.
- [ ] Component props use ES6 default parameters; zero `defaultProps` declarations exist.
- [ ] All mapped lists use stable identifiers as `key` attributes; zero array index keys exist.
- [ ] All text content meets or exceeds the **4.5:1** WCAG 2.0 AA contrast threshold.
- [ ] The card layout renders smoothly at **375px width** with zero horizontal overflow.
- [ ] Focus rings are clearly visible upon keyboard navigation.
- [ ] Zero `dangerouslySetInnerHTML` or `import * as React` patterns exist in the repository.
- [ ] All atomic commits follow the Conventional Commits specification.
