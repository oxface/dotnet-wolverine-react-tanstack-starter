# Server

The backend starts as one ASP.NET Core Web API project plus Aspire ServiceDefaults under `src/StarterKit.Api`.

Read:

- [../docs/architecture.md](../docs/architecture.md)
- [../docs/development.md](../docs/development.md)
- [../docs/testing.md](../docs/testing.md)

Wolverine is configured for local in-process command handling only. Add
persistence, transports, auth, or modules only when the consuming project needs
them.
