import { FONTS } from './fonts'
import type { Theme } from './types'

function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Generates a coordinated palette: one base hue tints the neutrals, an accent
 * sits at a harmonic offset, and series colors walk the wheel evenly.
 */
export function randomTheme(): Theme {
  const dark = Math.random() < 0.45
  const base = rand(0, 360)
  const harmony = [150, 180, 210, 120, 30][Math.floor(Math.random() * 5)]
  const accentHue = base + harmony
  const tint = rand(8, 30)
  const seriesSat = dark ? rand(60, 80) : rand(50, 70)
  const seriesLight = dark ? rand(62, 72) : rand(45, 58)
  const start = rand(0, 360)
  const series = Array.from({ length: 8 }, (_, i) => hsl(start + i * 137.5, seriesSat, seriesLight))

  const colors = dark
    ? {
        bg: hsl(base, tint, rand(7, 12)),
        fg: hsl(base, 20, 93),
        muted: hsl(base, 12, 65),
        line: hsl(accentHue, 35, 68),
        surface: hsl(base, tint + 5, 17),
        surfaceAlt: hsl(base, tint + 5, 22),
        border: hsl(base, tint, 38),
        accent: hsl(accentHue, 75, 66),
      }
    : {
        bg: hsl(base, tint, rand(97, 99.5)),
        fg: hsl(base, 25, 12),
        muted: hsl(base, 10, 42),
        line: hsl(base, 20, 30),
        surface: hsl(base, tint + 20, 93),
        surfaceAlt: hsl(accentHue, tint + 20, 92),
        border: hsl(base, tint, 70),
        accent: hsl(accentHue, 70, 42),
      }

  const fonts = FONTS.filter((f) => f.url !== null)
  return {
    id: 'custom',
    name: 'Surprise',
    dark,
    colors,
    series,
    font: fonts[Math.floor(Math.random() * fonts.length)].id,
    radius: [0, 4, 6, 8, 12, 16][Math.floor(Math.random() * 6)],
  }
}
