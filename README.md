<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/icon-dark.svg">
  <img src="assets/icon.svg" width="64" height="64" alt="">
</picture>

# Pele Studio

Create diagrams and export it.

**Try it at [pele-studio.cc](https://pele-studio.cc).**

**Write → Preview → Customize → Export**

- **Live editor**: CodeMirror with Mermaid highlighting. Errors are underlined in place while the last valid diagram stays on screen.
- **Preview**: pan by dragging or scrolling, zoom with ⌘/Ctrl + scroll or `+`/`-`, fit with `Shift+1` or a double-click.
- **Design studio**: 12 curated themes, a "Surprise me" palette generator, per-role color pickers, eight chart-series colors, bundled fonts, and corner radius.
- **Export**: PNG at 1–4× or SVG, with theme, transparent, or custom background, adjustable padding, and copy to clipboard.
- **Templates, import, autosave**: 12 starter diagrams, `.mmd`/`.md` import (button, ⌘O, or drag and drop), and IndexedDB autosave.

Rendering, parsing, and layout come from [Pele](https://pele.run). Pele Studio is an unofficial editor built on Pele and is not affiliated with the Pele project. The Pele name belongs to its creator [@kepano](https://x.com/kepano).

## About Pele

[Pele](https://pele.run) [ˈpɛlɛ] is a rendering library for diagrams and charts, compatible with the latest Mermaid syntax. Per the Pele project, it is:

- 100–500× faster than mermaid.js
- 6× smaller bundle
- No dependencies
- Easy to theme
- Responsive to device width

It was built to make Obsidian fast and cohesively designed, as an alternative to Mermaid, which its creator found too big, too slow, and too hard to theme. Pele will be the renderer in the next version of Obsidian. It's named after the Hawaiian goddess of volcanoes and fire, and it's open source under the MIT license.

## Quick start

With Docker (no Node needed):

```sh
docker compose up -d --build   # http://localhost:8080
```

With Node.js 22+:

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # export pipeline tests
npm run build    # static site in dist/
```

To host it on a server with HTTPS, behind an existing reverse proxy, on a static host, or on GitHub Pages, see [docs/self-hosting.md](docs/self-hosting.md).

## How export works

The resulting SVG keeps its appearance in apps that don't support CSS variables. PNG export draws that SVG onto a canvas.

Apps such as PowerPoint and Illustrator ignore embedded `@font-face` and fall back to an installed font. If exact typography matters in those apps, use PNG.

## Project layout

```text
src/
  components/   DiagramEditor, DiagramPreview, ThemePanel, ExportDialog, TemplateGallery, ui
  lib/          pele.ts (render + errors), resolve-svg.ts, export.ts, storage.ts
  themes/       types.ts, presets.ts, fonts.ts, random.ts
  templates.ts
```


## Disclaimer
This happen was created using the assistance of artificial intelligence. 

## License

MIT
