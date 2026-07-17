# UMBRAL — Open Perceptual Research

UMBRAL is an open, bilingual, zero-cost platform for investigating whether a new auditory signal can acquire stable perceptual meaning. It is an instrument for falsifiable experiments, not a clinical product or a playlist of “frequencies”.

## What works in v0.1-alpha

- Local demo without account or Supabase; IndexedDB export and deletion.
- Procedural Web Audio with conservative gain, anti-click envelopes, limiter, pause/stop architecture, deterministic seeds, and AudioWorklet support.
- Atlas, Apprenticeship, State Gate, and Anchor flows with sham, repetition, omission, transfer, and retest scaffolding.
- Auditable local Samuel engine: Explorer, Composer, Optimizer, Skeptic, Cartographer, and Anomaly Keeper.
- Spanish-first UI with English local translations; public explanation, evidence matrix, living paper, privacy, consent, limits, and glossary.
- Optional Supabase Auth/sync with compact SQL, RLS, immutable protocol versions, and no service-role key in the browser.

## Run locally

Use Node 22+. Install dependencies, copy `.env.example` only if testing optional sync, then run the development server. The demo works with all environment values empty.

Quality gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Browser tests are available through `npm run test:e2e` after installing Playwright's Chromium locally.

## Scientific boundary

Existing evidence supports crossmodal correspondences, multisensory modification during tasting, music-evoked autobiographical memory, visual-cue salivary conditioning, and top-down taste imagery. It does not show that an auditory signature alone creates a complete taste or specific autobiographical experience. See `research/evidence-matrix.csv`.

## Cost and license

Maximum operating budget: USD 0/month. See `ZERO_COST_POLICY.md`. Code is AGPL-3.0-only; participant data is not open-source material.
