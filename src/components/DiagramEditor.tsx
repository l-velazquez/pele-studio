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
  { tag: [t.keyword, t.typeName], color: 'var(--cm-keyword)', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'var(--cm-string)' },
  { tag: [t.comment, t.lineComment], color: 'var(--cm-muted)', fontStyle: 'italic' },
  { tag: [t.number], color: 'var(--cm-number)' },
  { tag: [t.operator, t.punctuation, t.arithmeticOperator], color: 'var(--cm-operator)' },
  { tag: [t.variableName, t.labelName], color: 'var(--cm-variable)' },
  { tag: [t.definitionKeyword, t.modifier], color: 'var(--cm-modifier)' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--cm-text)' },
  '.cm-content': { padding: '12px 0', caretColor: 'var(--cm-caret)' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: 'var(--cm-muted)' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 14px', minWidth: '28px' },
  '.cm-activeLine': { backgroundColor: 'var(--cm-active-line)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--cm-gutter-active)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--cm-selection) !important' },
  '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy #ef4444', textUnderlineOffset: '3px' },
  '.cm-tooltip': { borderRadius: '8px', border: '1px solid var(--cm-border)', overflow: 'hidden', backgroundColor: 'var(--cm-tooltip-bg)', color: 'var(--cm-text)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--cm-caret)' },
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
