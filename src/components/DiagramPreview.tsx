import { cn } from '../lib/cn'
import { AlertTriangle, Maximize, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { DiagramError } from '../lib/pele'
import { Button, Tip } from './ui'

interface View {
  scale: number
  x: number
  y: number
}

const MIN = 0.1
const MAX = 8
const clamp = (s: number) => Math.min(MAX, Math.max(MIN, s))

export interface PreviewDiagram {
  svg: string
  width: number
  height: number
}

export function DiagramPreview({
  diagram,
  error,
  vars,
  padding,
  background,
  fitKey,
}: {
  diagram: PreviewDiagram | null
  error: DiagramError | null
  vars: Record<string, string>
  padding: number
  /** null renders a transparency checkerboard. */
  background: string | null
  /** Changing this re-fits the view (new template, import). */
  fitKey: number
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const fitted = useRef<number | null>(null)

  const boardW = diagram ? diagram.width + 2 * padding : 0
  const boardH = diagram ? diagram.height + 2 * padding : 0

  const fit = useCallback(() => {
    const el = viewport.current
    if (!el || !boardW) return
    const { width, height } = el.getBoundingClientRect()
    const margin = 48
    const scale = clamp(Math.min((width - margin * 2) / boardW, (height - margin * 2) / boardH, 1.5))
    setView({ scale, x: (width - boardW * scale) / 2, y: (height - boardH * scale) / 2 })
  }, [boardW, boardH])

  // Fit on first diagram and whenever the caller asks; otherwise keep the user's view while typing.
  useLayoutEffect(() => {
    if (diagram && fitted.current !== fitKey) {
      fitted.current = fitKey
      fit()
    }
  }, [diagram, fitKey, fit])

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    const el = viewport.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = cx ?? rect.width / 2
    const py = cy ?? rect.height / 2
    setView((v) => {
      const scale = clamp(v.scale * factor)
      const k = scale / v.scale
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
    })
  }, [])

  // Native listener: React's onWheel is passive and can't prevent page zoom.
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top)
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.cm-editor, input, textarea, [role=dialog]')) return
      if (e.code === 'Digit1' && e.shiftKey) fit()
      else if (e.key === '=' || e.key === '+') zoomAt(1.2)
      else if (e.key === '-') zoomAt(1 / 1.2)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fit, zoomAt])

  const boardStyle: CSSProperties = {
    ...(vars as CSSProperties),
    width: boardW,
    height: boardH,
    padding,
    background: background ?? undefined,
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
    transformOrigin: '0 0',
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div
        ref={viewport}
        className="canvas-dots absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if (e.button !== 0 && e.button !== 1) return
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) return
          const dx = e.clientX - d.x
          const dy = e.clientY - d.y
          d.x = e.clientX
          d.y = e.clientY
          setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onDoubleClick={fit}
      >
        {diagram ? (
          <div
            className={cn('artboard absolute top-0 left-0 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_32px_rgba(0,0,0,.10)]', !background && 'checker')}
            style={boardStyle}
            dangerouslySetInnerHTML={{ __html: diagram.svg }}
          />
        ) : (
          !error && <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400 dark:text-zinc-500">Start typing Mermaid on the left</div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="absolute right-4 bottom-4 left-4 mx-auto flex max-w-xl gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-white/95 dark:bg-zinc-900/95 p-3 text-[13px] shadow-lg backdrop-blur"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-400" />
          <div className="min-w-0">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {error.line > 0 ? `Line ${error.line}: ` : ''}
              {error.code === 'unsupported-diagram' ? 'Unknown diagram type' : 'Syntax error'}
              {diagram && <span className="font-normal text-zinc-500 dark:text-zinc-400"> · showing last valid diagram</span>}
            </p>
            <pre className="mt-1 max-h-24 overflow-auto font-mono text-xs whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{error.message}</pre>
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-1 shadow-sm backdrop-blur">
        <Tip label="Zoom out (−)">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out">
            <Minus className="size-3.5" />
          </Button>
        </Tip>
        <button
          type="button"
          className="w-12 rounded-md text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 tabular-nums hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => zoomAt(1 / view.scale)}
          title="Reset to 100%"
        >
          {Math.round(view.scale * 100)}%
        </button>
        <Tip label="Zoom in (+)">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => zoomAt(1.2)} aria-label="Zoom in">
            <Plus className="size-3.5" />
          </Button>
        </Tip>
        <div className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
        <Tip label="Fit to screen (Shift+1)">
          <Button variant="ghost" size="icon" className="size-7" onClick={fit} aria-label="Fit to screen">
            <Maximize className="size-3.5" />
          </Button>
        </Tip>
      </div>
    </div>
  )
}
