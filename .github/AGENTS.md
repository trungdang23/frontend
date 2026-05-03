# AGENTS.md

## Scope

- This file applies to workflow and automation files under `frontend/.github/`.
- It extends the repository root `AGENTS.md` and `frontend/AGENTS.md`.

## Workflow Goals

- Keep frontend CI and deploy steps predictable for contributors.
- Keep deploy automation aligned with the current manual personal-machine path.
- Ensure build-time and runtime frontend env come from GitHub configuration, not hardcoded source values.

## Workflow Rules

- Keep `deploy-frontend.yml` aligned with the current release strategy: automatic deploy on `push` to `main` with `workflow_dispatch` retained for manual redeploys.
- Preserve the current deploy transport: a Linux/X64 self-hosted runner on the deploy machine. Do not reintroduce `cloudflared access ssh` as a deploy transport unless the task explicitly calls for rollback or comparison.
- Keep frontend deploy aligned with backend style: source checkout on target machine, env rendered on GitHub Actions, build on target machine, and process restart via repo scripts.
- Never hardcode real secret values, private keys, host keys, or environment-specific deploy values in workflow files.
- When changing deploy behavior, update the frontend README and the nearest runbooks in `documents/`.

## Verification

- After changing workflow files, run the smallest practical validation available locally, such as `git diff --check`.
- If you change deploy behavior, summarize which GitHub secrets, variables, or Cloudflare settings operators must update.
