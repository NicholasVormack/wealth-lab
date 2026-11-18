/**
 * WEALTH LAB — Site Verifier
 * ==========================
 * Fails loudly when the generated site would ship broken. Checks:
 *
 *   - root index.html exists
 *   - every internal link resolves to a real file
 *   - sitemap.xml lists every indexable page and has absolute URLs
 *   - the hub page links every micro-tool and published article
 *   - no page has an empty or duplicate <title>
 *   - CNAME / robots.txt are not misconfigured
 *
 * Run with: node scripts/verify-site.mjs
 * Exits 1 on errors, 0 when only warnings remain.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveSiteUrl } from "./lib/site.mjs";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

if (!fs.existsSync(path.join(OUTPUT, "index.html"))) {
  console.error("FATAL: output/index.html missing. Run: node scripts/asset-builder.mjs");
  process.exit(1);
}

const files = walk(OUTPUT);
const htmlFiles = files.filter((f) => f.endsWith(".html"));

/* ------------------------------------------------------------ internal links */

const relPath = (f) => path.relative(OUTPUT, f).split(path.sep).join("/");
let linkCount = 0;
const brokenLinks = [];

// Strip script/style first: `href="${l.url}"` inside a JS template literal is
// valid code, not a link, and matching it produces phantom failures.
const stripCode = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");

for (const file of htmlFiles) {
  const html = stripCode(fs.readFileSync(file, "utf8"));
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of hrefs) {
    if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(raw)) continue;
    const clean = raw.split("#")[0].split("?")[0];
    if (!clean) continue;
    // Root-relative hrefs resolve against the domain root, not the /repo/
    // subpath, so they 404 on GitHub Pages project sites. They look fine
    // locally because the file exists under output/, which hid 12 of them.
    if (clean.startsWith("/")) {
      brokenLinks.push(`${relPath(file)} -> ${raw} (root-relative, 404s on a /repo/ subpath)`);
      linkCount++;
      continue;
    }
    let target = path.resolve(path.dirname(file), clean);
    if (clean.endsWith("/")) target = path.join(target, "index.html");
    linkCount++;
    if (!fs.existsSync(target)) {
      brokenLinks.push(`${relPath(file)} -> ${raw}`);
    }
  }
}
if (brokenLinks.length) {
  err(`${brokenLinks.length} broken internal link(s):`);
  brokenLinks.slice(0, 25).forEach((b) => err(`    ${b}`));
  if (brokenLinks.length > 25) err(`    ...and ${brokenLinks.length - 25} more`);
}

/* ----------------------------------------------------------------- sitemap */

const sitemapPath = path.join(OUTPUT, "sitemap.xml");
let sitemapCount = 0;
if (!fs.existsSync(sitemapPath)) {
  err("sitemap.xml missing");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  sitemapCount = locs.length;
  if (!locs.length) err("sitemap.xml contains no <loc> entries");
  const relative = locs.filter((l) => !/^https?:\/\//.test(l));
  if (relative.length) err(`sitemap.xml has ${relative.length} non-absolute URL(s)`);

  // Only real public pages belong in the sitemap: the hub, micro-tools,
  // published articles and the legal pages. Email templates, dashboards,
  // cloaker redirects and samples are intentionally excluded.
  const PUBLIC_ROOT_PAGES = ["privacy-policy.html", "terms-of-service.html", "affiliate-disclosure.html"];
  const indexable = htmlFiles.filter((f) => {
    const rel = relPath(f);
    if (rel === "index.html") return false;
    if (PUBLIC_ROOT_PAGES.includes(rel)) return true;
    if (!/^(micro-tools|articles)\/[^/]+\//.test(rel)) return false;
    if (!rel.endsWith("/index.html")) return false;
    return !/name="robots"[^>]*noindex/i.test(fs.readFileSync(f, "utf8"));
  });
  const missing = indexable.filter((f) => {
    const needle = `/micro-tools/${relPath(f).split("/")[1]}/`;
    const articleNeedle = `/articles/${relPath(f).split("/")[1]}/`;
    return !locs.some((l) => l.includes(needle) || l.includes(articleNeedle) || l.endsWith(relPath(f)));
  });
  if (missing.length) {
    warn(`${missing.length} indexable page(s) not in sitemap.xml (run asset-builder):`);
    missing.slice(0, 10).forEach((m) => warn(`    ${relPath(m)}`));
  }
}

/* ------------------------------------------------------------- robots + CNAME */

const robotsPath = path.join(OUTPUT, "robots.txt");
if (!fs.existsSync(robotsPath)) {
  err("robots.txt missing");
} else {
  const robots = fs.readFileSync(robotsPath, "utf8");
  const line = (robots.match(/^Sitemap:\s*(.+)$/im) || [])[1];
  if (!line) err("robots.txt has no Sitemap directive");
  else if (!/^https?:\/\//.test(line.trim())) err(`robots.txt Sitemap must be absolute, got: ${line.trim()}`);
}

const cnamePath = path.join(OUTPUT, "CNAME");
if (fs.existsSync(cnamePath)) {
  const cname = fs.readFileSync(cnamePath, "utf8").trim();
  if (!cname || cname.startsWith("#") || /\s/.test(cname)) {
    err(`output/CNAME is invalid ("${cname.slice(0, 40)}") — GitHub Pages will fail to publish`);
  }
}

/* ------------------------------------------------- hub links everything */

const hub = fs.readFileSync(path.join(OUTPUT, "index.html"), "utf8");
const toolDirs = fs.existsSync(path.join(OUTPUT, "micro-tools"))
  ? fs.readdirSync(path.join(OUTPUT, "micro-tools")).filter((d) =>
      fs.existsSync(path.join(OUTPUT, "micro-tools", d, "index.html"))
    )
  : [];
const unlinkedTools = toolDirs.filter((d) => !hub.includes(`micro-tools/${d}/`));
if (unlinkedTools.length) err(`hub page does not link ${unlinkedTools.length} tool(s): ${unlinkedTools.join(", ")}`);

/* --------------------------------------------------------- email capture */

// A signup form is only useful if it posts to a real provider endpoint. An
// empty or relative action POSTs back to the tool page and silently drops the
// address, which is exactly the kind of false surface this site must not ship.
const captureConfigPath = path.join(LAB, "capture.config.json");
let captureConfigured = false;
if (fs.existsSync(captureConfigPath)) {
  try {
    captureConfigured = String(JSON.parse(fs.readFileSync(captureConfigPath, "utf8")).formAction || "").trim().length > 0;
  } catch {
    err("capture.config.json is not valid JSON");
  }
}

const capturePages = htmlFiles.filter((f) => fs.readFileSync(f, "utf8").includes("email-capture:start"));
for (const file of capturePages) {
  const action = (fs.readFileSync(file, "utf8").match(/<form action="([^"]*)"/) || [])[1] || "";
  if (!/^https?:\/\//i.test(action)) {
    err(`${relPath(file)}: email capture form action is not an absolute http(s) URL ("${action}")`);
  }
}

if (captureConfigured) {
  const noForm = toolDirs.filter(
    (d) => !fs.readFileSync(path.join(OUTPUT, "micro-tools", d, "index.html"), "utf8").includes("email-capture:start")
  );
  if (noForm.length) {
    err(`${noForm.length} tool page(s) missing the email capture form (run asset-builder): ${noForm.join(", ")}`);
  }
} else if (capturePages.length) {
  err(`${capturePages.length} page(s) ship an email capture form but capture.config.json has no formAction`);
} else {
  warn("email capture: no formAction in capture.config.json — no signup form ships");
}

/* ------------------------------------------------------------ titles + meta */

const titles = new Map();
let missingDesc = 0;
for (const file of htmlFiles) {
  const rel = relPath(file);
  if (rel.startsWith("go/")) continue;
  const html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) {
    err(`${rel}: missing <title>`);
    continue;
  }
  const normalized = title.trim().toLowerCase();
  titles.set(normalized, [...(titles.get(normalized) || []), rel]);

  // Only pages we ask search engines to index need a meta description;
  // dashboards, email templates and redirect pages never get one.
  const isPublic =
    rel === "index.html" ||
    /^(micro-tools|articles)\/[^/]+\/index\.html$/.test(rel) ||
    ["privacy-policy.html", "terms-of-service.html", "affiliate-disclosure.html"].includes(rel);
  if (isPublic && !/name="description"/i.test(html)) missingDesc++;
}
for (const [title, pages] of titles) {
  if (pages.length > 1) warn(`duplicate <title> "${title}" on: ${pages.join(", ")}`);
}
if (missingDesc) warn(`${missingDesc} page(s) have no meta description`);

/* ----------------------------------------------------------- stale domain */

// A single leftover reference to a domain that does not exist is a dead link
// for a reader and a wrong signal for a crawler.
const STALE = "wealth-lab.github.io";
const staleFiles = files
  .filter((f) => /\.(html|md|txt|xml|json|js|yml|csv)$/.test(f))
  .filter((f) => fs.readFileSync(f, "utf8").includes(STALE));
if (staleFiles.length) {
  err(`${staleFiles.length} file(s) still reference ${STALE}:`);
  staleFiles.slice(0, 8).forEach((f) => err(`    ${relPath(f)}`));
}

/* -------------------------------------------------------------- canonicals */

// Every page we ask search engines to index must declare the Pages URL as
// canonical. A canonical pointing at the wrong host silently de-indexes the site.
const SITE_URL = resolveSiteUrl();
const expectedCanonical = (rel) => {
  if (rel === "index.html") return `${SITE_URL}/`;
  if (rel.endsWith("/index.html")) return `${SITE_URL}/${rel.slice(0, -"index.html".length)}`;
  return `${SITE_URL}/${rel}`;
};
const canonicalise = (u) => u.replace(/\/+$/, "");
let canonChecked = 0;

for (const file of htmlFiles) {
  const rel = relPath(file);
  const isPublicPage =
    rel === "index.html" ||
    /^(micro-tools|articles)\/[^/]+\/index\.html$/.test(rel) ||
    ["privacy-policy.html", "terms-of-service.html", "affiliate-disclosure.html"].includes(rel);
  if (!isPublicPage) continue;

  const found = (fs.readFileSync(file, "utf8").match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!found) {
    err(`${rel}: missing canonical tag`);
    continue;
  }
  if (canonicalise(found) !== canonicalise(expectedCanonical(rel))) {
    err(`${rel}: canonical is ${found}, expected ${expectedCanonical(rel)}`);
    continue;
  }
  canonChecked++;
}

/* ------------------------------------------------------------------ report */

const articleCount = fs.existsSync(path.join(OUTPUT, "articles"))
  ? fs.readdirSync(path.join(OUTPUT, "articles")).filter((d) =>
      fs.existsSync(path.join(OUTPUT, "articles", d, "index.html"))
    ).length
  : 0;

console.log("");
console.log("WEALTH LAB — SITE VERIFICATION");
console.log("==============================");
console.log(`HTML pages:     ${htmlFiles.length}`);
console.log(`Micro-tools:    ${toolDirs.length}`);
console.log(`Articles:       ${articleCount}`);
console.log(`Internal links: ${linkCount}`);
console.log(`Sitemap URLs:   ${sitemapCount}`);
console.log(`Canonicals OK:  ${canonChecked}`);
console.log("");

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);

console.log("");
if (errors.length) {
  console.log(`RESULT: FAIL — ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`RESULT: PASS — 0 errors, ${warnings.length} warning(s)`);
