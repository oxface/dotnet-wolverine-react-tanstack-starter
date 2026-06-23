# Development

Use Node 24, pnpm 10.33.x, and .NET 10.

```sh
pnpm install
dotnet restore StarterKit.slnx
pnpm verify
```

After running `pnpm init-repo -- --name "Project Name"` in a copied repo, use
`pnpm verify:initialized` to also check that starter placeholders were removed.

Husky runs `pnpm format` on pre-commit and Commitlint on commit messages.
Commit messages should follow Conventional Commits.

## Optional Capabilities

Use `pnpm starter:add-auth-keycloak` for Keycloak OIDC with Redis-backed cookie tickets, and `pnpm starter:add-rabbitmq-wolverine` for RabbitMQ transport wiring through Wolverine. Keep capability changes scripted so generated repositories remain deterministic.

## Aspire Local Startup

Run `pnpm install` at the repository root before starting Aspire. The AppHost reads local resource parameters from `orchestration/StarterKit.AppHost/appsettings.json` and does not ask Aspire to run `pnpm install` for the Vite app.

The web app proxies backend paths through Vite during local development. Aspire sets `VITE_API_ORIGIN` from the API resource; outside Aspire it defaults to `http://localhost:5200`.
