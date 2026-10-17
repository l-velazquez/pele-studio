import interUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url'
import plexUrl from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url'
import monoUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url'
import serifUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url'
import groteskUrl from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url'
import handUrl from '@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2?url'

export interface FontDef {
  id: string
  label: string
  /** Primary family name registered via @font-face (null for system stacks). */
  family: string | null
  stack: string
  /** woff2 file embedded into exported SVGs; null means rely on system fonts. */
  url: string | null
  weight: string
}

export const FONTS: FontDef[] = [
  { id: 'inter', label: 'Inter', family: 'Inter Variable', stack: "'Inter Variable', Inter, system-ui, sans-serif", url: interUrl, weight: '100 900' },
  { id: 'plex', label: 'IBM Plex Sans', family: 'IBM Plex Sans Variable', stack: "'IBM Plex Sans Variable', 'IBM Plex Sans', system-ui, sans-serif", url: plexUrl, weight: '100 700' },
  { id: 'grotesk', label: 'Space Grotesk', family: 'Space Grotesk Variable', stack: "'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif", url: groteskUrl, weight: '300 700' },
  { id: 'serif', label: 'Source Serif', family: 'Source Serif 4 Variable', stack: "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif", url: serifUrl, weight: '200 900' },
  { id: 'mono', label: 'JetBrains Mono', family: 'JetBrains Mono Variable', stack: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace", url: monoUrl, weight: '100 800' },
  { id: 'hand', label: 'Patrick Hand', family: 'Patrick Hand', stack: "'Patrick Hand', 'Comic Sans MS', cursive", url: handUrl, weight: '400' },
  { id: 'system', label: 'System UI', family: null, stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", url: null, weight: '400' },
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
