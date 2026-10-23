import { describe, expect, it } from 'vitest'
import { renderDiagram, renderKeepingSize, scaleSvg } from './pele'

const SOURCE = 'flowchart TD\n  A[Write Mermaid] --> B{Looks good?}\n  B -->|Yes| C[Done]'

describe('scaleSvg', () => {
  it('scales the viewBox and size and wraps the content', () => {
    const out = scaleSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><rect/></svg>', 0.5)
    expect(out).toEqual({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50"><g transform="scale(0.5)"><rect/></g></svg>',
      width: 100,
      height: 50,
    })
  })
})

describe('renderKeepingSize', () => {
  it('fits a larger-text layout into the default footprint', () => {
    const base = renderDiagram(SOURCE)
    const big = renderDiagram(SOURCE, { fontSize: 24 })
    const kept = renderKeepingSize(SOURCE, { fontSize: 24 })
    if (!base.ok || !big.ok || !kept.ok) throw new Error('render failed')
    expect(big.result.width).toBeGreaterThan(base.result.width)
    expect(kept.result.width).toBeLessThanOrEqual(base.result.width + 0.01)
    expect(kept.result.height).toBeLessThanOrEqual(base.result.height + 0.01)
    expect(kept.result.svg).toContain('font:24px')
    expect(kept.result.svg).toMatch(/<g transform="scale\(0\.\d+\)">/)
  })

  it('leaves default-size renders untouched', () => {
    const plain = renderDiagram(SOURCE, { fontSize: 16 })
    const kept = renderKeepingSize(SOURCE, { fontSize: 16 })
    if (!plain.ok || !kept.ok) throw new Error('render failed')
    expect(kept.result.svg).toBe(plain.result.svg)
  })
})
