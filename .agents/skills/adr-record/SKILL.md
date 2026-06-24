---
name: adr-record
description: Record or update a concise Architecture Decision Record for technical-only choices in this starter or a generated consumer project. Use when a change is about dependency selection, architecture boundaries, tooling/process, deployment posture, or accepted technical tradeoffs, and does not require an OpenSpec behavior spec.
---

# ADR Record

Use ADRs for technical decisions that should remain easy to review without
creating a full behavior-spec workflow.

## Workflow

1. Read `docs/README.md`, `docs/adrs/README.md`, and
   `docs/adrs/0000-template.md`.
2. Confirm an ADR is the right artifact. If the change affects user-visible
   behavior, runtime semantics, workflow semantics, or a feature slice, use an
   OpenSpec change instead.
3. Create the next numbered ADR in `docs/adrs/` from the template.
4. Record the context, decision, consequences, alternatives considered, review
   evidence, and verification.
5. Keep the ADR short and specific. Do not bury implementation tasks in the ADR.
6. Update durable guidance such as `docs/README.md`, `docs/architecture.md`, or
   OpenSpec configuration only when the decision changes how future work should
   proceed.

## Completion

Report the ADR path, status, changed files, verification run, and any skipped
checks with risk.
