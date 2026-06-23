---
name: init-rabbitmq-wolverine
description: Add RabbitMQ messaging to this starter repository and connect it to Wolverine. Use when a generated or base starter repo should opt into an Aspire RabbitMQ resource, WolverineFx.RabbitMQ transport configuration, and a tiny message/handler/endpoint sample that proves the broker wiring without adding domain behavior.
---

# Init RabbitMQ Wolverine

Run the deterministic capability command from the repository root:

```sh
pnpm starter:add-rabbitmq-wolverine
```

Then verify:

```sh
pnpm verify
```

The command adds an Aspire `messaging` RabbitMQ resource with a named data volume and management plugin, references it from the API, and configures Wolverine RabbitMQ only when the `messaging` connection string exists. Normal tests should still run without a live broker.

Keep the sample message domain-neutral. Replace it only when the product has real messaging contracts.
