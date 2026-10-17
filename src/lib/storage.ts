import { get, set } from 'idb-keyval'
import type { ExportOptions } from './export'
import type { Theme } from '../themes/types'

/** Source and theme are stored separately so switching themes never touches the diagram text. */
export interface StudioDoc {
  version: 1
  title: string
  source: string
  theme: Theme
  exportOptions: ExportOptions
}

const KEY = 'pele-studio:doc'

export async function loadDoc(): Promise<StudioDoc | null> {
  try {
    const doc = await get<StudioDoc>(KEY)
    return doc?.version === 1 ? doc : null
  } catch {
    return null
  }
}

export async function saveDoc(doc: StudioDoc): Promise<void> {
  try {
    await set(KEY, doc)
  } catch {
    // Private browsing or quota errors: autosave is best effort.
  }
}

/** Accepts plain Mermaid or Markdown containing a ```mermaid fence. */
export function extractMermaid(text: string): string {
  const fence = /```mermaid[^\n]*\n([\s\S]*?)```/.exec(text)
  return (fence ? fence[1] : text).replace(/\r\n/g, '\n').trimEnd()
}
