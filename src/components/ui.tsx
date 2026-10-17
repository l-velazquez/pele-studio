import { X } from 'lucide-react'
import { Dialog as D, Slider as S, ToggleGroup as TG, Tooltip as T } from 'radix-ui'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
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
        variant === 'primary' && 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-700',
        variant === 'secondary' && 'border border-zinc-200 bg-white text-zinc-800 shadow-xs hover:bg-zinc-50',
        variant === 'ghost' && 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
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
        <T.Content side={side} sideOffset={6} className="z-50 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg">
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
        <D.Overlay className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-[2px]" />
        <D.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
            <div>
              <D.Title className="text-[15px] font-semibold text-zinc-900">{title}</D.Title>
              {description ? <D.Description className="mt-0.5 text-[13px] text-zinc-500">{description}</D.Description> : <D.Description />}
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
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
}) {
  return (
    <S.Root
      className="relative flex h-5 w-full touch-none items-center select-none"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    >
      <S.Track className="relative h-1 grow rounded-full bg-zinc-200">
        <S.Range className="absolute h-full rounded-full bg-zinc-900" />
      </S.Track>
      <S.Thumb
        aria-label={label}
        className="block size-4 rounded-full border border-zinc-300 bg-white shadow focus-visible:outline-2 focus-visible:outline-indigo-500"
      />
    </S.Root>
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
      className="flex rounded-lg bg-zinc-100 p-0.5"
    >
      {options.map((o) => (
        <TG.Item
          key={o.value}
          value={o.value}
          className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 data-[state=on]:bg-white data-[state=on]:text-zinc-900 data-[state=on]:shadow-sm"
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
      <h3 className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">{children}</h3>
      {action}
    </div>
  )
}
