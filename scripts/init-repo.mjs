#!/usr/bin/env node
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");

function parseArgs(argv) {
  const nameIndex = argv.findIndex((arg) => arg === "--name");
  if (nameIndex === -1 || !argv[nameIndex + 1]) {
    throw new Error('Usage: pnpm init-repo -- --name "Acme Desk"');
  }

  return argv[nameIndex + 1];
}

function toWords(name) {
  return name
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function toPascal(words) {
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toKebab(words) {
  return words.map((word) => word.toLowerCase()).join("-");
}

function toSnake(words) {
  return words.map((word) => word.toLowerCase()).join("_");
}

const displayName = parseArgs(process.argv.slice(2));
const words = toWords(displayName);
if (words.length === 0) {
  throw new Error("Project name must contain letters or numbers.");
}

const pascalName = toPascal(words);
const kebabName = toKebab(words);
const snakeName = toSnake(words);

const replacements = new Map([
  ["Starter Kit", displayName.trim()],
  ["StarterKit", pascalName],
  ["starter-kit", kebabName],
  ["starter_kit", snakeName],
  ["@starter-kit", `@${kebabName}`],
]);

const textFiles = [
  "README.md",
  "AGENTS.md",
  "package.json",
  "pnpm-lock.yaml",
  ".devcontainer/devcontainer.json",
  "aspire.config.json",
  "StarterKit.slnx",
  "docs/README.md",
  "docs/architecture.md",
  "docs/development.md",
  "docs/testing.md",
  "docs/decisions.md",
  "server/README.md",
  "server/AGENTS.md",
  "server/src/StarterKit.Api/StarterKit.Api.csproj",
  "server/src/StarterKit.Api/Program.cs",
  "server/src/StarterKit.Api/Wolverine/EchoCommand.cs",
  "server/src/StarterKit.ServiceDefaults/StarterKit.ServiceDefaults.csproj",
  "server/src/StarterKit.ServiceDefaults/Extensions.cs",
  "server/tests/StarterKit.Api.Tests/StarterKit.Api.Tests.csproj",
  "server/tests/StarterKit.Api.Tests/ApiSmokeTests.cs",
  "web/README.md",
  "web/AGENTS.md",
  "web/apps/README.md",
  "web/apps/starter-kit-web/package.json",
  "web/apps/starter-kit-web/index.html",
  "web/apps/starter-kit-web/src/App.tsx",
  "web/apps/starter-kit-web/src/App.test.tsx",
  "web/apps/starter-kit-web/src/main.tsx",
  "orchestration/README.md",
  "orchestration/AGENTS.md",
  "orchestration/StarterKit.AppHost/StarterKit.AppHost.csproj",
  "orchestration/StarterKit.AppHost/appsettings.json",
  "orchestration/StarterKit.AppHost/Program.cs",
  "scripts/README.md",
  "scripts/capabilities/add-keycloak-auth.mjs",
  "scripts/capabilities/add-rabbitmq-wolverine.mjs",
  ".agents/skills/init-repo/SKILL.md",
  ".agents/skills/init-keycloak-auth/SKILL.md",
  ".agents/skills/init-rabbitmq-wolverine/SKILL.md",
  ".github/workflows/ci.yml",
  ".github/workflows/release-please.yml",
  ".github/dependabot.yml",
];

for (const relative of textFiles) {
  const file = path.join(root, relative);
  let text = await readFile(file, "utf8");
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  await writeFile(file, text);
}

const renamePairs = [
  ["StarterKit.slnx", `${pascalName}.slnx`],
  [
    "server/src/StarterKit.Api/StarterKit.Api.csproj",
    `server/src/StarterKit.Api/${pascalName}.Api.csproj`,
  ],
  [
    "server/src/StarterKit.ServiceDefaults/StarterKit.ServiceDefaults.csproj",
    `server/src/StarterKit.ServiceDefaults/${pascalName}.ServiceDefaults.csproj`,
  ],
  [
    "server/tests/StarterKit.Api.Tests/StarterKit.Api.Tests.csproj",
    `server/tests/StarterKit.Api.Tests/${pascalName}.Api.Tests.csproj`,
  ],
  [
    "orchestration/StarterKit.AppHost/StarterKit.AppHost.csproj",
    `orchestration/StarterKit.AppHost/${pascalName}.AppHost.csproj`,
  ],
  ["server/src/StarterKit.Api", `server/src/${pascalName}.Api`],
  [
    "server/src/StarterKit.ServiceDefaults",
    `server/src/${pascalName}.ServiceDefaults`,
  ],
  ["server/tests/StarterKit.Api.Tests", `server/tests/${pascalName}.Api.Tests`],
  ["orchestration/StarterKit.AppHost", `orchestration/${pascalName}.AppHost`],
  ["web/apps/starter-kit-web", `web/apps/${kebabName}-web`],
];

for (const [from, to] of renamePairs) {
  await rename(path.join(root, from), path.join(root, to));
}

console.log(`Initialized ${displayName.trim()}`);
console.log(`Namespace: ${pascalName}`);
console.log(`Slug: ${kebabName}`);
console.log(`Database slug: ${snakeName}`);
console.log(`NPM scope: @${kebabName}`);
