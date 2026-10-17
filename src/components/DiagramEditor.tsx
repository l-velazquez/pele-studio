import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { EditorView, drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { mermaid } from 'codemirror-lang-mermaid'
import { useEffect, useRef } from 'react'
import type { DiagramError } from '../lib/pele'

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.typeName], color: '#7c3aed', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: '#0f766e' },
  { tag: [t.comment, t.lineComment], color: '#a1a1aa', fontStyle: 'italic' },
  { tag: [t.number], color: '#c2410c' },
  { tag: [t.operator, t.punctuation, t.arithmeticOperator], color: '#2563eb' },
  { tag: [t.variableName, t.labelName], color: '#18181b' },
  { tag: [t.definitionKeyword, t.modifier], color: '#be185d' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: '#27272a' },
  '.cm-content': { padding: '12px 0', caretColor: '#18181b' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: '#a1a1aa' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 14px', minWidth: '28px' },
  '.cm-activeLine': { backgroundColor: '#f4f4f580' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#52525b' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: '#c7d2fe !important' },
  '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy #ef4444', textUnderlineOffset: '3px' },
  '.cm-tooltip': { borderRadius: '8px', border: '1px solid #e4e4e7', overflow: 'hidden' },
})

export function DiagramEditor({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: DiagramError | null }) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          highlightActiveLine(),
          lintGutter(),
          mermaid(),
          syntaxHighlighting(highlight),
          theme,
          placeholder('flowchart LR\n  A --> B'),
          EditorState.tabSize.of(2),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': 'Mermaid source' }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    return () => v.destroy()
    // The editor owns its document after mount; external changes sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // External replacements (templates, imports) overwrite the document.
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    const v = view.current
    if (!v) return
    const diagnostics: Diagnostic[] = []
    if (error) {
      const doc = v.state.doc
      const lineNo = Math.min(Math.max(error.line, 1), doc.lines)
      const line = doc.line(lineNo)
      const from = error.line > 0 ? Math.min(line.from + Math.max(error.column - 1, 0), line.to) : 0
      diagnostics.push({
        from,
        to: Math.max(from, error.line > 0 ? line.to : 0),
        severity: 'error',
        message: error.message,
      })
    }
    v.dispatch(setDiagnostics(v.state, diagnostics))
  }, [error])

  return <div ref={host} className="h-full min-h-0 overflow-hidden" />
}
