import { Check, ExternalLink, FileUp, LayoutTemplate, MoreVertical } from 'lucide-react'
import { DropdownMenu as DM } from 'radix-ui'
import { APPEARANCES, type Appearance } from '../lib/appearance'
import { Button } from './ui'

const itemClass =
  'flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 outline-none data-highlighted:bg-zinc-100 dark:data-highlighted:bg-zinc-800'

/** Collects the header actions that don't fit on a phone into one overflow menu. */
export function MobileMenu({
  appearance,
  onAppearanceChange,
  onTemplates,
  onImport,
  repoUrl,
}: {
  appearance: Appearance
  onAppearanceChange: (a: Appearance) => void
  onTemplates: () => void
  onImport: () => void
  repoUrl: string
}) {
  return (
    <DM.Root>
      <DM.Trigger asChild>
        <Button variant="ghost" size="icon" className="size-9" aria-label="More actions">
          <MoreVertical className="size-4.5" />
        </Button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} collisionPadding={8} className="z-50 min-w-52 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl">
          <DM.Item className={itemClass} onSelect={onTemplates}>
            <LayoutTemplate className="size-4 text-zinc-500 dark:text-zinc-400" /> Templates
          </DM.Item>
          <DM.Item className={itemClass} onSelect={onImport}>
            <FileUp className="size-4 text-zinc-500 dark:text-zinc-400" /> Import file
          </DM.Item>
          <DM.Item className={itemClass} asChild>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4 text-zinc-500 dark:text-zinc-400" /> GitHub
            </a>
          </DM.Item>
          <DM.Separator className="mx-1 my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <DM.Label className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Appearance</DM.Label>
          <DM.RadioGroup value={appearance} onValueChange={(v) => onAppearanceChange(v as Appearance)}>
            {APPEARANCES.map(({ value, label, icon: Icon }) => (
              <DM.RadioItem key={value} value={value} className={itemClass}>
                <Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1">{label}</span>
                <DM.ItemIndicator>
                  <Check className="size-3.5" />
                </DM.ItemIndicator>
              </DM.RadioItem>
            ))}
          </DM.RadioGroup>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  )
}
