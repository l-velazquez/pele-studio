<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/icon-dark.svg">
  <img src="assets/icon.svg" width="64" height="64" alt="">
</picture>

# Pele Studio

Write Mermaid, pick a theme, export a presentation-ready diagram. Everything runs in your browser. Diagrams are never uploaded.

**Write → Preview → Customize → Export**

- **Live editor**: CodeMirror with Mermaid highlighting. Errors are underlined in place while the last valid diagram stays on screen.
- **Preview**: pan by dragging or scrolling, zoom with ⌘/Ctrl + scroll or `+`/`-`, fit with `Shift+1` or a double-click.
- **Design studio**: 12 curated themes, a "Surprise me" palette generator, per-role color pickers, eight chart-series colors, bundled fonts, and corner radius.
- **Export**: PNG at 1–4× or SVG, with theme, transparent, or custom background, adjustable padding, and copy to clipboard.
- **Templates, import, autosave**: 12 starter diagrams, `.mmd`/`.md` import (button, ⌘O, or drag and drop), and IndexedDB autosave.

Rendering, parsing, and layout come from [Pele](https://pele.run). Pele Studio is an unofficial editor built on Pele and is not affiliated with the Pele project. The Pele name and logo belong to their creator.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # export pipeline tests
npm run build    # static site in dist/
```

## How export works

The preview and the export use the same `render()` call, so what you see is what you get. The preview applies the theme through Pele's CSS variables (`--pele-bg`, `--pele-surface`, `--pele-series-1`, …), so switching themes never touches the diagram source.

Export renders the diagram again at its natural size, so the preview's zoom has no effect on the output. It then makes the SVG standalone (`src/lib/resolve-svg.ts`):

1. It substitutes every `var(--…)` with the theme value, including Pele's internal `--_x` aliases.
2. It evaluates `color-mix(in srgb, …)` to literal hex colors.
3. It moves `rx` from CSS into attributes for SVG 1.1 renderers.
4. It embeds the selected font as base64 `@font-face`.

The resulting SVG keeps its appearance in apps that don't support CSS variables. PNG export draws that SVG onto a canvas.

Apps such as PowerPoint and Illustrator ignore embedded `@font-face` and fall back to an installed font. If exact typography matters in those apps, use PNG.

## Deploy

The site is fully static, so you can serve `dist/` from any host. For Dokploy or any Docker host:

```sh
docker build -t pele-studio .
docker run -p 8080:80 pele-studio
```

## Project layout

```text
src/
  components/   DiagramEditor, DiagramPreview, ThemePanel, ExportDialog, TemplateGallery, ui
  lib/          pele.ts (render + errors), resolve-svg.ts, export.ts, storage.ts
  themes/       types.ts, presets.ts, fonts.ts, random.ts
  templates.ts
```

## License

MIT
