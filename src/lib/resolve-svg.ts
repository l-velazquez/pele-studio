/**
 * Turns a Pele SVG that relies on CSS custom properties into a standalone SVG
 * with literal values, so it looks identical in apps that ignore `var()`
 * (PowerPoint, Keynote, Illustrator, Inkscape, image viewers).
 *
 * Pele declares private `--_x: var(--pele-x, fallback)` properties on the root
 * element and references them throughout. We collect every declaration, layer
 * the theme's `--pele-*` values on top, substitute recursively, then evaluate
 * the `color-mix(in srgb, …)` expressions Pele uses for derived tints.
 */

const DECL_RE = /(--[\w-]+)\s*:\s*/g

/** Finds the index of the parenthesis that closes the one opened just before `start`. */
function closingParen(s: string, start: number): number {
  let depth = 1
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') depth++
    else if (ch === ')' && --depth === 0) return i
  }
  return -1
}

/** Splits on top-level commas only. */
function splitArgs(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let last = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      out.push(s.slice(last, i))
      last = i + 1
    }
  }
  out.push(s.slice(last))
  return out.map((a) => a.trim())
}

/** Reads a declaration value up to the next top-level `;` or the end of the string. */
function readValue(s: string, start: number): { value: string; end: number } {
  let depth = 0
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if ((ch === ';' || ch === '"') && depth === 0) return { value: s.slice(start, i).trim(), end: i }
  }
  return { value: s.slice(start).trim(), end: s.length }
}

/** Collects `--name: value` declarations from every style attribute. First declaration wins. */
export function collectDeclarations(svg: string): Map<string, string> {
  const decls = new Map<string, string>()
  for (const m of svg.matchAll(/style="([^"]*)"/g)) {
    const style = m[1]
    DECL_RE.lastIndex = 0
    let d: RegExpExecArray | null
    while ((d = DECL_RE.exec(style))) {
      const { value, end } = readValue(style, d.index + d[0].length)
      if (!decls.has(d[1])) decls.set(d[1], value)
      DECL_RE.lastIndex = end
    }
  }
  return decls
}

export function substituteVars(input: string, env: Map<string, string>, depth = 0): string {
  if (depth > 16 || !input.includes('var(')) return input
  let out = ''
  let i = 0
  while (i < input.length) {
    const at = input.indexOf('var(', i)
    if (at === -1) {
      out += input.slice(i)
      break
    }
    out += input.slice(i, at)
    const close = closingParen(input, at + 4)
    if (close === -1) {
      out += input.slice(at)
      break
    }
    const [name, ...rest] = splitArgs(input.slice(at + 4, close))
    const fallback = rest.length ? rest.join(',') : undefined
    const raw = env.get(name) ?? fallback ?? ''
    out += substituteVars(raw, env, depth + 1)
    i = close + 1
  }
  return out
}

type RGBA = [number, number, number, number]

const NAMED: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: '#00000000',
}

export function parseColor(input: string): RGBA | null {
  const s = (NAMED[input.trim().toLowerCase()] ?? input).trim()
  let m = /^#([0-9a-f]{3,8})$/i.exec(s)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    const n = (o: number) => parseInt(h.slice(o, o + 2), 16)
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1]
  }
  m = /^rgba?\(([^)]*)\)$/i.exec(s)
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const ch = (p: string) => (p.endsWith('%') ? (parseFloat(p) * 255) / 100 : parseFloat(p))
    const a = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])
    return [ch(parts[0]), ch(parts[1]), ch(parts[2]), a]
  }
  return null
}

export function formatColor([r, g, b, a]: RGBA): string {
  const hex = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')
  const base = `#${hex(r)}${hex(g)}${hex(b)}`
  return a >= 0.999 ? base : base + hex(a * 255)
}

/** Evaluates `color-mix(in srgb, A p%, B q%)` with literal colors, per CSS Color 5. */
function evalColorMix(args: string[]): string | null {
  if (args.length !== 3 || !/^in\s+srgb$/i.test(args[0])) return null
  const parse = (arg: string) => {
    const m = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(arg.trim())!
    return { color: parseColor(m[1]), pct: m[2] === undefined ? undefined : parseFloat(m[2]) / 100 }
  }
  const a = parse(args[1])
  const b = parse(args[2])
  if (!a.color || !b.color) return null
  let p1 = a.pct
  let p2 = b.pct
  if (p1 === undefined && p2 === undefined) p1 = p2 = 0.5
  else if (p1 === undefined) p1 = 1 - p2!
  else if (p2 === undefined) p2 = 1 - p1
  const sum = p1 + p2!
  if (sum <= 0) return null
  const w1 = p1 / sum
  const w2 = p2! / sum
  const alphaScale = Math.min(sum, 1)
  const [r1, g1, b1, a1] = a.color
  const [r2, g2, b2, a2] = b.color
  // Premultiplied interpolation.
  const alpha = a1 * w1 + a2 * w2
  if (alpha === 0) return formatColor([0, 0, 0, 0])
  const mix = (c1: number, c2: number) => (c1 * a1 * w1 + c2 * a2 * w2) / alpha
  return formatColor([mix(r1, r2), mix(g1, g2), mix(b1, b2), alpha * alphaScale])
}

export function resolveColorMix(input: string): string {
  let s = input
  for (let guard = 0; guard < 64; guard++) {
    // Innermost color-mix first: the last occurrence never contains another.
    const at = s.lastIndexOf('color-mix(')
    if (at === -1) break
    const close = closingParen(s, at + 10)
    if (close === -1) break
    const value = evalColorMix(splitArgs(s.slice(at + 10, close)))
    if (value === null) break
    s = s.slice(0, at) + value + s.slice(close + 1)
  }
  return s
}

/** Removes custom-property declarations from style attributes and drops empty ones. */
function stripDeclarations(svg: string): string {
  return svg.replace(/\sstyle="([^"]*)"/g, (_, style: string) => {
    const kept: string[] = []
    let i = 0
    while (i < style.length) {
      const { value, end } = readValue(style, i)
      if (value && !value.startsWith('--')) kept.push(value)
      i = end + 1
    }
    return kept.length ? ` style="${kept.join(';')}"` : ''
  })
}

/** SVG 1.1 renderers ignore CSS geometry properties such as `rx` inside style; hoist them to attributes. */
function hoistGeometry(svg: string): string {
  return svg.replace(/<rect\b([^>]*?)\sstyle="([^"]*)"/g, (whole, attrs: string, style: string) => {
    const m = /(?:^|;)\s*rx\s*:\s*([^;]+)/.exec(style)
    if (!m || /\srx="/.test(attrs)) return whole
    const rx = m[1].trim().replace(/px$/, '')
    const rest = style.replace(m[0], '').replace(/^;+|;+$/g, '')
    return `<rect${attrs} rx="${rx}"${rest ? ` style="${rest}"` : ''}`
  })
}

export interface ResolveOptions {
  /** Theme variables, e.g. `{ '--pele-bg': '#fff' }`. */
  vars: Record<string, string>
}

/** Applies `fn` to markup only, leaving text content (which Pele escapes) untouched. */
function mapTags(svg: string, fn: (tag: string) => string): string {
  return svg.replace(/<[^>]*>/g, fn)
}

export function resolveSvg(svg: string, { vars }: ResolveOptions): string {
  const env = collectDeclarations(svg)
  for (const [k, v] of Object.entries(vars)) env.set(k, v)
  let out = stripDeclarations(svg)
  out = mapTags(out, (tag) => resolveColorMix(substituteVars(tag, env)))
  out = hoistGeometry(out)
  return out
}
