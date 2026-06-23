# Architecture

This starter keeps the first commit small.

- `server/src/StarterKit.Api` is a single ASP.NET Core Web API project.
- `server/src/StarterKit.ServiceDefaults` contains Aspire service defaults for
  service discovery, HTTP resilience, OpenTelemetry, and health checks.
- Wolverine is wired in the Api to prove local command handling.
- `web/apps/starter-kit-web` is a tiny React app using TanStack Query and
  TanStack Router.
- `orchestration/StarterKit.AppHost` starts the Api, Web app, disposable PostgreSQL, two disposable
  Redis resources, and disposable Keycloak through Aspire.

The local platform resources are disposable by default. The Redis resources are intentionally split:

- `cache` is for disposable application cache data.
- `session-tickets` is reserved for future authentication ticket storage and
  should not share casual cache eviction policy.

PostgreSQL and Keycloak are scaffolded as local platform resources, but the Api
does not include persistence, migrations, OIDC, cookies, or authorization by
default.

Out of scope by default: persistence, authentication, broker transports,
background schedulers, modular boundaries, generated API clients, and product
business workflows.

## Optional Capabilities

Use `pnpm starter:add-auth-keycloak` for Keycloak OIDC with Redis-backed cookie tickets, and `pnpm starter:add-rabbitmq-wolverine` for RabbitMQ transport wiring through Wolverine. Keep capability changes scripted so generated repositories remain deterministic.
