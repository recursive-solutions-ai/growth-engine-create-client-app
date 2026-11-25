#!/usr/bin/env node

// src/bin.ts
import * as p from "@clack/prompts";

// src/scaffold.ts
import { resolve, join } from "path";
import { readdir, readFile, writeFile, mkdir, copyFile, chmod } from "fs/promises";
import { fileURLToPath } from "url";
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
  const templateDir2 = resolve(thisDir, "..", "template");
  const targetDir = resolve(process.cwd(), options.slug);
  await mkdir(targetDir, { recursive: true });
  const replacements = {
    "{{CLIENT_NAME}}": options.name,
    "{{CLIENT_SLUG}}": options.slug,
    "{{SDK_VERSION}}": options.sdkVersion
  };
  await copyDir(templateDir2, targetDir, replacements);
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

// src/sdk-release.ts
var REPOS = ["growth-engine-sdk-client", "growth-engine-sdk-server"];
var ORG = "recursive-solutions-ai";
var TIMEOUT_MS = 15e3;
var TAG_RE = /refs\/tags\/v(\d+)\.(\d+)\.(\d+)$/;
function compareSdkVersions(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
async function listTags(repo, fetchImpl) {
  const url = `https://github.com/${ORG}/${repo}.git/info/refs?service=git-upload-pack`;
  let res;
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not list SDK releases for ${repo} (${url}): ${cause}`, { cause: err });
  }
  if (res.status !== 200) {
    throw new Error(`Could not list SDK releases for ${repo} (${url}): HTTP ${res.status}`);
  }
  const body = await res.text();
  const tags = /* @__PURE__ */ new Set();
  for (const line of body.split("\n")) {
    const m = TAG_RE.exec(line.replace(/\0.*$/, "").trim());
    if (m) tags.add(`${m[1]}.${m[2]}.${m[3]}`);
  }
  return tags;
}
async function resolveLatestSdkVersion(fetchImpl = fetch) {
  const [client, server] = await Promise.all(REPOS.map((r) => listTags(r, fetchImpl)));
  const common = [...client ?? []].filter((v) => server?.has(v));
  if (common.length === 0) {
    throw new Error(
      `No SDK release is tagged in both ${REPOS[0]} (${client?.size ?? 0} tags) and ${REPOS[1]} (${server?.size ?? 0} tags) under https://github.com/${ORG}/`
    );
  }
  common.sort(compareSdkVersions);
  return common[common.length - 1];
}

// src/upgrade.ts
import { join as join2, resolve as resolve2 } from "path";
import { readFile as readFile2, writeFile as writeFile2, mkdir as mkdir2, access, readdir as readdir2 } from "fs/promises";
import { readFileSync } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
var thisFile = fileURLToPath2(import.meta.url);
var pkgJson = JSON.parse(readFileSync(resolve2(thisFile, "..", "..", "package.json"), "utf-8"));
var SDK_VERSION = pkgJson.version;
function templateDir() {
  return resolve2(fileURLToPath2(import.meta.url), "..", "..", "template");
}
var POST_PAGE = "src/app/[locale]/blog/[slug]/page.tsx";
var TOPIC_PAGE = "src/app/[locale]/blog/topic/[slug]/page.tsx";
var SITEMAP_SHARED = "src/lib/sitemap-shared.ts";
var SITEMAP_ROUTE = "src/app/sitemap/[file]/route.ts";
var RS_ROUTE = "src/app/api/rs/[...route]/route.ts";
var DICT_DIR = "src/i18n/dictionaries";
var DICT_KEYS = [
  "blog.related.posts",
  "blog.topics.label",
  "blog.topic.title",
  "blog.topic.subtitle"
];
async function readIfExists(path) {
  try {
    return await readFile2(path, "utf-8");
  } catch (err) {
    const code = err.code;
    if (code === "ENOENT") return null;
    console.error(`[upgrade] failed to read ${path}:`, err);
    throw err;
  }
}
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function upgradeStructuralLinking(dir, opts = {}) {
  const root = resolve2(dir);
  const targetVersion = opts.sdkVersion ?? SDK_VERSION;
  const apply = opts.apply === true;
  const checks = [];
  const pkgPath = join2(root, "package.json");
  const pkgRaw = await readIfExists(pkgPath);
  if (pkgRaw === null) {
    throw new Error(`${pkgPath} not found \u2014 run this inside a client website repo`);
  }
  const refRe = /"(@growth-engine\/sdk-(?:client|server))":\s*"github:recursive-solutions-ai\/growth-engine-sdk-(?:client|server)#v([^"]+)"/g;
  const found = [...pkgRaw.matchAll(refRe)];
  const behind = found.filter((m) => compareSdkVersions(m[2] ?? "0.0.0", targetVersion) < 0);
  let pkgCheck;
  if (found.length < 2) {
    pkgCheck = {
      id: "sdk-deps",
      title: "SDK dependencies",
      ok: false,
      detail: `package.json has ${found.length}/2 github:\u2026#v refs for @growth-engine/sdk-{client,server}`,
      fix: `Point both dependencies at the release tag, e.g. "@growth-engine/sdk-client": "github:recursive-solutions-ai/growth-engine-sdk-client#v${targetVersion}"`
    };
  } else if (behind.length === 0) {
    pkgCheck = {
      id: "sdk-deps",
      title: "SDK dependencies",
      ok: true,
      detail: `both pinned at v${targetVersion} or newer`,
      fix: ""
    };
  } else {
    pkgCheck = {
      id: "sdk-deps",
      title: "SDK dependencies",
      ok: false,
      detail: `pinned at ${[...new Set(behind.map((m) => `v${m[2]}`))].join(", ")}, want v${targetVersion}`,
      fix: `Bump both github:\u2026#v refs to v${targetVersion}, then reinstall.`
    };
    if (apply) {
      const next = pkgRaw.replace(
        /(github:recursive-solutions-ai\/growth-engine-sdk-(?:client|server)#v)([^"]+)/g,
        (whole, prefix, ref) => compareSdkVersions(ref, targetVersion) < 0 ? `${prefix}${targetVersion}` : whole
      );
      await writeFile2(pkgPath, next);
      pkgCheck = {
        ...pkgCheck,
        ok: true,
        applied: "package.json",
        detail: `bumped both refs to v${targetVersion} (reinstall to pick them up)`
      };
    }
  }
  checks.push(pkgCheck);
  const topicPath = join2(root, TOPIC_PAGE);
  let topicCheck = {
    id: "topic-route",
    title: "Topic hub route",
    ok: await exists(topicPath),
    detail: await exists(topicPath) ? `${TOPIC_PAGE} exists` : `${TOPIC_PAGE} is missing`,
    fix: `Copy ${TOPIC_PAGE} from the create-client-app template.`
  };
  if (!topicCheck.ok && apply) {
    const source = await readFile2(join2(templateDir(), TOPIC_PAGE), "utf-8");
    await mkdir2(join2(root, TOPIC_PAGE, ".."), { recursive: true });
    await writeFile2(topicPath, source);
    topicCheck = { ...topicCheck, ok: true, applied: TOPIC_PAGE, detail: "copied from the template" };
  }
  checks.push(topicCheck);
  const postPage = await readIfExists(join2(root, POST_PAGE)) ?? "";
  const hasRelated = postPage.includes("<RelatedArticles");
  const hasChips = postPage.includes("<TopicChips");
  checks.push({
    id: "post-page",
    title: "Post page renders RelatedArticles + TopicChips",
    ok: hasRelated && hasChips,
    detail: postPage ? `RelatedArticles: ${hasRelated ? "yes" : "no"}, TopicChips: ${hasChips ? "yes" : "no"}` : `${POST_PAGE} not found`,
    fix: `Port the <TopicChips> and <RelatedArticles> blocks from the template's ${POST_PAGE} (imported from '@growth-engine/sdk-client/components') into your post page.`
  });
  const sitemapShared = await readIfExists(join2(root, SITEMAP_SHARED)) ?? "";
  const sitemapRoute = await readIfExists(join2(root, SITEMAP_ROUTE)) ?? "";
  const sitemapOk = sitemapShared.includes("buildTopicEntries") && sitemapRoute.includes("buildTopicEntries");
  checks.push({
    id: "sitemap",
    title: "Sitemap lists the topic hubs",
    ok: sitemapOk,
    detail: sitemapOk ? "buildTopicEntries is defined and wired into the sitemap route" : `buildTopicEntries missing from ${sitemapShared ? "" : `${SITEMAP_SHARED} (not found) `}${sitemapShared.includes("buildTopicEntries") ? "" : SITEMAP_SHARED + " "}` + `${sitemapRoute.includes("buildTopicEntries") ? "" : SITEMAP_ROUTE}`.trim(),
    fix: `Port buildTopicEntries from the template's ${SITEMAP_SHARED} and call it from ${SITEMAP_ROUTE}.`
  });
  const dictPath = join2(root, DICT_DIR);
  const dictFiles = (await readdir2(dictPath).catch(() => [])).filter((f) => f.endsWith(".ts"));
  const missingByFile = [];
  for (const file of dictFiles) {
    const body = await readIfExists(join2(dictPath, file)) ?? "";
    const missing = DICT_KEYS.filter((key) => !body.includes(`'${key}'`) && !body.includes(`"${key}"`));
    if (missing.length > 0) missingByFile.push(`${file}: ${missing.join(", ")}`);
  }
  checks.push({
    id: "dictionaries",
    title: "Topic hub copy in every dictionary",
    ok: dictFiles.length > 0 && missingByFile.length === 0,
    detail: dictFiles.length === 0 ? `${DICT_DIR} has no dictionaries` : missingByFile.length === 0 ? `all ${DICT_KEYS.length} keys present in ${dictFiles.join(", ")}` : `missing \u2014 ${missingByFile.join(" | ")}`,
    fix: `Add ${DICT_KEYS.join(", ")} to every file in ${DICT_DIR}, translated. The template's en.ts has the English wording.`
  });
  const rsPath = join2(root, RS_ROUTE);
  const rsRaw = await readIfExists(rsPath);
  const declaresTrue = /structuralLinks:\s*true/.test(rsRaw ?? "");
  const ready = checks.every((c) => c.ok);
  let declareCheck = {
    id: "declaration",
    title: "Repo declares structuralLinks to the SDK handler",
    ok: declaresTrue && ready,
    detail: rsRaw === null ? `${RS_ROUTE} not found` : declaresTrue ? "declared" : "not declared",
    fix: ready ? `Pass \`structuralLinks: true\` to GrowthEngineHandler in ${RS_ROUTE}.` : "Finish the checks above first \u2014 declaring a capability the site does not have is the exact bug this flag was added to stop."
  };
  if (rsRaw !== null && ready && !declaresTrue && apply) {
    const next = rsRaw.replace(
      /(GrowthEngineHandler\(\{)/,
      "$1\n	// Ported by `create-client-app upgrade`: this repo renders the\n	// related-articles block, the topic chips and /blog/topic/[slug], so Brain\n	// may count those structural links when it looks for orphan posts.\n	structuralLinks: true,"
    );
    if (next !== rsRaw) {
      await writeFile2(rsPath, next);
      declareCheck = { ...declareCheck, ok: true, applied: RS_ROUTE, detail: "declared" };
    } else {
      console.error(`[upgrade] could not find a GrowthEngineHandler({ call in ${RS_ROUTE}`);
    }
  }
  if (declaresTrue && !ready) {
    declareCheck = {
      ...declareCheck,
      ok: false,
      detail: "declares structuralLinks: true, but the pieces above are NOT all in place",
      fix: "Either finish the checks above or set `structuralLinks: false` \u2014 Brain trusts this flag, and a wrong yes hides every orphan on the blog."
    };
  }
  checks.push(declareCheck);
  return {
    dir: root,
    sdkVersion: targetVersion,
    checks,
    ready,
    declared: declareCheck.ok,
    manual: checks.filter((c) => !c.ok)
  };
}
function formatUpgradeReport(report) {
  const lines = [`Structural internal linking \u2014 ${report.dir} (SDK v${report.sdkVersion})`, ""];
  for (const check of report.checks) {
    const mark = check.ok ? "\u2713" : "\u2717";
    lines.push(`${mark} ${check.title}: ${check.detail}${check.applied ? ` [wrote ${check.applied}]` : ""}`);
    if (!check.ok && check.fix) lines.push(`    \u2192 ${check.fix}`);
  }
  lines.push("");
  lines.push(
    report.declared ? "This site now reports structuralLinks: true \u2014 deploy it, and Brain will count the related block and the topic hubs as inbound links." : "This site does NOT report structuralLinks, so Brain counts links written into post bodies only. That is the safe answer, not a passing one: finish the items above."
  );
  return lines;
}

// src/bin.ts
var FRESH_CLI_COMMAND = "bunx --no-cache github:recursive-solutions-ai/growth-engine-create-client-app create-client-app";
async function resolveOrCancel() {
  try {
    const latest = await resolveLatestSdkVersion();
    const order = compareSdkVersions(SDK_VERSION, latest);
    if (order < 0) {
      p.log.warn(
        `This CLI is v${SDK_VERSION} but the latest SDK is v${latest}, so its template is stale. Re-run with a fresh copy:
${FRESH_CLI_COMMAND}`
      );
    } else if (order > 0) {
      p.log.warn(
        `This CLI is v${SDK_VERSION} but the latest PUBLISHED SDK is v${latest}: the template may expect an SDK release that is not yet published.`
      );
    }
    return latest;
  } catch (err) {
    console.error("[create-client-app] could not resolve the latest SDK release:", err);
    p.cancel(
      `Could not determine the latest SDK release, so nothing was written. ${err instanceof Error ? err.message : String(err)}`
    );
    process.exitCode = 1;
    return null;
  }
}
async function upgradeCommand(argv) {
  const apply = argv.includes("--apply");
  const dir = argv.find((a) => !a.startsWith("-")) ?? process.cwd();
  p.intro("Growth Engine \u2014 upgrade client site");
  const sdkVersion = await resolveOrCancel();
  if (sdkVersion === null) return;
  let report;
  try {
    report = await upgradeStructuralLinking(dir, { apply, sdkVersion });
  } catch (err) {
    console.error("[upgrade] failed:", err);
    p.cancel(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }
  for (const line of formatUpgradeReport(report)) console.log(line);
  if (!apply && report.manual.length > 0) {
    p.note("Re-run with --apply to write the parts that can be ported automatically.", "Dry run");
  }
  process.exitCode = report.declared ? 0 : 1;
  p.outro(report.declared ? "Structural linking is wired." : "Work remains \u2014 see above.");
}
async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === "upgrade") {
    await upgradeCommand(argv.slice(1));
    return;
  }
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
  const sdkVersion = await resolveOrCancel();
  if (sdkVersion === null) return;
  const spinner2 = p.spinner();
  spinner2.start(`Scaffolding project on SDK v${sdkVersion}...`);
  await scaffold({
    name: project.name,
    slug: project.slug,
    sdkVersion
  });
  spinner2.stop(`Project scaffolded on SDK v${sdkVersion}!`);
  p.note(
    `cd ${project.slug}
# Copy .env.example to .env.local and fill in your credentials
cp .env.example .env.local
npm install
npm run dev`,
    "Next steps"
  );
  p.outro(`Done! SDK v${sdkVersion}`);
}
void main();
//# sourceMappingURL=bin.js.map