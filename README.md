# JOBFIT

JOBFIT is a private, client-side resume-to-job-description matching tool. It helps candidates quickly spot relevant keyword gaps, requested skills, and explainable resume improvements before applying.

## MVP scope

The single-page MVP supports the shortest useful flow: paste a resume, paste a job description, analyze, review, edit, and re-analyze. It includes:

- Weighted job-description keyword extraction and coverage
- Extensible technical and professional skill detection
- Matched and missing keyword and skill lists
- Explainable language, readability, contact, and section-structure checks
- Ranked, truth-conscious improvement priorities
- Fictional example content and a clear reset flow
- Responsive, keyboard-accessible UI with visible privacy messaging

It intentionally does not include accounts, storage, payments, analytics, document parsing, scraping, or external AI services.

## Privacy model

All analysis runs synchronously in the browser. Resume and job-description text is held only in React component memory, is not persisted to local storage, and is never sent to a backend or third-party API. The production app has no runtime network dependency after its static assets load.

Do not add analytics or error-reporting payloads that capture input contents.

## How analysis works

The analysis engine is deterministic and separated from the UI:

- `src/analysis/normalize.ts` normalizes text, tokenizes it, and provides lightweight stemming.
- `src/analysis/keywords.ts` removes stop words and filler, groups variants, and weights repeated, specific, and recognized technical terms.
- `src/analysis/skills.ts` uses an extensible skill dictionary with aliases and categories.
- `src/analysis/checks.ts` applies explainable language, readability, and structure heuristics.
- `src/analysis/analyze.ts` combines keyword coverage (72%) and requested-skill coverage (28%) into the JOBFIT Match Score and builds ranked priorities.

The score is a heuristic JOBFIT matching score. It is **not an official ATS score**, does not emulate a proprietary applicant-tracking system, and cannot predict whether a candidate will receive an interview. Candidates should add keywords or skills only when they accurately describe their experience.

## Tech stack

- Vite
- React
- TypeScript (strict mode)
- Vitest
- ESLint and Prettier

There is no backend, database, API key, paid dependency, or recurring infrastructure requirement.

## Local development

Requires Node.js 20.19+ or 22.12+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The production output is written to `dist/`.

## Static deployment

JOBFIT is ready for Cloudflare Pages or any static host.

For Cloudflare Pages:

1. Connect the repository in Cloudflare Pages.
2. Select the Vite framework preset.
3. Set the build command to `pnpm build`.
4. Set the output directory to `dist`.
5. No environment variables are required.

The document includes a restrictive Content Security Policy and referrer policy for static-host portability. The `public/_headers` file adds further browser security headers on Cloudflare Pages-compatible hosts.

The repository also includes `.github/workflows/deploy-pages.yml` as a free deployment fallback. On a public GitHub repository, enable Pages with **GitHub Actions** as the source; each push to `main` then validates and deploys the site automatically. The relative Vite asset base keeps the same build compatible with both GitHub Pages project paths and root-domain static hosts.

## Limitations

- Input supports pasted plain text only; PDF and DOCX parsing are intentionally out of scope.
- Keyword extraction uses lightweight English-language tokenization and stemming, not semantic AI analysis.
- Skill coverage is limited to the aliases in the local dictionary and should be expanded carefully over time.
- Layout and formatting checks can evaluate only the pasted text, not the source document's visual design.
- Heuristics are suggestions, not absolute resume rules or hiring predictions.

## Project status

This repository contains the validation-focused MVP. Once deployed, the recommended next step is to hold feature development and collect real usage and market feedback before expanding scope.
