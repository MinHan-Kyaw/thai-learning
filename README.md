# Thai Learning

A responsive, client-side web app for Burmese-speaking learners studying Thai consonants and their vocabulary.

- Browse the 44 Thai consonants by class (Middle, High, Low) with pictures, Burmese pronunciation and Thai audio.
- Practise with picture quizzes: pick the Thai word, hear it, then check your answer.

There is no backend, database or user account. All learning content is static JSON bundled with the app, and practice
progress lives only in memory for the current session.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · Vitest · React Testing Library · ESLint · Prettier · Stylelint

## Getting started

Requirements: Node.js 24 (see `.nvmrc`) and npm 11.

```bash
npm ci
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command                 | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                               |
| `npm run build`         | Type check and build the production bundle into `dist/` |
| `npm run preview`       | Serve the production build locally                      |
| `npm run lint`          | ESLint (TS/React/a11y/imports/Prettier) and Stylelint   |
| `npm run lint:fix`      | Auto-fix lint and formatting issues                     |
| `npm run typecheck`     | TypeScript project references check                     |
| `npm test`              | Run the test suite once                                 |
| `npm run test:watch`    | Run tests in watch mode                                 |
| `npm run test:coverage` | Run tests with a V8 coverage report                     |

## CI/CD

- **CI** (`.github/workflows/ci.yml`) runs on every pull request and on pushes to `develop` and `main`:
  install → lint → type check → unit tests → production build. A pull request is not ready until all steps pass.
- **Deploy** (`.github/workflows/deploy.yml`) publishes `main` to GitHub Pages. The hosting provider is not baked into the
  app; see [docs/development.md](docs/development.md#deployment) to switch providers.

## Documentation

- [AGENTS.md](AGENTS.md) — project rules for developers and AI coding agents
- [docs/architecture.md](docs/architecture.md) — structure, data flow and practice engine
- [docs/development.md](docs/development.md) — workflow, conventions, testing and deployment
- [docs/content-management.md](docs/content-management.md) — adding and reviewing learning content

## Content credits

Consonant vocabulary, Burmese pronunciations and meanings come from _Thi Thi's Thai Training — Basic + Level 1_.
Vocabulary pictures use [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT) and custom drawings
in the same style. See [docs/content-management.md](docs/content-management.md#sources-and-licensing) for provenance.
