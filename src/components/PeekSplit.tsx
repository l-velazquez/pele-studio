import { useRef, type ReactNode } from 'react'

const MIN = 0.15
const MAX = 0.75
const clamp = (f: number) => Math.min(MAX, Math.max(MIN, f))

/**
 * Stacks a preview pane above the code editor on phones. `size` is the preview's share of the
 * height; drag the handle between them to change it.
 */
export function PeekSplit({
  open,
  size,
  onSizeChange,
  preview,
  children,
}: {
  open: boolean
  size: number
  onSizeChange: (size: number) => void
  preview: ReactNode
  children: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startSize: number } | null>(null)

  return (
    <div ref={container} className="flex min-h-0 flex-1 flex-col">
      {open && (
        <>
          <div className="relative shrink-0" style={{ height: `${clamp(size) * 100}%` }}>
            {preview}
          </div>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize preview"
            aria-valuemin={MIN * 100}
            aria-valuemax={MAX * 100}
            aria-valuenow={Math.round(clamp(size) * 100)}
            tabIndex={0}
            className="group relative z-10 -my-2 flex h-4 shrink-0 cursor-row-resize touch-none items-center justify-center outline-none"
            onPointerDown={(e) => {
              drag.current = { startY: e.clientY, startSize: clamp(size) }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = drag.current
              const h = container.current?.clientHeight
              if (!d || !h) return
              onSizeChange(clamp(d.startSize + (e.clientY - d.startY) / h))
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') onSizeChange(clamp(size - 0.05))
              else if (e.key === 'ArrowDown') onSizeChange(clamp(size + 0.05))
            }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="relative h-1.5 w-10 rounded-full bg-zinc-300 transition-colors group-hover:bg-zinc-400 group-focus-visible:bg-indigo-500 group-active:bg-indigo-500 dark:bg-zinc-600 dark:group-hover:bg-zinc-500" />
          </div>
        </>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
