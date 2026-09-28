# Development

## Setup

```bash
nvm use            # Node.js 24 from .nvmrc
npm ci
npm run dev
```

`.npmrc` pins exact versions (`save-exact`) and refuses package versions younger than 7 days (`min-release-age=7`).
When adding a dependency, `npm install <pkg>` picks the newest version that satisfies the hold; commit the lockfile.

## Workflow

- `develop` is the default branch where work is integrated; `main` is the released (deployed) branch.
- Nobody pushes directly to `develop` or `main`. Both only change through a pull request with at least one approval.

1. Branch from `develop` (`feature/…`, `chore/…`, `content/…`).
2. Make the change with tests.
3. Run `npm run lint && npm run typecheck && npm test && npm run build`.
4. Open a pull request into `develop` using the template. CI must be green and one reviewer must approve.
5. To release, open a pull request from `develop` into `main`; merging it deploys the site.

## Conventions

Project conventions, enforced by `eslint.config.js`, `.prettierrc.json` and `.stylelintrc.json`:

- 2-space indentation, 130-character lines, single quotes, semicolons, `es5` trailing commas.
- `PascalCase/index.tsx` for components and screens, `camelCase.ts` for helpers, services and constants.
- Function components; hooks at the top level with complete dependency arrays.
- Styling is Tailwind utility classes; Prettier sorts them via `prettier-plugin-tailwindcss`. Stylelint checks
  `src/index.css` and allows Tailwind's at-rules (`@theme`, `@utility`, …).

## Testing

- Vitest + jsdom + React Testing Library; `@testing-library/jest-dom` matchers are loaded in `src/tests/setup.ts`.
- `clearMocks` and `unstubGlobals` are enabled, so mocks reset between tests.
- Components expose visual state as `data-*` attributes (`data-variant`, `data-status`); assert on those, not on
  utility classes.
- Shared fixtures live in `src/tests/fixtures.ts`.
- Coverage: `npm run test:coverage` (V8).

## Type checking

`tsconfig.json` references three projects:

| Project              | Scope                                | Types                                |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `tsconfig.app.json`  | app source (tests excluded)          | `vite/client`                        |
| `tsconfig.test.json` | all of `src`                         | + `node`, `vitest/globals`, jest-dom |
| `tsconfig.node.json` | `vite.config.ts`, `eslint.config.js` | `node`                               |

Keeping Node types out of the app project prevents browser code from using `process`, `fs`, etc.

## CI

`.github/workflows/ci.yml` — on pull requests (skipped for drafts) and pushes to `develop` and `main`:

```text
npm ci --ignore-scripts → lint → type check → unit tests → production build
```

## Deployment

The app is a static bundle (`dist/`). `vite.config.ts` reads `BASE_PATH` (default `/`) for sub-path hosting.

**GitHub Pages (configured):** `.github/workflows/deploy.yml` runs on pushes to `main`. Enable it once in the repository:
_Settings → Pages → Build and deployment → Source: GitHub Actions_. The workflow copies `index.html` to `404.html` so
deep links such as `/practice` load the app.

**Other providers** — no code changes required:

| Provider        | Build command   | Output | SPA fallback                                                   |
| --------------- | --------------- | ------ | -------------------------------------------------------------- |
| Netlify         | `npm run build` | `dist` | `/* /index.html 200` in `public/_redirects`                    |
| Vercel          | `npm run build` | `dist` | rewrite `/(.*)` → `/index.html` in `vercel.json`               |
| S3 + CloudFront | `npm run build` | `dist` | CloudFront custom error response 403/404 → `/index.html` (200) |

Set `BASE_PATH=/sub/path/` only when the site is not served from the domain root.

## Workflow security rules

- Pin every action to a full commit SHA with a `# vX.Y.Z` comment; Dependabot keeps them updated.
- Declare `permissions:` at workflow level and escalate per job (see `deploy.yml`).
- Never interpolate `${{ … }}` inside a `run:` block; pass values through `env:`.
- Never use `secrets: inherit`.
