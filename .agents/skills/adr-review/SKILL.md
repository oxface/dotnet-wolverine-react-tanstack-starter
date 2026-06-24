---
name: adr-review
description: Review an Architecture Decision Record for technical-only scope, tradeoffs, fit with project guidance, and verification evidence. Use when asked to review, critique, accept, or refine an ADR in docs/adrs without creating an OpenSpec behavior spec.
---

# ADR Review

Use the normal code-review posture: lead with findings, ordered by severity,
then include open questions and a brief summary only after findings.

## Checks

1. The ADR is appropriate for a technical-only decision. If it changes
   user-facing behavior, runtime semantics, workflow semantics, or a feature
   slice, request an OpenSpec change instead.
2. The context explains the current problem and constraints without overstating
   tool automation.
3. The decision is explicit and narrow.
4. Consequences include real tradeoffs, not only benefits.
5. Alternatives considered are plausible and fairly rejected.
6. Verification evidence is appropriate for the change scope.
7. The ADR fits durable project guidance, especially human reviewability,
   minimal starter design, security/tenant impact, and reference-based context.

## Output

Lead with findings by severity and reference exact files or lines when possible.
If there are no issues, say that clearly and note any residual risk or missing
broader verification.
