/**
 * WEALTH LAB — GitHub Pages Deploy Helper
 * Prepares the output/ directory for GitHub Pages deployment.
 * Generates a .nojekyll file (bypasses Jekyll processing) and verifies all files exist.
 * Run with: node scripts/deploy-github-pages.mjs
 * Then: git add . && git commit -m "Deploy" && git push origin main
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function run() {
  if (!fs.existsSync(OUTPUT)) {
    log("ERROR: output/ directory not found. Run asset-builder.mjs first.");
    process.exit(1);
  }

  // 1. Create .nojekyll to bypass Jekyll processing on GitHub Pages
  fs.writeFileSync(path.join(OUTPUT, ".nojekyll"), "");
  log("Created .nojekyll (bypasses Jekyll processing)");

  // 2. Verify all HTML files exist
  const files = walk(OUTPUT);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  log(`Found ${htmlFiles.length} HTML files in output/`);

  htmlFiles.forEach((f) => {
    const rel = path.relative(OUTPUT, f);
    log(`  - ${rel}`);
  });

  // 3. Check for index.html at root
  if (!fs.existsSync(path.join(OUTPUT, "index.html"))) {
    log("WARNING: No index.html at output/ root. GitHub Pages needs a root index.html.");
  } else {
    log("Root index.html found — GitHub Pages will serve it as homepage.");
  }

  // 4. Check sitemap and robots
  if (fs.existsSync(path.join(OUTPUT, "sitemap.xml"))) {
    log("sitemap.xml found — SEO ready.");
  }
  if (fs.existsSync(path.join(OUTPUT, "robots.txt"))) {
    log("robots.txt found — crawler instructions ready.");
  }

  log("");
  log("=== DEPLOY PREPARATION COMPLETE ===");
  log("Next steps:");
  log("  1. cd output/");
  log("  2. git init");
  log("  3. git add .");
  log("  4. git commit -m \"Deploy wealth lab micro-tools\"");
  log("  5. git remote add origin https://github.com/YOURUSERNAME/wealth-lab.git");
  log("  6. git push -u origin main");
  log("  7. Enable GitHub Pages in repo Settings -> Pages");
  log("==================================");
}

run();
