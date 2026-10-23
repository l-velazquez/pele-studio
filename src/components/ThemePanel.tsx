import { cn } from '../lib/cn'
import { Check, RotateCcw, Shuffle } from 'lucide-react'
import { Select } from 'radix-ui'
import { FONT_CATEGORIES, FONTS, getFont } from '../themes/fonts'
import { PRESETS } from '../themes/presets'
import { randomTheme } from '../themes/random'
import { COLOR_LABELS, FONT_SIZE_RANGE, type ColorKey, type Theme } from '../themes/types'
import { Button, PxField, SectionLabel, Slider, Tip } from './ui'

function PresetCard({ preset, active, onSelect }: { preset: Theme; active: boolean; onSelect: () => void }) {
  const c = preset.colors
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'group relative overflow-hidden rounded-xl text-left ring-1 transition-all',
        active ? 'ring-2 ring-zinc-900 dark:ring-zinc-100' : 'ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-400 dark:hover:ring-zinc-600',
      )}
    >
      <div className="relative h-14 p-2" style={{ background: c.bg }}>
        <svg viewBox="0 0 100 40" className="h-full w-full" aria-hidden>
          <line x1="30" y1="14" x2="58" y2="14" stroke={c.line} strokeWidth="1.5" />
          <line x1="20" y1="20" x2="20" y2="28" stroke={c.line} strokeWidth="1.5" />
          <rect x="4" y="6" width="26" height="15" rx={Math.min(preset.radius / 2, 6)} fill={c.surface} stroke={c.border} />
          <rect x="58" y="6" width="26" height="15" rx={Math.min(preset.radius / 2, 6)} fill={c.surface} stroke={c.accent} strokeWidth="1.5" />
          <rect x="8" y="28" width="26" height="10" rx={Math.min(preset.radius / 2, 5)} fill={c.surfaceAlt} stroke={c.border} />
          {preset.series.slice(0, 4).map((s, i) => (
            <rect key={i} x={50 + i * 11} y={29} width="9" height="9" rx="2" fill={s} />
          ))}
        </svg>
        {active && (
          <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5">
        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{preset.name}</span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500" style={{ fontFamily: getFont(preset.font).stack }}>
          Aa
        </span>
      </div>
    </button>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800">
      <span className="relative size-6 shrink-0 overflow-hidden rounded-md ring-1 ring-zinc-900/10 dark:ring-white/10">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute -inset-1 size-8" aria-label={label} />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && onChange(e.target.value)}
        className="w-16 rounded bg-transparent font-mono text-[11px] text-zinc-500 dark:text-zinc-400 uppercase outline-none focus:text-zinc-900 dark:focus:text-zinc-100"
        aria-label={`${label} hex`}
        spellCheck={false}
        maxLength={7}
        key={value}
        defaultValue={value}
      />
    </label>
  )
}

export function ThemePanel({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  const base = PRESETS.find((p) => p.id === theme.id)
  const modified = base ? JSON.stringify(base) !== JSON.stringify(theme) : false

  const setColor = (key: ColorKey, value: string) => onChange({ ...theme, colors: { ...theme.colors, [key]: value } })
  // Font size is a reading preference more than a palette choice, so it carries across theme switches.
  const pickTheme = (t: Theme) => onChange({ ...t, fontSize: theme.fontSize })
  const setSeries = (i: number, value: string) => onChange({ ...theme, series: theme.series.map((c, j) => (j === i ? value : c)) })

  return (
    <div className="flex flex-col gap-6 p-4">
      <section>
        <SectionLabel
          action={
            <Tip label="Generate a coordinated palette">
              <Button size="sm" variant="ghost" onClick={() => pickTheme(randomTheme())} className="-mr-1.5">
                <Shuffle className="size-3.5" /> Surprise me
              </Button>
            </Tip>
          }
        >
          Theme
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <PresetCard key={p.id} preset={p} active={theme.id === p.id} onSelect={() => pickTheme(p)} />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel
          action={
            modified && base ? (
              <Button size="sm" variant="ghost" onClick={() => onChange(base)} className="-mr-1.5">
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            ) : undefined
          }
        >
          Colors
        </SectionLabel>
        <div className="grid grid-cols-1 gap-0.5">
          {(Object.keys(COLOR_LABELS) as ColorKey[]).map((k) => (
            <ColorField key={k} label={COLOR_LABELS[k]} value={theme.colors[k]} onChange={(v) => setColor(k, v)} />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Chart series</SectionLabel>
        <div className="grid grid-cols-8 gap-1.5">
          {theme.series.map((c, i) => (
            <Tip key={i} label={`Series ${i + 1} · ${c}`}>
              <span className="relative aspect-square overflow-hidden rounded-md ring-1 ring-zinc-900/10 dark:ring-white/10">
                <input type="color" value={c} onChange={(e) => setSeries(i, e.target.value)} className="absolute -inset-1 size-[calc(100%+8px)]" aria-label={`Series color ${i + 1}`} />
              </span>
            </Tip>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Typography</SectionLabel>
        <Select.Root value={theme.font} onValueChange={(font) => onChange({ ...theme, font })}>
          <Select.Trigger
            aria-label="Font"
            className="flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-[13px] shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800"
            style={{ fontFamily: getFont(theme.font).stack }}
          >
            <Select.Value />
            <Select.Icon className="text-zinc-400 dark:text-zinc-500">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content position="popper" sideOffset={4} className="z-50 w-(--radix-select-trigger-width) rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl">
              <Select.Viewport className="max-h-[min(24rem,var(--radix-select-content-available-height))]">
                {FONT_CATEGORIES.map((cat, ci) => (
                  <Select.Group key={cat.id}>
                    {ci > 0 && <Select.Separator className="mx-1 my-1 h-px bg-zinc-100 dark:bg-zinc-800" />}
                    <Select.Label className="px-2.5 pt-1.5 pb-1 text-[10px] font-medium tracking-wide text-zinc-400 dark:text-zinc-500 uppercase">{cat.label}</Select.Label>
                    {FONTS.filter((f) => f.category === cat.id).map((f) => (
                      <Select.Item
                        key={f.id}
                        value={f.id}
                        className="flex cursor-default items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] outline-none data-highlighted:bg-zinc-100 dark:data-highlighted:bg-zinc-800"
                        style={{ fontFamily: f.stack }}
                      >
                        <Select.ItemText>{f.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check className="size-3.5" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Group>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <div className="mt-3 flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs text-zinc-700 dark:text-zinc-300">Size</span>
          <Slider label="Font size" value={theme.fontSize} {...FONT_SIZE_RANGE} onChange={(fontSize) => onChange({ ...theme, fontSize })} />
          <PxField label="Font size in pixels" value={theme.fontSize} {...FONT_SIZE_RANGE} onChange={(fontSize) => onChange({ ...theme, fontSize })} />
        </div>
      </section>

      <section>
        <SectionLabel action={<span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{theme.radius}px</span>}>Corner radius</SectionLabel>
        <Slider label="Corner radius" value={theme.radius} min={0} max={24} onChange={(radius) => onChange({ ...theme, radius })} />
      </section>
    </div>
  )
}
