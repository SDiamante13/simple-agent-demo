#!/usr/bin/env node
// Builds slides.html with all referenced images inlined as base64 data URIs,
// then writes the self-contained result to docs/index.html for GitHub Pages.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const slidesMd = resolve(repoRoot, "slides/slides.md");
const slidesDir = resolve(repoRoot, "slides");
const builtHtml = resolve(repoRoot, "slides/slides.html");
const outDir = resolve(repoRoot, "docs");
const outFile = resolve(outDir, "index.html");

console.log("→ building slides via marp");
execSync("npm run slides:build", { cwd: repoRoot, stdio: "inherit" });

console.log("→ inlining images as base64");
const mimeFor = (path) => {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
};

let html = readFileSync(builtHtml, "utf8");
const seen = new Map();
let inlined = 0;

html = html.replace(/src="([^"]+\.(?:png|jpe?g|svg|gif))"/g, (match, src) => {
  if (src.startsWith("data:") || src.startsWith("http")) return match;
  if (seen.has(src)) return `src="${seen.get(src)}"`;
  const absolute = resolve(slidesDir, src);
  try {
    const data = readFileSync(absolute);
    const dataUri = `data:${mimeFor(src)};base64,${data.toString("base64")}`;
    seen.set(src, dataUri);
    inlined++;
    return `src="${dataUri}"`;
  } catch (err) {
    console.warn(`  ! could not inline ${src}: ${err.message}`);
    return match;
  }
});

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, html);

const sizeMb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(2);
console.log(`✓ inlined ${inlined} images → docs/index.html (${sizeMb} MB)`);
