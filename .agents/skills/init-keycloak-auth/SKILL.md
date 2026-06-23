---
name: init-keycloak-auth
description: Add Keycloak OpenID Connect authentication to this starter repository with ASP.NET Core cookie auth and a Redis-backed persistent ticket store. Use when a generated or base starter repo should opt into login/logout/current-user endpoints, Keycloak OIDC configuration, and server-side auth ticket persistence through the existing Aspire session-tickets Redis resource.
---

# Init Keycloak Auth

Run the deterministic capability command from the repository root:

```sh
pnpm starter:add-auth-keycloak
```

Then verify:

```sh
pnpm verify
```

The command adds ASP.NET Core OIDC/cookie auth, a Redis `ITicketStore`, `/api/auth/me`, `/api/auth/login`, and `/api/auth/logout` endpoints. It uses the existing Aspire `keycloak` and `session-tickets` resources; configure the Keycloak realm/client to match `Authentication:Keycloak:*` values before testing an actual login flow.

Do not hand-edit the auth scaffold unless the command fails or the product needs a deliberate auth architecture change.
