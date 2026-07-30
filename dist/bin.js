#!/usr/bin/env node

// src/bin.ts
import * as p from "@clack/prompts";

// src/scaffold.ts
import { resolve, join } from "path";
import { readdir, readFile, writeFile, mkdir, copyFile, chmod } from "fs/promises";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
var thisFile = fileURLToPath(import.meta.url);
var pkgJson = JSON.parse(readFileSync(resolve(thisFile, "..", "..", "package.json"), "utf-8"));
var SDK_VERSION = pkgJson.version;
var TEMPLATE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".mjs",
  ".html"
]);
async function scaffold(options) {
  const thisDir = resolve(fileURLToPath(import.meta.url), "..");
  const templateDir = resolve(thisDir, "..", "template");
  const targetDir = resolve(process.cwd(), options.slug);
  await mkdir(targetDir, { recursive: true });
  const replacements = {
    "{{CLIENT_NAME}}": options.name,
    "{{CLIENT_SLUG}}": options.slug,
    "{{SDK_VERSION}}": SDK_VERSION
  };
  await copyDir(templateDir, targetDir, replacements);
  const huskyDir = join(targetDir, ".husky");
  const huskyEntries = await readdir(huskyDir).catch(() => []);
  for (const hook of huskyEntries) {
    if (!hook.startsWith("_")) {
      await chmod(join(huskyDir, hook), 493);
    }
  }
}
function applyReplacements(content, replacements) {
  let result = content;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}
async function copyDir(src, dest, replacements) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    let destName = entry.name;
    if (destName.endsWith(".template")) {
      destName = destName.slice(0, -".template".length);
    }
    if (destName === "gitignore") {
      destName = ".gitignore";
    }
    if (destName === "husky") {
      destName = ".husky";
    }
    const destPath = join(dest, destName);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, replacements);
    } else {
      const ext = "." + destName.split(".").pop();
      if (TEMPLATE_EXTENSIONS.has(ext) || entry.name.endsWith(".template")) {
        const content = await readFile(srcPath, "utf-8");
        await writeFile(destPath, applyReplacements(content, replacements), "utf-8");
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  }
}

// src/bin.ts
async function main() {
  p.intro("Growth Engine \u2014 Create Client App");
  const project = await p.group(
    {
      name: () => p.text({
        message: "Client name:",
        placeholder: "Restaurant Bella",
        validate: (v) => v.length === 0 ? "Name is required" : void 0
      }),
      slug: () => p.text({
        message: "Client slug:",
        placeholder: "restaurant-bella",
        validate: (v) => /^[a-z0-9-]+$/.test(v) ? void 0 : "Slug must be lowercase alphanumeric with dashes"
      })
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      }
    }
  );
  const spinner2 = p.spinner();
  spinner2.start("Scaffolding project...");
  await scaffold({
    name: project.name,
    slug: project.slug
  });
  spinner2.stop("Project scaffolded!");
  p.note(
    `cd ${project.slug}
# Copy .env.example to .env.local and fill in your credentials
cp .env.example .env.local
npm install
npm run dev`,
    "Next steps"
  );
  p.outro("Done!");
}
void main();
//# sourceMappingURL=bin.js.map