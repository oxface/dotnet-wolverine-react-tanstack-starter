# Scripts

- `init-repo.mjs` performs deterministic placeholder replacement for a new
  project name.
- `verify-init.mjs` checks whether starter placeholders remain.

The init script intentionally edits a small explicit file set. Keep it boring.

## Capability Commands

- `capabilities/add-keycloak-auth.mjs` adds Aspire Keycloak/session-ticket resources, Keycloak OIDC, ASP.NET Core cookie auth, and a Redis-backed persistent ticket store. Run through `pnpm starter:add-auth-keycloak`.
- `capabilities/add-rabbitmq-wolverine.mjs` adds an Aspire RabbitMQ resource and Wolverine RabbitMQ transport wiring. Run through `pnpm starter:add-rabbitmq-wolverine`.

Capability scripts are intentionally deterministic and idempotent. Update the script and its matching `.agents/skills/*/SKILL.md` together.

## Aspire Local Startup

Run `pnpm install` at the repository root before starting Aspire. The AppHost reads local resource parameters from `orchestration/StarterKit.AppHost/appsettings.json` and does not ask Aspire to run `pnpm install` for the Vite app.
