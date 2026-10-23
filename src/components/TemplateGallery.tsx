import { useMemo, type CSSProperties } from 'react'
import { renderDiagram } from '../lib/pele'
import { TEMPLATES, type Template } from '../templates'
import { Modal } from './ui'

export function TemplateGallery({
  open,
  onOpenChange,
  onPick,
  vars,
  fontStack,
  background,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onPick: (t: Template) => void
  vars: Record<string, string>
  fontStack: string
  background: string
}) {
  const thumbs = useMemo(
    () => (open ? TEMPLATES.map((t) => ({ t, out: renderDiagram(t.source, { fontFamily: fontStack, idPrefix: `t-${t.id}` }) })) : []),
    [open, fontStack],
  )

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Templates" description="Start from an example. This replaces the current diagram." className="w-[min(94vw,980px)]">
      <div className="grid auto-rows-max grid-cols-2 gap-3 overflow-y-auto p-5 max-sm:gap-2 max-sm:p-3 sm:grid-cols-3 lg:grid-cols-4">
        {thumbs.map(({ t, out }) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className="group overflow-hidden rounded-xl text-left ring-1 ring-zinc-200 dark:ring-zinc-800 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-zinc-400 dark:hover:ring-zinc-600"
          >
            <div
              className="thumb flex h-28 items-center sm:h-36 justify-center overflow-hidden p-3"
              style={{ ...(vars as CSSProperties), background }}
              dangerouslySetInnerHTML={{ __html: out.ok ? out.result.svg : '' }}
            />
            <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{t.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
