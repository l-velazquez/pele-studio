import { StreamLanguage, type StringStream } from '@codemirror/language'

/** Diagram keywords that `codemirror-lang-mermaid` parses with a real grammar. */
export const GRAMMAR_DIAGRAMS = new Set([
  'flowchart',
  'graph',
  'sequenceDiagram',
  'pie',
  'gantt',
  'mindmap',
  'journey',
  'requirementDiagram',
])

/** The diagram keyword: the first word after any frontmatter, blank lines, or `%%` comments. */
export function diagramType(source: string): string | null {
  let inFrontmatter = false
  let first = true
  for (const raw of source.split('\n', 200)) {
    const line = raw.trim()
    if (first && line === '---') {
      inFrontmatter = true
      first = false
      continue
    }
    first = false
    if (inFrontmatter) {
      if (line === '---') inFrontmatter = false
      continue
    }
    if (!line || line.startsWith('%%')) continue
    return line.match(/^[\w-]+/)?.[0] ?? null
  }
  return null
}

export function usesGrammar(source: string): boolean {
  const type = diagramType(source)
  return type !== null && GRAMMAR_DIAGRAMS.has(type)
}

const KEYWORDS = new Set([
  // shared
  'title', 'accTitle', 'accDescr', 'direction', 'subgraph', 'end', 'style', 'classDef', 'linkStyle', 'click', 'call', 'href',
  'TB', 'TD', 'BT', 'LR', 'RL',
  // class / state
  'class', 'namespace', 'note', 'state', 'as', 'of', 'left', 'right', 'top', 'bottom', 'over', 'cssClass', 'callback', 'link',
  // gitGraph
  'commit', 'branch', 'checkout', 'switch', 'merge', 'cherry-pick', 'id', 'tag', 'type', 'order', 'parent', 'NORMAL', 'REVERSE', 'HIGHLIGHT',
  // timeline / kanban
  'section',
  // quadrant / xychart
  'x-axis', 'y-axis', 'quadrant-1', 'quadrant-2', 'quadrant-3', 'quadrant-4', 'bar', 'line', 'horizontal', 'vertical',
  // architecture / block
  'group', 'service', 'junction', 'in', 'align', 'row', 'column', 'columns', 'block', 'space',
  // agentflow / event modeling / use case
  // radar / venn / wardley
  'axis', 'curve', 'set', 'union', 'anchor', 'component', 'evolve', 'pipeline',
  'flow', 'timeframe', 'resetframe', 'ui', 'command', 'event', 'processor', 'actor', 'systemBoundary',
])

/** Diagrams where text after `:` is a free-form label. */
const LABEL_DIAGRAMS = new Set(['erDiagram', 'stateDiagram', 'stateDiagram-v2', 'timeline'])
/** Diagrams where `[...]` holds numbers rather than a node label. */
const DATA_BRACKETS = new Set(['quadrantChart', 'xychart', 'xychart-beta', 'wardley-beta'])

// Connectors: ER cardinalities (`||--o{`), class relations (`<|--`, `*--`, `..>`), and flow arrows (`-->`, `-.->`, `==>`).
const ARROW = /^(?:<\||[|}o]{1,2}(?=[-.=])|<|\*)?(?:-\.+-|-{2,}|\.{2,}|={2,}|~{3}|->)(?:\|>|[|o][|{]|[|{]|>>|>|\*|o(?!\w)|x(?!\w))?/
const WORD = /^[A-Za-z_]\w*(?:-[A-Za-z0-9]\w*)*/

interface State {
  diagram: string | null
  frontmatter: boolean
  label: boolean
  depth: number
  lineStart: boolean
  /** Class member line: no word seen yet (a visibility marker doesn't count). */
  memberStart: boolean
  /** Class member line: just closed a method's parameter list, so a return type may follow. */
  afterParams: boolean
}

function token(stream: StringStream, state: State): string | null {
  if (stream.sol()) {
    state.label = false
    state.lineStart = true
    state.memberStart = true
    state.afterParams = false
    if (state.diagram === null && stream.match(/^---\s*$/)) {
      state.frontmatter = !state.frontmatter
      return 'meta'
    }
  }
  if (state.frontmatter) {
    stream.skipToEnd()
    return 'meta'
  }
  if (stream.eatSpace()) return null

  const lineStart = state.lineStart
  state.lineStart = false

  if (stream.match(/^%%\{.*?\}%%/)) return 'meta'
  if (stream.match('%%')) {
    stream.skipToEnd()
    return 'lineComment'
  }

  if (state.diagram === null) {
    const m = stream.match(WORD) as RegExpMatchArray | null
    if (m) {
      state.diagram = m[0]
      return 'typeName'
    }
  }
  const diagram = state.diagram ?? ''

  if (state.label) {
    if (stream.match(/^[^:]+/)) return 'string'
  }

  if (stream.match(/^"[^"]*"?/)) return 'string'
  if (stream.match(/^<<[^>\n]*>>/)) return 'modifier'
  if (stream.match('[*]')) return 'atom'
  if (stream.match(/^:::[\w-]+/)) return 'modifier'
  if (stream.match(/^@\{[^}\n]*\}?/)) return 'meta'
  if (stream.match(/^\$\w+/)) return 'attributeName'

  if (stream.match(ARROW)) return 'contentSeparator'
  if (stream.match(/^\|[^|\n]*\|/)) return 'string'

  if (!DATA_BRACKETS.has(diagram) && stream.match(/^\[[^\]\n]*\]?/)) return 'string'

  if (stream.match(/^\d{4}-\d{2}-\d{2}/) || stream.match(/^-?\d+(?:\.\d+)?(?:%|[a-z]{1,2}(?!\w))?/)) return 'number'

  const m = stream.match(WORD) as RegExpMatchArray | null
  if (m) {
    const word = m[0]
    if (diagram === 'erDiagram' && state.depth > 0) {
      if (/^(PK|FK|UK)$/.test(word)) return 'modifier'
      return lineStart ? 'typeName' : 'variableName'
    }
    if (diagram === 'classDiagram' && state.depth > 0) return classMember(stream, state)
    if (KEYWORDS.has(word)) return 'keyword'
    if (diagram.startsWith('C4') && stream.peek() === '(') return 'keyword'
    return 'variableName'
  }

  const ch = stream.next()
  if (ch === '{') {
    state.depth++
    return 'bracket'
  }
  if (ch === '}') {
    state.depth = Math.max(0, state.depth - 1)
    return 'bracket'
  }
  if (ch === ')' && diagram === 'classDiagram' && state.depth > 0) state.afterParams = true
  if (ch === '(' || ch === ')' || ch === '[' || ch === ']') return 'bracket'
  if (ch === ':') {
    if (LABEL_DIAGRAMS.has(diagram)) state.label = true
    return 'punctuation'
  }
  if (ch && /[+\-#~]/.test(ch) && (lineStart || (diagram === 'classDiagram' && state.memberStart))) return 'modifier'
  if (ch && /[$*]/.test(ch) && diagram === 'classDiagram' && state.depth > 0) return 'modifier'
  if (ch && /[,;&=]/.test(ch)) return 'punctuation'
  return null
}

/**
 * A word inside a class body: `+String name` (type then field), `+area(int r) float` (method, params, return type),
 * `List~int~ items` (generic type).
 */
function classMember(stream: StringStream, state: State): string {
  const first = state.memberStart
  state.memberStart = false
  if (stream.peek() === '(') return 'variableName'
  if (state.afterParams) {
    state.afterParams = false
    return 'typeName'
  }
  // A generic's parameter: `List~int~`.
  if (stream.string[stream.start - 1] === '~') return 'typeName'
  // The first of two words is the type: `String name`, or `int r` in a parameter list.
  const prev = stream.string.slice(0, stream.start).trimEnd()
  const leading = first || prev.endsWith('(') || prev.endsWith(',')
  if (leading && /^(?:~\w+~)?\s+[A-Za-z_]/.test(stream.string.slice(stream.pos))) return 'typeName'
  return 'variableName'
}

/** Token-level highlighting for Mermaid diagrams the lezer grammar doesn't cover (ER, class, state, git, C4, …). */
export const mermaidFallback = StreamLanguage.define<State>({
  name: 'mermaid',
  startState: () => ({ diagram: null, frontmatter: false, label: false, depth: 0, lineStart: true, memberStart: true, afterParams: false }),
  copyState: (s) => ({ ...s }),
  token,
  languageData: { commentTokens: { line: '%%' } },
})
