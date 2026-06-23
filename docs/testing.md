# Testing

Use the narrowest command that verifies the change.

```sh
pnpm format:check
pnpm backend:restore
pnpm backend:build
pnpm backend:test
pnpm frontend:verify
pnpm verify
pnpm verify:initialized
```

`pnpm verify:initialized` is intended for copied repositories after `pnpm init-repo` has run.

Use Aspire for local smoke validation:

```sh
dotnet run --project orchestration/StarterKit.AppApi/StarterKit.AppApi.csproj
```
