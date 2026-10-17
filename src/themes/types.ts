export type ColorKey =
  | 'bg'
  | 'fg'
  | 'muted'
  | 'line'
  | 'surface'
  | 'surfaceAlt'
  | 'border'
  | 'accent'

export type ThemeColors = Record<ColorKey, string>

export interface Theme {
  id: string
  name: string
  /** Hint for UI chrome; does not affect the diagram. */
  dark: boolean
  colors: ThemeColors
  /** Exactly eight chart colors, mapped to --pele-series-1..8. */
  series: string[]
  font: string
  radius: number
}

export const COLOR_LABELS: Record<ColorKey, string> = {
  bg: 'Background',
  fg: 'Text',
  muted: 'Muted text',
  line: 'Lines',
  surface: 'Node fill',
  surfaceAlt: 'Alt fill',
  border: 'Borders',
  accent: 'Accent',
}

const VAR_NAMES: Record<ColorKey, string> = {
  bg: '--pele-bg',
  fg: '--pele-fg',
  muted: '--pele-muted',
  line: '--pele-line',
  surface: '--pele-surface',
  surfaceAlt: '--pele-surface-alt',
  border: '--pele-border',
  accent: '--pele-accent',
}

/** CSS custom properties understood by Pele, keyed by full property name. */
export function themeToVars(theme: Theme, fontStack: string, monoStack: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const key of Object.keys(VAR_NAMES) as ColorKey[]) vars[VAR_NAMES[key]] = theme.colors[key]
  theme.series.forEach((c, i) => (vars[`--pele-series-${i + 1}`] = c))
  vars['--pele-font'] = fontStack
  vars['--pele-font-mono'] = monoStack
  vars['--pele-radius'] = `${theme.radius}px`
  return vars
}
