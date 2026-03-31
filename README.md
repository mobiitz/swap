# MBTC Swap Widget

This repo contains:

- a Vite site that renders the MBTC CoW Swap page
- a standalone `widget.js` bundle that other sites can embed

## Local Launch

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

By default, Vite will serve the site at:

```text
http://localhost:5173
```

## Build

Build both the website and the embeddable widget bundle:

```bash
npm run build
```

This outputs:

- site files in `dist/`
- embeddable widget script at `dist/widget.js`

## Embed Snippet

Other sites can embed the widget with:

```html
<div id="mbtc-widget"></div>

<script src="https://mobiitz.github.io/swap/widget.js"></script>
<script>
  window.createMbtcSwapWidget('#mbtc-widget', {
    width: 420,
    height: 640
  })
</script>
```

## Rebuild And Push A New `widget.js`

If you change the widget settings or widget code, rebuild and push like this:

```bash
npm run build
git status
git add .
git commit -m "Update widget bundle"
git push origin main
```

GitHub Pages will then publish the updated files from the workflow on `main`.

## GitHub Pages

The repo includes a GitHub Actions workflow for Pages deployment.

Make sure this GitHub setting is enabled:

```text
Settings -> Pages -> Source -> GitHub Actions
```

Once deployed, the site and widget script will be available at:

- `https://mobiitz.github.io/swap/`
- `https://mobiitz.github.io/swap/widget.js`
