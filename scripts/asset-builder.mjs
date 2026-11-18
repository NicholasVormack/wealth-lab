/**
 * WEALTH LAB — Asset Builder
 * ==========================
 * Builds the public site from whatever is actually in output/:
 *
 *   1. Discovers every micro-tool in output/micro-tools/
 *   2. Publishes every markdown article in output/content/seo-articles/ as a real HTML page
 *   3. Regenerates the hub page (output/index.html) from the discovered inventory
 *   4. Normalizes tool/article pages: back-link to the hub, no dead footer links
 *   5. Writes sitemap.xml, robots.txt, .nojekyll and (only when a custom
 *      domain is configured) CNAME
 *
 * Nothing here is hardcoded to a list of pages, so new assets are picked up
 * automatically on the next run. Run with: node scripts/asset-builder.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveSiteUrl } from "./lib/site.mjs";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const TOOLS_DIR = path.join(OUTPUT, "micro-tools");
const ARTICLES_SRC = path.join(OUTPUT, "content/seo-articles");
const ARTICLES_OUT = path.join(OUTPUT, "articles");

const SITE_NAME = "Wealth Lab";

const CATEGORIES = [
  {
    name: "Money & investing",
    blurb: "Work out what you earn, what you keep, and what it compounds into.",
    slugs: [
      "side-hustle-calculator",
      "freelance-rate-calculator",
      "pricing-calculator",
      "investment-calculator",
      "dividend-calculator",
      "savings-goal-calculator",
      "brokerage-bonus-calculator",
      "brokerage-bonus-tracker",
      "affiliate-commission-calculator",
      "affiliate-program-comparison",
      "niche-profit-calculator",
    ],
  },
  {
    name: "SEO & content",
    blurb: "Free replacements for the paid SEO tools you would otherwise rent.",
    slugs: [
      "keyword-research-tool",
      "keyword-clusterer",
      "meta-tag-generator",
      "meta-description-analyzer",
      "headline-analyzer",
      "blog-outline-generator",
      "content-idea-generator",
      "url-slug-generator",
      "broken-link-checker",
      "youtube-thumbnail-analyzer",
      "social-image-specs",
    ],
  },
  {
    name: "Marketing & growth",
    blurb: "Capture, schedule and route an audience without a paid stack.",
    slugs: [
      "email-capture-form",
      "email-subject-tester",
      "email-platform-selector",
      "social-post-scheduler",
      "link-rotator",
      "high-ticket-affiliate-outreach",
      "ugc-portfolio-builder",
    ],
  },
  {
    name: "Business & career",
    blurb: "Package what you can do, and sell it in plain language.",
    slugs: [
      "service-offer-generator",
      "product-idea-validator",
      "resume-bullet-generator",
      "linkedin-headshot-generator",
      "slogan-generator",
    ],
  },
];

const START_HERE = [
  "side-hustle-calculator",
  "investment-calculator",
  "freelance-rate-calculator",
  "keyword-research-tool",
  "email-subject-tester",
  "savings-goal-calculator",
];

/* ---------------------------------------------------------------- helpers */

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function log(msg) {
  process.stdout.write(`[asset-builder] ${msg}\n`);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
}

function cleanTitle(raw, fallback) {
  const first = String(raw || "").split("—")[0].trim();
  return decodeEntities(first || fallback);
}

/** Relative path from a page back to output/, e.g. "../.." or ".". */
function relativeRoot(file) {
  const rel = path.relative(path.dirname(file), OUTPUT);
  return rel === "" ? "." : rel.split(path.sep).join("/");
}

function hubHref(file) {
  const rel = relativeRoot(file);
  return rel === "." ? "index.html" : `${rel}/index.html`;
}

/* ------------------------------------------------------- markdown renderer */

function inlineMd(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

/**
 * Deliberately small markdown subset: headings, paragraphs, ordered and
 * unordered lists, blockquotes, fenced code, horizontal rules and inline
 * emphasis/links/code. Enough for the generated articles, no dependency.
 */
function mdToHtml(markdown) {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let para = [];
  let listType = null;
  let inCode = false;
  let codeLines = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inlineMd(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (/^```/.test(line)) {
      flushPara();
      closeList();
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      // Article pages render their own <h1>; drop a duplicate body h1.
      if (level === 1) continue;
      out.push(`<h${level}>${inlineMd(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr />");
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      closeList();
      out.push(`<blockquote><p>${inlineMd(quote[1])}</p></blockquote>`);
      continue;
    }

    const ul = line.match(/^[-*+]\s+(.*)$/);
    if (ul) {
      flushPara();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inlineMd(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushPara();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inlineMd(ol[1])}</li>`);
      continue;
    }

    closeList();
    para.push(line.trim());
  }

  flushPara();
  closeList();
  if (inCode && codeLines.length) {
    out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}

function parseFrontmatter(raw) {
  const text = String(raw).replace(/\r\n/g, "\n");
  if (!/^---\n/.test(text)) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { meta: {}, body: text };
  const block = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n+/, "");
  const meta = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    meta[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return { meta, body };
}

/**
 * The auto-blogger filled some articles with literal placeholders like
 * "[input 1]" or "[solve specific problem]". Those pages are thin content and
 * get noindex + are kept out of the sitemap rather than shipped to Google.
 */
function findPlaceholders(html) {
  const stripped = html
    .replace(/<a [^>]*>.*?<\/a>/g, " ")
    // Brackets inside code are syntax, not an unfilled placeholder.
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code>[\s\S]*?<\/code>/gi, " ");
  const matches = stripped.match(/\[[^\]]{2,60}\]/g) || [];
  return [...new Set(matches)];
}

/* ------------------------------------------------------------- discovery */

function readPageMeta(file, fallbackTitle) {
  const html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || fallbackTitle;
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  return {
    title: cleanTitle(title, fallbackTitle),
    description: decodeEntities(desc).trim(),
  };
}

function discoverTools() {
  if (!fs.existsSync(TOOLS_DIR)) return [];
  return fs
    .readdirSync(TOOLS_DIR)
    .filter((name) => {
      const dir = path.join(TOOLS_DIR, name);
      return fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, "index.html"));
    })
    .map((slug) => {
      const file = path.join(TOOLS_DIR, slug, "index.html");
      return { slug, file, ...readPageMeta(file, slug) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function discoverArticles(siteUrl) {
  const bareHost = siteUrl.replace(/^https?:\/\//, "");
  if (!fs.existsSync(ARTICLES_SRC)) return [];
  return fs
    .readdirSync(ARTICLES_SRC)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(ARTICLES_SRC, file), "utf8"));
      const h1 = (body.match(/^#\s+(.+)$/m) || [])[1];
      // Article footers were hardcoded to a domain that never existed.
      // Rewrite them to the real Pages host at render time so this cannot drift.
      // Root-relative hrefs are also rewritten: an href="/x" resolves against
      // the domain root and 404s on a /repo/ Pages subpath.
      const html = mdToHtml(body)
        .replace(/wealth-lab\.github\.io/g, bareHost)
        .replace(/href="\/(?!\/)/g, 'href="../../');
      const placeholders = findPlaceholders(html);
      return {
        slug,
        title: decodeEntities(meta.title || h1 || slug),
        description: decodeEntities(meta.description || ""),
        date: meta.date || "",
        tags: (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
        bodyHtml: html,
        placeholders,
        draft: placeholders.length > 0,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

/* ------------------------------------------------------------ page writes */

const PAGE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(180deg, #020617 0%, #0f172a 100%); color: #e2e8f0; min-height: 100vh; padding: 32px 20px 64px; line-height: 1.65; }
  .wrap { max-width: 860px; margin: 0 auto; }
  h1 { font-size: 30px; line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 10px; }
  h2 { font-size: 20px; margin: 28px 0 10px; color: #f1f5f9; }
  h3 { font-size: 16px; margin: 22px 0 8px; color: #f1f5f9; }
  p, li { color: #cbd5e1; font-size: 15px; }
  p { margin-bottom: 14px; }
  ul, ol { margin: 0 0 16px 22px; }
  li { margin-bottom: 6px; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { background: #0f172a; border: 1px solid #334155; border-radius: 4px; padding: 1px 5px; font-size: 13px; }
  pre { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; overflow-x: auto; margin-bottom: 16px; }
  pre code { border: 0; padding: 0; }
  blockquote { border-left: 3px solid #22d3ee; padding-left: 14px; margin: 0 0 16px; color: #94a3b8; }
  hr { border: 0; border-top: 1px solid #334155; margin: 28px 0; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 22px; }
  .footer { margin-top: 44px; padding-top: 18px; border-top: 1px solid #334155; color: #64748b; font-size: 12px; text-align: center; }
`;

function articleTemplate(article, siteUrl) {
  const canonical = `${siteUrl}/articles/${article.slug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escapeHtml(article.title)} | ${SITE_NAME}</title>
<meta name="description" content="${escapeHtml(article.description)}" />
<link rel="canonical" href="${canonical}" />
${article.draft ? '<meta name="robots" content="noindex, follow" />\n' : ""}<style>${PAGE_CSS}</style>
</head>
<body>
<div class="wrap">
  <h1>${escapeHtml(article.title)}</h1>
  <p class="meta">${escapeHtml(article.date)}${article.tags.length ? " &middot; " + article.tags.slice(0, 4).map(escapeHtml).join(", ") : ""}</p>
  ${article.bodyHtml}
  <div class="footer">
    <a href="../../index.html">All tools</a> &middot;
    <a href="../../affiliate-disclosure.html">Affiliate disclosure</a> &middot;
    <a href="../../privacy-policy.html">Privacy</a>
  </div>
</div>
</body>
</html>
`;
}

/* --------------------------------------------------------------- normalize */

/**
 * Every generated tool page was emitted with a footer link to https://github.com
 * (a dead end) and no way back to the hub. Internal links are what make the
 * tool network crawlable, so normalize them idempotently on each build.
 */
/**
 * Older generators hardcoded a domain that never existed. Rewrite it to the
 * real Pages host everywhere in the built output so no page, doc or raw
 * markdown source advertises a dead URL.
 */
function sweepStaleDomain(siteUrl) {
  const bareHost = siteUrl.replace(/^https?:\/\//, "");
  const exts = new Set([".html", ".md", ".txt", ".xml", ".json", ".js", ".yml", ".csv"]);
  let changed = 0;

  const walkFiles = (dir, acc = []) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walkFiles(full, acc);
      else acc.push(full);
    }
    return acc;
  };

  for (const file of walkFiles(OUTPUT)) {
    if (!exts.has(path.extname(file))) continue;
    const src = fs.readFileSync(file, "utf8");
    if (!src.includes("wealth-lab.github.io")) continue;
    fs.writeFileSync(file, src.replace(/wealth-lab\.github\.io/g, bareHost));
    changed++;
  }
  return changed;
}

/** Canonical URL for a generated file, e.g. micro-tools/x/index.html -> <site>/micro-tools/x/ */
function canonicalFor(file, siteUrl) {
  const rel = path.relative(OUTPUT, file).split(path.sep).join("/");
  if (rel === "index.html") return `${siteUrl}/`;
  if (rel.endsWith("/index.html")) return `${siteUrl}/${rel.slice(0, -"index.html".length)}`;
  return `${siteUrl}/${rel}`;
}

function normalizePages(files, siteUrl) {
  let backLinksAdded = 0;
  let footerLinksFixed = 0;
  let canonicalsAdded = 0;
  let rootLinksFixed = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, "utf8");
    const before = html;
    const href = hubHref(file);

    if (!html.includes("wl-back")) {
      const injected = html.replace(
        /<body([^>]*)>/i,
        (m, attrs) =>
          `<body${attrs}>\n<div class="wl-back" style="max-width:860px;margin:0 auto 14px;font-size:13px;"><a href="${href}" style="color:#22d3ee;text-decoration:none;">&larr; All Wealth Lab tools</a></div>`
      );
      if (injected !== html) {
        html = injected;
        backLinksAdded++;
      }
    }

    if (html.includes('href="https://github.com" target="_blank" rel="noopener"')) {
      html = html.replace(/href="https:\/\/github\.com" target="_blank" rel="noopener"/g, `href="${href}"`);
      footerLinksFixed++;
    }

    // The hand-written tool pages shipped without a canonical, so search
    // engines had no signal that the Pages URL is authoritative.
    if (!/rel="canonical"/i.test(html)) {
      html = html.replace(
        /<\/head>/i,
        `  <link rel="canonical" href="${canonicalFor(file, siteUrl)}" />\n</head>`
      );
      canonicalsAdded++;
    }

    // Rewrite root-relative links to be relative to this page. On a Pages
    // project site, href="/x" points at the domain root and 404s.
    if (/href="\/(?!\/)/.test(html)) {
      const root = relativeRoot(file);
      const prefix = root === "." ? "" : `${root}/`;
      html = html.replace(/href="\/(?!\/)/g, () => `href="${prefix}`);
      rootLinksFixed++;
    }

    if (html !== before) fs.writeFileSync(file, html);
  }

  return { backLinksAdded, footerLinksFixed, canonicalsAdded, rootLinksFixed };
}

/* ------------------------------------------------------------------- pages */

function buildHub(tools, articles, siteUrl) {
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const used = new Set();
  const sections = [];

  const card = (tool) => {
    used.add(tool.slug);
    return `      <a class="card" href="micro-tools/${tool.slug}/index.html">
        <h3>${escapeHtml(tool.title)}</h3>
        <p>${escapeHtml(tool.description || "Free tool, no signup.")}</p>
      </a>`;
  };

  for (const cat of CATEGORIES) {
    const items = cat.slugs.map((s) => bySlug.get(s)).filter(Boolean);
    if (!items.length) continue;
    sections.push(`    <section>
      <h2>${escapeHtml(cat.name)}</h2>
      <p class="blurb">${escapeHtml(cat.blurb)}</p>
      <div class="grid">
${items.map(card).join("\n")}
      </div>
    </section>`);
  }

  const leftovers = tools.filter((t) => !used.has(t.slug) && !START_HERE.includes(t.slug));
  if (leftovers.length) {
    const items = leftovers.map((t) => {
      used.add(t.slug);
      return card(t);
    });
    sections.push(`    <section>
      <h2>Other tools</h2>
      <div class="grid">
${items.join("\n")}
      </div>
    </section>`);
  }

  const startHere = START_HERE.map((s) => bySlug.get(s)).filter(Boolean);
  const published = articles.filter((a) => !a.draft);

  const guides = published.length
    ? `    <section>
      <h2>Guides</h2>
      <p class="blurb">Long-form walkthroughs for everything the calculators assume you already know.</p>
      <ul class="guides">
${published.map((a) => `        <li><a href="articles/${a.slug}/index.html">${escapeHtml(a.title)}</a></li>`).join("\n")}
      </ul>
    </section>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${SITE_NAME} — ${tools.length} Free Tools for Money, SEO & Side Hustles</title>
<meta name="description" content="${tools.length} free browser tools for side hustle math, affiliate commissions, SEO, pricing and investing. No signup, no ads, no email required." />
<link rel="canonical" href="${siteUrl}/" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(180deg, #020617 0%, #0f172a 100%); color: #f1f5f9; min-height: 100vh; padding: 48px 20px 64px; }
  .container { max-width: 960px; margin: 0 auto; }
  header { text-align: center; margin-bottom: 24px; }
  h1 { font-size: 38px; font-weight: 800; letter-spacing: -1.2px; margin-bottom: 12px; background: linear-gradient(to right, #22d3ee, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .sub { color: #94a3b8; font-size: 16px; max-width: 620px; margin: 0 auto; line-height: 1.6; }
  .stats { display: flex; gap: 28px; justify-content: center; margin: 24px 0 44px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .stats b { color: #22d3ee; font-size: 18px; display: block; letter-spacing: 0; }
  section { margin-bottom: 44px; }
  section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #22d3ee; margin-bottom: 4px; }
  .blurb { color: #64748b; font-size: 13px; margin-bottom: 18px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .card { display: block; background: rgba(30, 41, 59, 0.55); border: 1px solid #334155; border-radius: 12px; padding: 18px; text-decoration: none; transition: transform 0.15s, border-color 0.15s; }
  .card:hover { border-color: #22d3ee; transform: translateY(-2px); }
  .card h3 { font-size: 14px; color: #f1f5f9; margin-bottom: 6px; }
  .card p { font-size: 12px; color: #94a3b8; line-height: 1.5; }
  .start .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .start .card { border-color: #164e63; background: rgba(8, 51, 68, 0.4); }
  .guides { list-style: none; columns: 2; column-gap: 24px; }
  .guides li { margin-bottom: 8px; font-size: 13px; break-inside: avoid; }
  @media (max-width: 620px) { .guides { columns: 1; } h1 { font-size: 28px; } }
  .footer { margin-top: 56px; padding-top: 24px; border-top: 1px solid #334155; color: #64748b; font-size: 12px; text-align: center; line-height: 2; }
  .footer a { color: #94a3b8; text-decoration: none; }
  .footer a:hover { color: #22d3ee; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Wealth Lab</h1>
    <p class="sub">Free browser tools for the math behind making money online. Everything runs locally in your browser — no signup, no ads, no email, no uploads.</p>
    <div class="stats">
      <div><b>${tools.length}</b> tools</div>
      <div><b>${published.length}</b> guides</div>
      <div><b>$0</b> forever</div>
    </div>
  </header>

${startHere.length ? `  <section class="start">
    <h2>Start here</h2>
    <p class="blurb">The six tools that answer the questions people actually start with.</p>
    <div class="grid">
${startHere.map(card).join("\n")}
    </div>
  </section>` : ""}

${sections.join("\n\n")}

${guides}

  <div class="footer">
    <a href="privacy-policy.html">Privacy</a> &middot;
    <a href="terms-of-service.html">Terms</a> &middot;
    <a href="affiliate-disclosure.html">Affiliate disclosure</a><br />
    Built by Wealth Lab &bull; Some outbound links are affiliate links.
  </div>
</div>
</body>
</html>
`;
  return { html, publishedCount: published.length };
}

function buildSitemap(siteUrl, tools, articles) {
  const today = new Date().toISOString().split("T")[0];
  const urls = [{ loc: "/", priority: "1.0" }];
  for (const t of tools) urls.push({ loc: `/micro-tools/${t.slug}/`, priority: "0.8" });
  for (const a of articles.filter((x) => !x.draft)) urls.push({ loc: `/articles/${a.slug}/`, priority: "0.6" });
  for (const page of ["privacy-policy.html", "terms-of-service.html", "affiliate-disclosure.html"]) {
    urls.push({ loc: `/${page}`, priority: "0.2" });
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
}

function writeCname(siteUrl) {
  const cnamePath = path.join(OUTPUT, "CNAME");
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (host.endsWith(".github.io")) {
    // A CNAME file pointing at the Pages host, or holding a placeholder
    // comment, breaks GitHub Pages custom-domain handling. Remove it.
    if (fs.existsSync(cnamePath)) {
      fs.unlinkSync(cnamePath);
      log("Removed output/CNAME (no custom domain configured)");
    }
    return;
  }
  fs.writeFileSync(cnamePath, `${host}\n`);
  log(`Wrote output/CNAME -> ${host}`);
}

/* -------------------------------------------------------------------- main */

function build() {
  ensureDir(OUTPUT);
  ensureDir(TOOLS_DIR);
  ensureDir(ARTICLES_OUT);

  const siteUrl = resolveSiteUrl();
  const tools = discoverTools();
  const articles = discoverArticles(siteUrl);

  // 1. Publish articles as real pages
  let publishedArticles = 0;
  const drafts = [];
  for (const article of articles) {
    const dir = path.join(ARTICLES_OUT, article.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), articleTemplate(article, siteUrl));
    if (article.draft) drafts.push(article);
    else publishedArticles++;
  }

  // Prune pages whose markdown source no longer exists, so a deleted article
  // stops being served instead of lingering as an orphan page.
  const liveSlugs = new Set(articles.map((a) => a.slug));
  const removedArticles = [];
  for (const name of fs.readdirSync(ARTICLES_OUT)) {
    const dir = path.join(ARTICLES_OUT, name);
    if (!fs.statSync(dir).isDirectory() || liveSlugs.has(name)) continue;
    fs.rmSync(dir, { recursive: true, force: true });
    removedArticles.push(name);
  }

  // 2. Normalize every existing HTML page for navigation and crawlability
  const allHtml = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        if (name === "go") continue; // link-cloak redirects are not pages
        walk(full);
      } else if (name.endsWith(".html")) {
        allHtml.push(full);
      }
    }
  };
  walk(OUTPUT);
  const nav = normalizePages(allHtml.filter((f) => f !== path.join(OUTPUT, "index.html")), siteUrl);

  // 3. Rewrite any stale domain left in generated docs, tools or raw sources
  const swept = sweepStaleDomain(siteUrl);

  // 4. Hub page (built after tools exist, before the sitemap)
  const hub = buildHub(tools, articles, siteUrl);
  fs.writeFileSync(path.join(OUTPUT, "index.html"), hub.html);

  // 5. Crawl + hosting files
  fs.writeFileSync(path.join(OUTPUT, "sitemap.xml"), buildSitemap(siteUrl, tools, articles));
  fs.writeFileSync(
    path.join(OUTPUT, "robots.txt"),
    // /content/ holds raw markdown sources that are also published as pages;
    // keep crawlers out of the duplicates.
    `User-agent: *\nAllow: /\nDisallow: /content/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
  fs.writeFileSync(path.join(OUTPUT, ".nojekyll"), "");
  writeCname(siteUrl);

  log(`Site URL: ${siteUrl}`);
  log(`${tools.length} micro-tools discovered`);
  log(`${publishedArticles} articles published, ${drafts.length} held back as thin/placeholder content`);
  if (removedArticles.length) log(`Pruned ${removedArticles.length} orphaned article page(s): ${removedArticles.join(", ")}`);
  if (drafts.length) {
    log(`Held back (noindex, not in sitemap): ${drafts.map((d) => d.slug).join(", ")}`);
  }
  log(`Hub page rebuilt: ${tools.length} tools + ${hub.publishedCount} guides linked`);
  log(`Nav: ${nav.backLinksAdded} back-links added, ${nav.footerLinksFixed} dead footer links fixed, ${nav.canonicalsAdded} canonicals added, ${nav.rootLinksFixed} root-relative link fixes`);
  log(`Stale domain rewritten in ${swept} file(s)`);
  log("Wrote sitemap.xml, robots.txt, .nojekyll");
  log(`Next: node scripts/verify-site.mjs to check the result`);
}

build();
