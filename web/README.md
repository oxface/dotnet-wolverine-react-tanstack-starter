# Web

The frontend workspace starts with one React/Vite app under
`apps/starter-kit-web` and empty `packages`/`tests` roots for future growth.

Read:

- [../docs/architecture.md](../docs/architecture.md)
- [../docs/development.md](../docs/development.md)
- [../docs/testing.md](../docs/testing.md)

## Local Backend Proxy

The Vite app proxies `/api`, `/health`, `/alive`, `/signin-oidc`, and `/signout-callback-oidc` to `VITE_API_ORIGIN`, defaulting to `http://localhost:5200`. This keeps browser calls on the web origin during local development while still reaching the API.
