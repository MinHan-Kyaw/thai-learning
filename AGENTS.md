# AGENTS.md

Project instructions for developers and AI coding agents. Read this first; the linked docs have the detail.

## Overview

A client-side React application for learning Thai consonants and vocabulary, aimed at Burmese-speaking learners.
There is **no backend, no database, no authentication and no persistence**. The build is a static site.

- [docs/architecture.md](docs/architecture.md) — structure, data flow, practice engine
- [docs/development.md](docs/development.md) — conventions, testing, CI/CD, deployment
- [docs/content-management.md](docs/content-management.md) — how learning content is added and reviewed

## Tech stack

React 19, TypeScript (strict), Vite, CSS Modules, React Router (declarative mode), Vitest, React Testing Library,
ESLint 9 flat config, Prettier, Stylelint. Node.js 24 (`.nvmrc`).

## Commands

```bash
npm ci                 # install (never plain `npm install` in CI)
npm run dev            # dev server on http://localhost:5173
npm run lint           # ESLint + Stylelint
npm run lint:fix       # auto-fix
npm run typecheck      # tsc -b
npm test               # vitest run
npm run build          # production build into dist/
```

Run a single test file: `npx vitest run src/helpers/practice.test.ts`

## Project structure

```text
src/
├── components/   Reusable, presentational UI. One folder per component: index.tsx, index.module.css, index.test.tsx
├── screens/      Page-level composition (Home, Consonants, Practice). Screens own state and wire services.
├── data/         Learning content JSON + typed loader (index.ts) + data validation test
├── helpers/      Pure functions (randomizeArray, practice engine, vocabulary, assetUrl)
├── constants/    Shared constants (practice question/option counts)
├── services/     Side-effect wrappers (audio playback)
├── types/        Shared TypeScript types for learning data
└── tests/        Test setup and shared fixtures
public/
├── images/words/ Vocabulary pictures (.svg, Fluent Emoji flat style)
└── audio/words/  Thai audio (.m4a)
```

## Coding conventions

- Two-space indentation, max line length 130, single quotes, semicolons, trailing commas (es5). Prettier enforces this.
- Function components only. `PascalCase` component folders with `index.tsx`; `camelCase` for non-component files.
- Components default-export; `SCREAMING_SNAKE_CASE` for constants.
- Import order is enforced (`react*` first, then external, internal, relative; alphabetised; blank line between groups).
- Omit `={true}` on boolean props; self-close empty elements; never use array indexes as React keys — use data IDs.
- Prefer an existing component before adding a new one. Don't add abstractions (context, state libraries, reducers
  folders) until a real requirement exists.
- Use the design tokens in `src/index.css` (`--color-brand`, `--space-4`, `--radius-md`, …), not raw colours.

## Component conventions

- Components are presentational: they receive data and callbacks via props and never import `src/data` or services.
- Screens compose components, read data from `src/data`, hold state, and call services.
- Every text node in Thai gets `lang="th"`; every Burmese text node gets `lang="my"`.
- Thai text uses `var(--font-thai)` (Noto Sans Thai **Looped**) at weight 400/500. Heavier weights fill in the loops that
  learners rely on to tell letters apart (e.g. ด/ค). Burmese uses `var(--font-burmese)`.

## Learning content rules

- Learning content lives in `src/data/*.json`. **Never hardcode learning content in components.**
- Consonant IDs are the character (`"ก"`); word IDs are `"<consonant>-<word>"` (`"ก-ไก่"`). IDs are stable: they are
  React keys and practice-engine references. Don't rename them.
- Consonant cards show the letter (`ก`) and the word (`ไก่`) on separate rows; practice answers and feedback show the letter
  followed by its word in brackets (`ก (ไก่)`, `ญ (หญิง)`, via `getLetterWithWord`), matching the recited letter name. The Burmese pronunciation is stored exactly as the source gives it
  (`ကောကိုင်`); never edit it to match the Thai display.
- Images: `public/images/words/<romanized-slug>.svg`, vector, `viewBox="0 0 32 32"`, Microsoft Fluent Emoji _flat_ style
  (MIT). Custom drawings for Thai-specific words must match that style. No text in the picture (it would give away
  practice answers), no scripts or external references. Words without an image show a placeholder and are excluded
  from practice.
- Audio: `public/audio/words/<romanized-slug>.m4a` (AAC). Audio is the **Thai** recitation of the full letter name,
  `<consonant>อ <word>` ("กอ ไก่"), matching the Burmese pronunciation — even though the screen shows only `ไก่`.
- Full procedure: [docs/content-management.md](docs/content-management.md).

## Burmese pronunciation — strict rule

Pronunciation is written manually in Burmese script by the project owner and is curated learning content.

- **Do not generate, translate, transliterate or infer Burmese pronunciation** — not from Thai text, romanization,
  translation services, speech synthesis or any other automated system, and not from your own knowledge.
- Missing pronunciation means the content is incomplete. Leave it for the owner; never fill it with a guess.
- Only mechanical Unicode fixes are allowed (logical character order, removing invisible characters, letter ဝ vs digit ၀);
  record them in the content review log.
- Thai audio is separate from Burmese pronunciation. Never derive one from the other.

## Testing conventions

- Tests are colocated: `Component/index.test.tsx`, `helpers/foo.test.ts`.
- Put conditions in a `describe('given …')` block, not in the `it` text.
- Query by role and accessible name (Testing Library) rather than test IDs or class names.
- Mock `src/services/audio` in component/screen tests; the audio service has its own unit test.
- New reusable components need tests. Practice logic must stay covered for: correct and incorrect answers, question and
  answer randomization, option uniqueness, progression, completion and score.
- `src/data/consonants.test.ts` validates the content (IDs, required fields, Burmese script, Unicode order, files exist).
  Keep it passing; update its known-gap lists only when the owner confirms the gap.

## Accessibility

Semantic HTML, visible focus (`--focus-ring`), keyboard-operable controls, `alt` text on every image (the Burmese
meaning — it must not reveal the Thai answer), never colour alone for correct/incorrect, labelled audio buttons,
touch targets ≥ 44px, focus moved to the new prompt on question change.

## CI/CD

- `ci.yml`: install (`npm ci --ignore-scripts`) → lint → type check → tests → build, on PRs and pushes to `develop`/`main`.
- Branches: work lands on `develop` via PR (1 approval required); releases go `develop` → `main` via PR. Never push
  directly to either.
- `deploy.yml`: builds with the Pages base path and deploys `main` to GitHub Pages.
- Pin every `uses:` to a full commit SHA with a `# vX.Y.Z` comment. Never `@v1`/`@main`, never `secrets: inherit`, never
  interpolate `${{ … }}` directly inside `run:` (pass it through `env:`). Declare `permissions:`.
- Supply chain: commit `package-lock.json`; `.npmrc` sets `save-exact` and a 7-day `min-release-age`; Dependabot entries
  need a `cooldown`.

## Non-goals (do not add without an explicit requirement)

Authentication, backend APIs, databases, user profiles, progress sync, leaderboards, cloud storage, persistent learning
history, and `localStorage`. Refreshing the page resets practice by design.
