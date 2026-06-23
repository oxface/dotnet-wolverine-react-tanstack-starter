#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const placeholders = [
  "Starter Kit",
  "StarterKit",
  "starter-kit",
  "starter_kit",
  "@starter-kit",
];
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "bin",
  "obj",
  "dist",
  "dotnet",
  ".dotnet",
  ".husky",
]);
const ignoredFiles = new Set([
  "scripts/verify-init.mjs",
  "scripts/init-repo.mjs",
]);
const extensions = new Set([
  ".cs",
  ".csproj",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".props",
  ".slnx",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(root, fullPath).split(path.sep).join("/");

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...(await walk(fullPath)));
      }
      continue;
    }

    if (
      !ignoredFiles.has(relative) &&
      extensions.has(path.extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const matches = [];
for (const file of await walk(root)) {
  const text = await readFile(file, "utf8");
  for (const placeholder of placeholders) {
    if (text.includes(placeholder)) {
      matches.push(`${path.relative(root, file)} contains ${placeholder}`);
    }
  }
}

if (matches.length > 0) {
  console.error(matches.join("\n"));
  process.exit(1);
}

console.log("No starter placeholders found.");
