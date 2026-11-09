import { StringStream } from '@codemirror/language'
import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../templates'
import { diagramType, mermaidFallback, usesGrammar } from './mermaid-highlight'

/** Run the fallback tokenizer over a source, returning [text, token] pairs (whitespace and untyped tokens dropped). */
function tokenize(source: string): [string, string][] {
  const spec = (mermaidFallback as unknown as { streamParser: { startState: (n: number) => unknown; token: (s: StringStream, st: unknown) => string | null } }).streamParser
  const state = spec.startState(2)
  const out: [string, string][] = []
  for (const line of source.split('\n')) {
    const stream = new StringStream(line, 2, 2)
    while (!stream.eol()) {
      const type = spec.token(stream, state)
      if (stream.pos === stream.start) throw new Error(`tokenizer stuck on: ${line}`)
      const text = stream.current()
      if (type && text.trim()) out.push([text, type])
      stream.start = stream.pos
    }
  }
  return out
}

const has = (tokens: [string, string][], text: string, type: string) => tokens.some(([x, y]) => x === text && y === type)

describe('diagramType', () => {
  it('skips frontmatter, blank lines, and comments', () => {
    expect(diagramType('---\ntitle: x\n---\n\n%% hi\nerDiagram\n  A ||--o{ B : r')).toBe('erDiagram')
    expect(diagramType('stateDiagram-v2\n  [*] --> A')).toBe('stateDiagram-v2')
    expect(diagramType('')).toBeNull()
  })

  it('routes grammar-backed diagrams to the lezer parser', () => {
    expect(usesGrammar('flowchart LR\n  A --> B')).toBe(true)
    expect(usesGrammar('erDiagram')).toBe(false)
  })
})

describe('mermaidFallback', () => {
  it('highlights ER diagrams', () => {
    const tokens = tokenize('erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  CUSTOMER {\n    int id PK\n    string name\n  }')
    expect(has(tokens, 'erDiagram', 'typeName')).toBe(true)
    expect(has(tokens, '||--o{', 'contentSeparator')).toBe(true)
    expect(has(tokens, 'places', 'string')).toBe(true)
    expect(has(tokens, 'int', 'typeName')).toBe(true)
    expect(has(tokens, 'id', 'variableName')).toBe(true)
    expect(has(tokens, 'PK', 'modifier')).toBe(true)
  })

  it('highlights class and state connectors', () => {
    expect(has(tokenize('classDiagram\n  Shape <|-- Circle'), '<|--', 'contentSeparator')).toBe(true)
    expect(has(tokenize('classDiagram\n  A ..|> B'), '..|>', 'contentSeparator')).toBe(true)
    const state = tokenize('stateDiagram-v2\n  [*] --> Pending\n  Pending --> Paid: payment received')
    expect(has(state, '[*]', 'atom')).toBe(true)
    expect(has(state, 'payment received', 'string')).toBe(true)
  })

  it('colors class member types', () => {
    const tokens = tokenize('classDiagram\n  class Shape {\n    +String name\n    +area(int r) float\n    -List~int~ ids\n  }')
    expect(has(tokens, 'String', 'typeName')).toBe(true)
    expect(has(tokens, 'name', 'variableName')).toBe(true)
    expect(has(tokens, 'area', 'variableName')).toBe(true)
    expect(has(tokens, 'int', 'typeName')).toBe(true)
    expect(has(tokens, 'r', 'variableName')).toBe(true)
    expect(has(tokens, 'float', 'typeName')).toBe(true)
    expect(has(tokens, 'List', 'typeName')).toBe(true)
    expect(has(tokens, 'ids', 'variableName')).toBe(true)
  })

  it('highlights keywords, comments, and C4 calls', () => {
    expect(has(tokenize('gitGraph\n  commit\n  %% note'), 'commit', 'keyword')).toBe(true)
    expect(has(tokenize('gitGraph\n  %% note'), '%% note', 'lineComment')).toBe(true)
    const c4 = tokenize('C4Component\nRel(a, b, "Uses")\nUpdateRelStyle(a, b, $offsetY="-40")')
    expect(has(c4, 'Rel', 'keyword')).toBe(true)
    expect(has(c4, '$offsetY', 'attributeName')).toBe(true)
  })

  it('tokenizes every template without getting stuck', () => {
    for (const t of TEMPLATES) expect(() => tokenize(t.source)).not.toThrow()
  })
})
