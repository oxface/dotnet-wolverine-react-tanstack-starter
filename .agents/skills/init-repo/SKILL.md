---
name: init-repo
description: Initialize a repository created from this starter template. Use when a copied or generated consumer repository needs its placeholder names replaced, starter identity verified, and the standard post-template verification workflow run through `pnpm init-repo`, `pnpm verify-init`, and `pnpm verify`.
---

# Init Repo Skill

Use this skill when initializing a repository created from this starter.

## Workflow

1. Ask for the project display name if it is missing.
2. Ask for the project slug if the consumer uses a different lowercase/package/resource name than the display name implies.
3. Run `pnpm install` if dependencies are not installed.
4. Run `pnpm init-repo -- --name "Project Name"`, adding `--slug project-slug` when a slug variation is provided.
5. Run `pnpm verify-init`.
6. Run `pnpm verify`.
7. Inspect `git diff` and fix only documented initialization failures.

The script owns mutation. Do not perform broad manual search-and-replace unless
`verify-init` exposes a specific missed placeholder.
