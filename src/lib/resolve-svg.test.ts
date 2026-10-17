import { render } from 'pele'
import { describe, expect, it } from 'vitest'
import { PRESETS } from '../themes/presets'
import { themeToVars } from '../themes/types'
import { TEMPLATES } from '../templates'
import { parseColor, resolveColorMix, resolveSvg, substituteVars } from './resolve-svg'

const vars = themeToVars(PRESETS[1], "'Inter Variable', sans-serif", 'monospace')

describe('substituteVars', () => {
  it('uses env, then fallback, recursively', () => {
    const env = new Map([
      ['--a', 'var(--b, red)'],
      ['--c', '#123456'],
    ])
    expect(substituteVars('fill:var(--a);stroke:var(--c, blue)', env)).toBe('fill:red;stroke:#123456')
    expect(substituteVars('x var(--missing, var(--c)) y', env)).toBe('x #123456 y')
  })
})

describe('color-mix', () => {
  it('mixes in srgb with percentages', () => {
    expect(resolveColorMix('color-mix(in srgb, #ffffff 50%, #000000)')).toBe('#808080')
    expect(resolveColorMix('color-mix(in srgb,#ff0000 25%,transparent)')).toBe('#ff000040')
  })
  it('parses colors', () => {
    expect(parseColor('#abc')).toEqual([170, 187, 204, 1])
    expect(parseColor('rgb(1, 2, 3)')).toEqual([1, 2, 3, 1])
  })
})

describe('resolveSvg on real diagrams', () => {
  for (const t of TEMPLATES) {
    it(`${t.id} has no unresolved CSS`, () => {
      const { svg } = render(t.source)
      const out = resolveSvg(svg, { vars })
      const tags = out.match(/<[^>]*>/g)!.join('')
      expect(tags).not.toMatch(/var\(/)
      expect(tags).not.toMatch(/color-mix\(/)
      expect(tags).not.toMatch(/--_/)
      expect(tags).not.toMatch(/style="rx:/)
      // Still well-formed XML.
      expect(out.startsWith('<svg')).toBe(true)
      expect(out.endsWith('</svg>')).toBe(true)
    })
  }

  it('leaves text content alone', () => {
    const { svg } = render('flowchart LR\n A["uses var(--x) here"]')
    expect(resolveSvg(svg, { vars })).toContain('uses var(--x) here')
  })
})
