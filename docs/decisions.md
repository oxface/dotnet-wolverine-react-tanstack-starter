# Starter Decisions

- Keep this as a GitHub template repository, not a published CLI package.
- Use pnpm as the root package manager.
- Use Husky and Commitlint for local Conventional Commit checks.
- Keep backend shape to one Api Web API project by default.
- Include Aspire ServiceDefaults for health checks, service discovery,
  resilience, and telemetry.
- Include minimal Wolverine configuration as a proof point only.
- Scaffold disposable PostgreSQL, cache Redis, session-ticket Redis, and
  Keycloak in Aspire without wiring persistence or authentication into the Api
  by default.
- Keep frontend shape to one React app plus empty extension folders.
- Use Aspire for local orchestration of backend, frontend, and local platform
  resources.
- Use OpenSpec as the default behavior-spec tool when a consumer project
  needs SDD, but do not install it in the starter by default.
- Use ADRs for technical-only decisions that do not need a behavior spec.
- Keep initialization deterministic through `scripts/init-repo.mjs`.
