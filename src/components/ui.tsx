import { Check, X } from 'lucide-react'
import { Dialog as D, DropdownMenu as DM, Slider as S, Switch as SW, ToggleGroup as TG, Tooltip as T } from 'radix-ui'
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { APPEARANCES, type Appearance } from '../lib/appearance'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'icon'

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-700 dark:hover:bg-zinc-300',
        variant === 'secondary' && 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800',
        variant === 'ghost' && 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
        size === 'sm' && 'h-7 px-2.5 text-xs',
        size === 'md' && 'h-8 px-3 text-[13px]',
        size === 'icon' && 'size-8',
        className,
      )}
      {...props}
    />
  )
}

export function Tip({ label, children, side = 'bottom' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <T.Root delayDuration={300}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={6} className="z-50 rounded-md bg-zinc-900 dark:bg-zinc-100 px-2 py-1 text-xs text-white dark:text-zinc-900 shadow-lg">
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}

export const TooltipProvider = T.Provider

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-zinc-950/30 dark:bg-black/50 backdrop-blur-[2px]" />
        <D.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800',
            className,
            // Phones get a full-width bottom sheet instead of a centered card.
            'max-md:top-auto max-md:bottom-0 max-md:max-h-[92dvh] max-md:w-full max-md:translate-y-0 max-md:rounded-b-none max-md:pb-[env(safe-area-inset-bottom)]',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
            <div>
              <D.Title className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{title}</D.Title>
              {description ? <D.Description className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">{description}</D.Description> : <D.Description />}
            </div>
            <D.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="size-4" />
              </Button>
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  mark,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
  /** Draws a tick on the track at this value, e.g. to show the default. */
  mark?: number
}) {
  const markPercent = mark === undefined ? null : ((mark - min) / (max - min)) * 100
  return (
    <S.Root
      className="relative flex h-5 w-full touch-none items-center select-none"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    >
      <S.Track className="relative h-1 grow rounded-full bg-zinc-200 dark:bg-zinc-700">
        <S.Range className="absolute h-full rounded-full bg-zinc-900 dark:bg-zinc-100" />
      </S.Track>
      {markPercent !== null && (
        <span
          aria-hidden
          title={`Default: ${mark}`}
          className="absolute h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-zinc-400 dark:bg-zinc-500"
          // Mirrors Radix's in-bounds thumb offset (half the 16px thumb) so the tick sits under the thumb at `mark`.
          style={{ left: `calc(${markPercent}% + ${8 * (1 - markPercent / 50)}px)` }}
        />
      )}
      <S.Thumb
        aria-label={label}
        className="block size-4 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow focus-visible:outline-2 focus-visible:outline-indigo-500"
      />
    </S.Root>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
      <SW.Root
        checked={checked}
        onCheckedChange={onChange}
        className="relative h-4.5 w-8 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
      >
        <SW.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform data-[state=checked]:translate-x-4" />
      </SW.Root>
    </label>
  )
}

/** Numeric input with a px suffix. Commits in-range values while typing; clamps on blur or Enter. */
export function PxField({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  label: string
}) {
  const [draft, setDraft] = useState(String(value))
  const [prev, setPrev] = useState(value)
  if (value !== prev) {
    setPrev(value)
    setDraft(String(value))
  }

  const commit = () => {
    const n = Math.round(Number(draft))
    const next = draft.trim() === '' || !Number.isFinite(n) ? value : Math.min(max, Math.max(min, n))
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  return (
    <label className="flex h-7 w-16 shrink-0 items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pr-2 shadow-xs focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value !== '' && Number.isInteger(n) && n >= min && n <= max) onChange(n)
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-full min-w-0 bg-transparent pl-2 text-right text-xs text-zinc-800 dark:text-zinc-200 tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pl-0.5 text-xs text-zinc-400 dark:text-zinc-500">px</span>
    </label>
  )
}

export function Segmented<V extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: V
  onChange: (v: V) => void
  options: { value: V; label: ReactNode }[]
  label: string
}) {
  return (
    <TG.Root
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(v) => v && onChange(v as V)}
      className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5"
    >
      {options.map((o) => (
        <TG.Item
          key={o.value}
          value={o.value}
          className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 data-[state=on]:bg-white dark:data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-900 dark:data-[state=on]:text-zinc-100 data-[state=on]:shadow-sm"
        >
          {o.label}
        </TG.Item>
      ))}
    </TG.Root>
  )
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{children}</h3>
      {action}
    </div>
  )
}

export function AppearanceMenu({ value, onChange }: { value: Appearance; onChange: (a: Appearance) => void }) {
  const Current = APPEARANCES.find((a) => a.value === value)!.icon
  return (
    <DM.Root>
      <Tip label="Appearance">
        <DM.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label="Appearance">
            <Current className="size-4" />
          </Button>
        </DM.Trigger>
      </Tip>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} className="z-50 min-w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl">
          <DM.RadioGroup value={value} onValueChange={(v) => onChange(v as Appearance)}>
            {APPEARANCES.map(({ value: v, label, icon: Icon }) => (
              <DM.RadioItem
                key={v}
                value={v}
                className="flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-zinc-700 dark:text-zinc-300 outline-none data-highlighted:bg-zinc-100 dark:data-highlighted:bg-zinc-800"
              >
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
