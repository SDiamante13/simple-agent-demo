# Contributing

## Workshop slides

The workshop deck lives in `slides/` and is published to GitHub Pages from `docs/index.html`.

### Local editing

```bash
npm install
npm run slides:dev       # live-reload server at http://localhost:8080
```

Edit `slides/slides.md` — Chrome auto-refreshes.

### Presenting locally

```bash
npm run slides           # build + open slides/slides.html in Chrome
```

Controls in Chrome: **Arrows/Space** advance · **F** fullscreen · **P** presenter mode · **ESC** grid view.

### Publishing to GitHub Pages

The published deck is a single self-contained HTML file with every image inlined as base64. It's immune to local git state — checking out a lesson tag during a demo won't break the slides.

```bash
npm run slides:publish   # rebuilds docs/index.html
git add docs/index.html
git commit -m "Update published slides"
git push
```

Live URL: **https://sdiamante13.github.io/simple-agent-demo/**

GitHub Pages config (one-time): **Settings → Pages → Source: Deploy from a branch → Branch: `main` → Folder: `/docs`**.

### File layout

| Path                                 | Purpose                                                 |
|--------------------------------------|---------------------------------------------------------|
| `slides/slides.md`                   | Marp source (source of truth)                           |
| `slides/theme.css`                   | Light theme, `#76B4F0` accent                           |
| `slides/slides.html`                 | Local build output (gitignored from publish path)       |
| `docs/index.html`                    | Published, self-contained deck (commit this to publish) |
| `scripts/build-published-slides.mjs` | Inlines images and writes `docs/index.html`             |
| `diff-images/L{N-1}-to-L{N}/*.png`   | Per-lesson code diff PNGs                               |
| `diff-images/baseline/*.png`         | Lesson 1 starting-point file screenshots                |

### Regenerating diff images

If lesson code changes, regenerate the diff PNGs (see `scripts/prep-diffs.sh` — gitignored, local-only) and then republish:

```bash
./scripts/prep-diffs.sh
npm run slides:publish
git add diff-images/ docs/index.html && git commit && git push
```

### Day-of-workshop checklist

- Open the published URL in Chrome before the workshop
- Verify projector legibility on the actual screen
- Backup: the local `docs/index.html` also works offline (`open docs/index.html`)
