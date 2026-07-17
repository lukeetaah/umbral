# UMBRAL — Open Perceptual Research

UMBRAL is an open, bilingual, zero-cost platform for investigating whether a new auditory signal can acquire stable perceptual meaning. It is an instrument for falsifiable experiments, not a clinical product or a playlist of “frequencies”.

## What works in v0.1-alpha.2

- Local demo without account or Supabase; IndexedDB export and deletion.
- Procedural Web Audio with audible preflight, conservative gain, anti-click envelopes, limiter, deterministic seeds, white/pink/brown noise, harmonic/filter/beat modes, AudioWorklet, and global Stop/Escape controls.
- Differentiated Atlas, Apprenticeship, State Gate, and Anchor local protocols with sham, hidden repetition, omission, transfer, expectation, confidence, and honest single-session results.
- Auditable local Samuel engine: Explorer, Composer, Optimizer, Skeptic, Cartographer, and Anomaly Keeper.
- Spanish-first UI with English demo/public-page translations; public explanation, expanded evidence matrix, living paper, privacy, consent, limits, and glossary. See the explicit translation gaps in `docs/capability-audit.md`.
- Optional Supabase Auth/sync with compact SQL, RLS, immutable protocol versions, and no service-role key in the browser.

## Run locally

Use Node 22+. Install dependencies, copy `.env.example` only if testing optional sync, then run the development server. The demo works with all environment values empty.

Quality gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Browser tests are available through `npm run test:e2e` after installing Playwright's Chromium locally.

## Scientific boundary

Existing evidence supports crossmodal correspondences, multisensory modification during tasting, music-evoked autobiographical memory, visual-cue salivary conditioning, top-down taste imagery, auditory prediction and learnable image-to-sound mappings. It does not show that an auditory signature alone creates a complete taste or specific autobiographical experience. See `research/evidence-matrix.csv` and `research/source-verification.md`.

## Cost and license

Maximum operating budget: USD 0/month. See `ZERO_COST_POLICY.md`. Code is AGPL-3.0-only; participant data is not open-source material.
