import { forgetTextWidths } from 'pele'
import { ensureFontLoaded, fontDataUrl, getFont, MONO_STACK } from '../themes/fonts'
import { themeToVars, type Theme } from '../themes/types'
import { renderDiagram, renderKeepingSize } from './pele'
import { resolveSvg } from './resolve-svg'

export type BackgroundMode = 'theme' | 'transparent' | 'custom'

export interface ExportOptions {
  padding: number
  background: BackgroundMode
  customBackground: string
  embedFonts: boolean
}

export interface ComposedSvg {
  svg: string
  width: number
  height: number
}

interface FontEmbed {
  family: string
  dataUrl: string
  weight: string
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Wraps a resolved Pele SVG with padding, an optional background and embedded
 * fonts. Pure string work so it can be unit tested without a DOM.
 */
export function composeSvg(resolved: string, opts: { padding: number; background: string | null; fonts?: FontEmbed[] }): ComposedSvg {
  const open = /^<svg\b([^>]*)>/.exec(resolved)
  if (!open) throw new Error('Not an SVG document')
  const attrs = open[1]
  const inner = resolved.slice(open[0].length, resolved.lastIndexOf('</svg>'))
  const attr = (name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(attrs)?.[1]

  const [minX, minY, vbW, vbH] = (attr('viewBox') ?? `0 0 ${attr('width')} ${attr('height')}`).split(/[\s,]+/).map(Number)
  const p = Math.max(0, opts.padding)
  const width = Math.ceil(vbW + 2 * p)
  const height = Math.ceil(vbH + 2 * p)

  // The root carries typography and the default fill; move them onto a group.
  const style = (attr('style') ?? '')
    .split(';')
    .filter((d) => d && !/^\s*(max-width|height|width)\s*:/.test(d))
    .join(';')
  const groupAttrs = [
    `class="${escapeAttr(attr('class') ?? 'pele')}"`,
    `transform="translate(${p - minX} ${p - minY})"`,
    style && `style="${escapeAttr(style)}"`,
    attr('fill') && `fill="${attr('fill')}"`,
  ]
    .filter(Boolean)
    .join(' ')

  const fontCss = (opts.fonts ?? [])
    .map((f) => `@font-face{font-family:'${f.family}';src:url(${f.dataUrl}) format('woff2');font-weight:${f.weight};}`)
    .join('')
  const defs = fontCss ? `<defs><style>${fontCss}</style></defs>` : ''
  const bg = opts.background ? `<rect width="100%" height="100%" fill="${escapeAttr(opts.background)}"/>` : ''
  const xlink = /\sxlink:/.test(inner) ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ''
  const label = attr('aria-roledescription')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg"${xlink} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"` +
    ` role="img"${label ? ` aria-label="${escapeAttr(label)} diagram"` : ''}>` +
    defs +
    bg +
    `<g ${groupAttrs}>${inner}</g></svg>`
  return { svg, width, height }
}

export function backgroundColor(theme: Theme, opts: ExportOptions): string | null {
  if (opts.background === 'transparent') return null
  if (opts.background === 'custom') return opts.customBackground
  return theme.colors.bg
}

/** Renders the diagram fresh at its natural size (independent of preview zoom) and returns a standalone SVG. */
export async function buildExportSvg(source: string, theme: Theme, opts: ExportOptions): Promise<ComposedSvg> {
  const font = getFont(theme.font)
  await ensureFontLoaded(font)
  forgetTextWidths()
  const render = theme.keepSize ? renderKeepingSize : renderDiagram
  const outcome = render(source, { fontFamily: font.stack, fontFamilyMono: MONO_STACK, fontSize: theme.fontSize })
  if (!outcome.ok) throw new Error(outcome.error.message)

  const vars = themeToVars(theme, font.stack, MONO_STACK)
  const resolved = resolveSvg(outcome.result.svg, { vars })

  const fonts: FontEmbed[] = []
  if (opts.embedFonts) {
    if (font.family && font.url) fonts.push({ family: font.family, dataUrl: await fontDataUrl(font.url), weight: font.weight })
    const mono = getFont('mono')
    if (font.id !== 'mono' && resolved.includes(mono.family!) && mono.url) {
      fonts.push({ family: mono.family!, dataUrl: await fontDataUrl(mono.url), weight: mono.weight })
    }
  }
  return composeSvg(resolved, { padding: opts.padding, background: backgroundColor(theme, opts), fonts })
}

/** Browsers cap canvas dimensions; stay well within the common limits. */
const MAX_SIDE = 16384
const MAX_AREA = 120_000_000

export function clampScale(width: number, height: number, scale: number): number {
  let s = Math.min(scale, MAX_SIDE / width, MAX_SIDE / height)
  if (width * height * s * s > MAX_AREA) s = Math.sqrt(MAX_AREA / (width * height))
  return Math.max(0.1, s)
}

export async function rasterize(composed: ComposedSvg, scale: number): Promise<Blob> {
  const s = clampScale(composed.width, composed.height, scale)
  const url = URL.createObjectURL(new Blob([composed.svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.decoding = 'sync'
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(composed.width * s)
    canvas.height = Math.round(composed.height * s)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function svgBlob(composed: ComposedSvg): Blob {
  return new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n`, composed.svg], { type: 'image/svg+xml' })
}

export async function copyPng(blob: Blob): Promise<void> {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'diagram'
  )
}
