import { PeleError, render, type RenderOptions, type RenderResult } from 'pele'

export interface DiagramError {
  message: string
  /** 1-based; 0 when unknown. */
  line: number
  column: number
  code: string
}

export type RenderOutcome = { ok: true; result: RenderResult } | { ok: false; error: DiagramError }

export function toDiagramError(err: unknown): DiagramError {
  if (err instanceof PeleError) {
    return { message: err.message, line: err.line, column: err.column, code: err.code }
  }
  return { message: err instanceof Error ? err.message : String(err), line: 0, column: 0, code: 'unknown' }
}

export function renderDiagram(source: string, options: RenderOptions = {}): RenderOutcome {
  try {
    return { ok: true, result: render(source, { idPrefix: 'd', ...options }) }
  } catch (err) {
    return { ok: false, error: toDiagramError(err) }
  }
}

/** Pele's base text size when `fontSize` is not given. */
export const PELE_FONT_SIZE = 16

/**
 * Lays the diagram out at `options.fontSize`, then scales it to fit the footprint of a
 * default-size render. Shapes still grow to fit their labels, but the diagram as a whole
 * keeps its size, so the text reads larger relative to everything else.
 */
export function renderKeepingSize(source: string, options: RenderOptions = {}): RenderOutcome {
  const outcome = renderDiagram(source, options)
  if (!outcome.ok || options.fontSize === undefined || options.fontSize === PELE_FONT_SIZE) return outcome
  const reference = renderDiagram(source, { ...options, fontSize: undefined })
  if (!reference.ok) return outcome
  const { result } = outcome
  const scale = Math.min(reference.result.width / result.width, reference.result.height / result.height)
  return { ok: true, result: { ...result, ...scaleSvg(result.svg, scale) } }
}

/** Wraps the root's content in a scale transform and resizes the root to match. */
export function scaleSvg(svg: string, scale: number): { svg: string; width: number; height: number } {
  const open = /^<svg\b[^>]*>/.exec(svg)
  const viewBox = open && /\sviewBox="([^"]*)"/.exec(open[0])
  if (!open || !viewBox) throw new Error('Expected an SVG root with a viewBox')
  const [x, y, w, h] = viewBox[1].split(/[\s,]+/).map((n) => Number(n) * scale)
  const round = (n: number) => Math.round(n * 100) / 100
  const width = round(w)
  const height = round(h)
  const root = open[0]
    .replace(viewBox[0], ` viewBox="${round(x)} ${round(y)} ${width} ${height}"`)
    .replace(/\swidth="[^"]*"/, ` width="${width}"`)
    .replace(/\sheight="[^"]*"/, ` height="${height}"`)
  const end = svg.lastIndexOf('</svg>')
  return { svg: `${root}<g transform="scale(${scale})">${svg.slice(open[0].length, end)}</g></svg>`, width, height }
}
