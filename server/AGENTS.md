# Server Agent Guide

Before changing backend behavior, read:

- [README.md](README.md)
- [../docs/architecture.md](../docs/architecture.md)
- [../docs/testing.md](../docs/testing.md)

Keep the backend minimal. The default shape is one Api Web API project with a
small Wolverine command-handling proof. Do not introduce persistence, auth,
modules, brokers, or domain workflows by default.
