# Orchestration

Aspire startup lives under `StarterKit.AppHost` and runs the backend Api plus
the frontend Vite app.

Read:

- [../docs/development.md](../docs/development.md)
- [../docs/testing.md](../docs/testing.md)

## Local Parameters

`StarterKit.AppHost/appsettings.json` provides local Aspire parameter values under `Parameters`. Keep these development defaults boring and replace them in real deployments.

The web resource uses `WithPnpm(install: false)`, so run `pnpm install` at the repository root before starting Aspire.
