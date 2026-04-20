# AGENTS.md

## Scope

- This file applies to all work under `frontend/`.
- It extends the repository root `AGENTS.md`.
- Update this file when the frontend stack, scripts, or design system become stable.

## Frontend Goals

- Build the user-facing experience for the `journey` product.
- Prioritize clear trip planning flows, community content browsing, and responsive layouts.
- Keep the UI implementation aligned with product concepts shown in `../UI_demo.txt` without copying prototype code wholesale.

## Frontend Rules

- Organize code by feature or route once the app is scaffolded; avoid dumping all UI into a single large file.
- Reuse shared UI primitives for buttons, inputs, dialogs, cards, and layout patterns before adding one-off variants.
- Keep display text centralized when the project introduces internationalization.
- Preserve existing Vietnamese UX terminology unless the task explicitly changes content strategy.
- Favor accessible markup, keyboard support, and clear empty, loading, and error states.
- Optimize for mobile and desktop from the start; do not treat mobile support as a later pass.

## Styling Guidance

- Follow the established visual language once the first real screens are implemented.
- Prefer design tokens or shared variables for color, spacing, typography, radius, and shadows.
- Avoid inline styling except for narrowly scoped dynamic values.
- When introducing animations, keep them purposeful and light enough not to block core interactions.

## Frontend Verification

- Run the smallest relevant frontend checks after changes, such as lint, unit tests, or build validation once scripts exist.
- If visual behavior changes, describe the impacted screen or flow in the final handoff.
- If the frontend package is not scaffolded yet, state that verification is limited to file review.

## Frontend Publishing

- After finishing frontend changes and relevant verification, commit the frontend repo and push to `origin/main` automatically unless the user explicitly says not to push.
- If the frontend worktree has unrelated changes or failed verification that make a direct push unsafe, stop and explain the blocker instead of guessing.
