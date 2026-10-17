import { render } from 'pele'
import { describe, expect, it } from 'vitest'
import { clampScale, composeSvg } from './export'
import { resolveSvg } from './resolve-svg'

describe('composeSvg', () => {
  const resolved = resolveSvg(render('flowchart LR\n A --> B').svg, { vars: { '--pele-bg': '#000000' } })

  it('adds padding and a background', () => {
    const { svg, width, height } = composeSvg(resolved, { padding: 20, background: '#112233' })
    const natural = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(resolved)!
    expect(width).toBe(Math.ceil(Number(natural[1]) + 40))
    expect(height).toBe(Math.ceil(Number(natural[2]) + 40))
    expect(svg).toContain('<rect width="100%" height="100%" fill="#112233"/>')
    expect(svg).toContain('transform="translate(20 20)"')
    expect(svg).not.toContain('max-width')
  })

  it('omits the background when transparent and embeds fonts', () => {
    const { svg } = composeSvg(resolved, { padding: 0, background: null, fonts: [{ family: 'X', dataUrl: 'data:font/woff2;base64,AA', weight: '400' }] })
    expect(svg).not.toContain('height="100%"')
    expect(svg).toContain("@font-face{font-family:'X'")
    expect(new DOMParserLike(svg).ok).toBe(true)
  })
})

describe('clampScale', () => {
  it('keeps big exports within canvas limits', () => {
    expect(clampScale(100, 100, 4)).toBe(4)
    expect(clampScale(10000, 500, 4)).toBeCloseTo(1.6384)
  })
})

/** Tiny well-formedness check: tags balance. */
class DOMParserLike {
  ok: boolean
  constructor(xml: string) {
    const stack: string[] = []
    let ok = true
    for (const m of xml.matchAll(/<(\/?)([\w:-]+)[^>]*?(\/?)>/g)) {
      if (m[3]) continue
      if (m[1]) ok &&= stack.pop() === m[2]
      else stack.push(m[2])
    }
    this.ok = ok && stack.length === 0
  }
}
