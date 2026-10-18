import interUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url'
import plexUrl from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url'
import monoUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url'
import serifUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url'
import groteskUrl from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url'
import handUrl from '@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2?url'
import robotoUrl from '@fontsource-variable/roboto/files/roboto-latin-wght-normal.woff2?url'
import openSansUrl from '@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2?url'
import montserratUrl from '@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2?url'
import nunitoUrl from '@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url'
import dmSansUrl from '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url'
import loraUrl from '@fontsource-variable/lora/files/lora-latin-wght-normal.woff2?url'
import merriweatherUrl from '@fontsource-variable/merriweather/files/merriweather-latin-wght-normal.woff2?url'
import playfairUrl from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2?url'
import firaCodeUrl from '@fontsource-variable/fira-code/files/fira-code-latin-wght-normal.woff2?url'
import caveatUrl from '@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2?url'

export type FontCategory = 'sans' | 'serif' | 'mono' | 'hand' | 'system'

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'sans', label: 'Sans serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Monospace' },
  { id: 'hand', label: 'Handwritten' },
  { id: 'system', label: 'Classic (system)' },
]

export interface FontDef {
  id: string
  label: string
  category: FontCategory
  /** Primary family name registered via @font-face (null for system stacks). */
  family: string | null
  stack: string
  /** woff2 file embedded into exported SVGs; null means rely on system fonts. */
  url: string | null
  weight: string
}

export const FONTS: FontDef[] = [
  { id: 'inter', label: 'Inter', category: 'sans', family: 'Inter Variable', stack: "'Inter Variable', Inter, system-ui, sans-serif", url: interUrl, weight: '100 900' },
  { id: 'plex', label: 'IBM Plex Sans', category: 'sans', family: 'IBM Plex Sans Variable', stack: "'IBM Plex Sans Variable', 'IBM Plex Sans', system-ui, sans-serif", url: plexUrl, weight: '100 700' },
  { id: 'grotesk', label: 'Space Grotesk', category: 'sans', family: 'Space Grotesk Variable', stack: "'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif", url: groteskUrl, weight: '300 700' },
  { id: 'roboto', label: 'Roboto', category: 'sans', family: 'Roboto Variable', stack: "'Roboto Variable', Roboto, system-ui, sans-serif", url: robotoUrl, weight: '100 900' },
  { id: 'open-sans', label: 'Open Sans', category: 'sans', family: 'Open Sans Variable', stack: "'Open Sans Variable', 'Open Sans', system-ui, sans-serif", url: openSansUrl, weight: '300 800' },
  { id: 'montserrat', label: 'Montserrat', category: 'sans', family: 'Montserrat Variable', stack: "'Montserrat Variable', Montserrat, system-ui, sans-serif", url: montserratUrl, weight: '100 900' },
  { id: 'nunito', label: 'Nunito', category: 'sans', family: 'Nunito Variable', stack: "'Nunito Variable', Nunito, system-ui, sans-serif", url: nunitoUrl, weight: '200 1000' },
  { id: 'dm-sans', label: 'DM Sans', category: 'sans', family: 'DM Sans Variable', stack: "'DM Sans Variable', 'DM Sans', system-ui, sans-serif", url: dmSansUrl, weight: '100 1000' },
  { id: 'serif', label: 'Source Serif', category: 'serif', family: 'Source Serif 4 Variable', stack: "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif", url: serifUrl, weight: '200 900' },
  { id: 'lora', label: 'Lora', category: 'serif', family: 'Lora Variable', stack: "'Lora Variable', Lora, Georgia, serif", url: loraUrl, weight: '400 700' },
  { id: 'merriweather', label: 'Merriweather', category: 'serif', family: 'Merriweather Variable', stack: "'Merriweather Variable', Merriweather, Georgia, serif", url: merriweatherUrl, weight: '300 900' },
  { id: 'playfair', label: 'Playfair Display', category: 'serif', family: 'Playfair Display Variable', stack: "'Playfair Display Variable', 'Playfair Display', Georgia, serif", url: playfairUrl, weight: '400 900' },
  { id: 'mono', label: 'JetBrains Mono', category: 'mono', family: 'JetBrains Mono Variable', stack: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace", url: monoUrl, weight: '100 800' },
  { id: 'fira-code', label: 'Fira Code', category: 'mono', family: 'Fira Code Variable', stack: "'Fira Code Variable', 'Fira Code', ui-monospace, monospace", url: firaCodeUrl, weight: '300 700' },
  { id: 'hand', label: 'Patrick Hand', category: 'hand', family: 'Patrick Hand', stack: "'Patrick Hand', 'Comic Sans MS', cursive", url: handUrl, weight: '400' },
  { id: 'caveat', label: 'Caveat', category: 'hand', family: 'Caveat Variable', stack: "'Caveat Variable', Caveat, 'Comic Sans MS', cursive", url: caveatUrl, weight: '400 700' },
  { id: 'system', label: 'System UI', category: 'system', family: null, stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", url: null, weight: '400' },
  { id: 'arial', label: 'Arial', category: 'system', family: null, stack: "Arial, 'Helvetica Neue', Helvetica, 'Liberation Sans', sans-serif", url: null, weight: '400' },
  { id: 'helvetica', label: 'Helvetica', category: 'system', family: null, stack: "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif", url: null, weight: '400' },
  { id: 'verdana', label: 'Verdana', category: 'system', family: null, stack: "Verdana, Geneva, 'DejaVu Sans', sans-serif", url: null, weight: '400' },
  { id: 'times', label: 'Times New Roman', category: 'system', family: null, stack: "'Times New Roman', Times, 'Liberation Serif', serif", url: null, weight: '400' },
  { id: 'georgia', label: 'Georgia', category: 'system', family: null, stack: "Georgia, 'Times New Roman', 'DejaVu Serif', serif", url: null, weight: '400' },
  { id: 'courier', label: 'Courier New', category: 'system', family: null, stack: "'Courier New', Courier, 'Liberation Mono', monospace", url: null, weight: '400' },
]

export const MONO_STACK = "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"

export function getFont(id: string): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0]
}

/** Registers every bundled font with the document so canvas text measurement matches the export. */
export function registerFonts(): void {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  for (const f of FONTS) {
    if (!f.family || !f.url) continue
    const face = new FontFace(f.family, `url(${f.url}) format('woff2')`, { weight: f.weight })
    document.fonts.add(face)
  }
}

export async function ensureFontLoaded(font: FontDef): Promise<void> {
  if (!font.family || typeof document === 'undefined') return
  await Promise.all([
    document.fonts.load(`400 16px '${font.family}'`),
    document.fonts.load(`700 16px '${font.family}'`),
    document.fonts.load(`400 16px 'JetBrains Mono Variable'`),
  ])
}

const dataUrlCache = new Map<string, Promise<string>>()

export function fontDataUrl(url: string): Promise<string> {
  let p = dataUrlCache.get(url)
  if (!p) {
    p = fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]*;/, 'data:font/woff2;'))
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(blob)
          }),
      )
    dataUrlCache.set(url, p)
  }
  return p
}
