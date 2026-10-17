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
