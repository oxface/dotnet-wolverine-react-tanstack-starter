# Starter Kit

Starter repo for .NET projects using Wolverine, React, TanStack Query, and
TanStack Router.

This repository is intentionally a lightweight GitHub template. It gives a new
project a useful first commit shape, not a complete architecture.

## Quick Start

```sh
pnpm install
pnpm init-repo -- --name "Acme Desk"
pnpm verify
```

Run locally through Aspire:

```sh
dotnet run --project orchestration/StarterKit.AppHost/StarterKit.AppHost.csproj
```

## Repository Map

- [docs/README.md](docs/README.md) indexes project guidance.
- [server/README.md](server/README.md) describes the minimal .NET Api.
- [web/README.md](web/README.md) describes the frontend workspace.
- [orchestration/README.md](orchestration/README.md) describes Aspire startup.
- [scripts/README.md](scripts/README.md) describes initialization helpers.

## Optional Capabilities

Keep the base starter lean, then opt into heavier architecture with deterministic commands:

```sh
pnpm starter:add-auth-keycloak
pnpm starter:add-rabbitmq-wolverine
pnpm verify
```

The matching repo-local skills live under `.agents/skills/` and describe when to use each command.
Aspire uses `orchestration/StarterKit.AppHost/appsettings.json` for local resource parameters. The web resource assumes dependencies were installed from the repository root with `pnpm install`; Aspire does not run `pnpm install` for the Vite app.
