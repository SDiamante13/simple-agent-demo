import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const manifestPaths = process.argv.slice(2);
const sources = manifestPaths.length ? manifestPaths : ['/tmp/diff-html/manifest.txt'];
const manifest = sources
  .flatMap((p) => readFileSync(p, 'utf8').trim().split('\n'))
  .map((line) => {
    const [pair, file, htmlPath, pngPath] = line.split('|');
    return { pair, file, htmlPath, pngPath };
  });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 300 } });
const page = await ctx.newPage();

for (const { pair, file, htmlPath, pngPath } of manifest) {
  const absPng = resolve(pngPath);
  mkdirSync(dirname(absPng), { recursive: true });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: absPng, fullPage: true });
  console.log(`${pair} ${file} → ${pngPath}`);
}

await browser.close();
