#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

async function read(relative) {
  return await readFile(path.join(root, relative), "utf8");
}

async function write(relative, text) {
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await writeFile(path.join(root, relative), text);
}

function insertBefore(text, needle, insertion) {
  if (text.includes(insertion.trim())) {
    return text;
  }

  const index = text.indexOf(needle);
  if (index === -1) {
    throw new Error(`Could not find insertion point: ${needle}`);
  }

  return `${text.slice(0, index)}${insertion}${text.slice(index)}`;
}

function insertAfter(text, needle, insertion) {
  if (text.includes(insertion.trim())) {
    return text;
  }

  const index = text.indexOf(needle);
  if (index === -1) {
    throw new Error(`Could not find insertion point: ${needle}`);
  }

  const end = index + needle.length;
  return `${text.slice(0, end)}${insertion}${text.slice(end)}`;
}

function replaceOnce(text, from, to) {
  if (text.includes(to.trim())) {
    return text;
  }

  if (!text.includes(from)) {
    throw new Error(`Could not find text to replace: ${from}`);
  }

  return text.replace(from, to);
}

async function update(relative, transform) {
  const original = await read(relative);
  const next = transform(original);
  if (next !== original) {
    await write(relative, next);
  }
}

async function updateJson(relative, transform) {
  const original = await read(relative);
  const data = JSON.parse(original);
  transform(data);
  await write(relative, `${JSON.stringify(data, null, 2)}\n`);
}

const messagingFiles = new Map([
  [
    "server/src/StarterKit.Api/Messaging/MessagingEndpoints.cs",
    `using Wolverine;

namespace StarterKit.Api.Messaging;

public static class MessagingEndpoints
{
    public static IEndpointRouteBuilder MapMessagingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        RouteGroupBuilder group = endpoints.MapGroup("/api/messages");

        group.MapPost("/ping", async (PingMessageRequest request, IMessageBus bus) =>
        {
            await bus.PublishAsync(new PingMessage(request.Message));
            return Results.Accepted();
        });

        return endpoints;
    }
}

public sealed record PingMessageRequest(string Message);
`,
  ],
  [
    "server/src/StarterKit.Api/Messaging/PingMessage.cs",
    `namespace StarterKit.Api.Messaging;

public sealed record PingMessage(string Message);

public sealed record PingMessageHandled(string Message, DateTimeOffset HandledAt);

public static class PingMessageHandler
{
    public static PingMessageHandled Handle(PingMessage message) =>
        new(message.Message, DateTimeOffset.UtcNow);
}
`,
  ],
]);

// prettier-ignore
await updateJson(
  "orchestration/StarterKit.AppHost/appsettings.json",
  (data) => {
    data.Parameters ??= {};
    data.Parameters["rabbitmq-username"] ??= "rabbitmq";
    data.Parameters["rabbitmq-password"] ??= "rabbitmq";
  },
);

await update("Directory.Packages.props", (text) => {
  text = insertAfter(
    text,
    '    <PackageVersion Include="Aspire.Hosting.PostgreSQL" Version="13.4.6" />',
    '\n    <PackageVersion Include="Aspire.Hosting.RabbitMQ" Version="13.4.6" />',
  );
  text = insertAfter(
    text,
    '    <PackageVersion Include="WolverineFx" Version="6.14.0" />',
    '\n    <PackageVersion Include="WolverineFx.RabbitMQ" Version="6.14.0" />',
  );
  return text;
});

await update(
  "orchestration/StarterKit.AppHost/StarterKit.AppHost.csproj",
  (text) =>
    insertAfter(
      text,
      '    <PackageReference Include="Aspire.Hosting.PostgreSQL" />',
      '\n    <PackageReference Include="Aspire.Hosting.RabbitMQ" />',
    ),
);

await update("server/src/StarterKit.Api/StarterKit.Api.csproj", (text) =>
  insertAfter(
    text,
    '    <PackageReference Include="WolverineFx" />',
    '\n    <PackageReference Include="WolverineFx.RabbitMQ" />',
  ),
);

await update("orchestration/StarterKit.AppHost/Program.cs", (text) => {
  text = insertAfter(
    text,
    `var sessionTickets = builder
    .AddRedis("session-tickets", port: 6380)
    .WithDataVolume("starter-kit-session-tickets");
`,
    `
var rabbitUsername = builder.AddParameter("rabbitmq-username");
var rabbitPassword = builder.AddParameter("rabbitmq-password", secret: true);
var messaging = builder
    .AddRabbitMQ("messaging", rabbitUsername, rabbitPassword, port: 5672)
    .WithDataVolume("starter-kit-rabbitmq")
    .WithManagementPlugin(port: 15672);
`,
  );
  text = insertAfter(
    text,
    `    .WithReference(sessionTickets)
`,
    `    .WithReference(messaging)
`,
  );
  text = insertAfter(
    text,
    `    .WaitFor(sessionTickets)
`,
    `    .WaitFor(messaging)
`,
  );
  return text;
});

await update("server/src/StarterKit.Api/Program.cs", (text) => {
  text = insertBefore(
    text,
    "using StarterKit.Api.Wolverine;",
    "using StarterKit.Api.Messaging;\n",
  );
  text = insertAfter(text, "using Wolverine;", "\nusing Wolverine.RabbitMQ;");
  text = replaceOnce(
    text,
    "builder.Host.UseWolverine(options => options.UseRuntimeCompilation());",
    `string? messagingConnectionString = builder.Configuration.GetConnectionString("messaging");
builder.Host.UseWolverine(options =>
{
    options.UseRuntimeCompilation();

    if (!string.IsNullOrWhiteSpace(messagingConnectionString))
    {
        options.UseRabbitMq(messagingConnectionString).AutoProvision();
        options.PublishMessage<PingMessage>().ToRabbitQueue("starter-kit-pings");
        options.ListenToRabbitQueue("starter-kit-pings");
    }
});`,
  );
  text = insertAfter(
    text,
    "app.MapDefaultEndpoints();",
    "\napp.MapMessagingEndpoints();",
  );
  return text;
});

for (const [relative, contents] of messagingFiles) {
  await write(relative, contents);
}

console.log("Added RabbitMQ resource wiring and Wolverine RabbitMQ messaging.");
