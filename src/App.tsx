import { cn } from './lib/cn'
import { Code2, Download, FileUp, LayoutTemplate, Palette } from 'lucide-react'
import { forgetTextWidths } from 'pele'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DiagramEditor } from './components/DiagramEditor'
import { DiagramPreview, type PreviewDiagram } from './components/DiagramPreview'
import { ExportDialog } from './components/ExportDialog'
import { TemplateGallery } from './components/TemplateGallery'
import { ThemePanel } from './components/ThemePanel'
import { Button, Tip, TooltipProvider } from './components/ui'
import { backgroundColor, type ExportOptions } from './lib/export'
import { renderDiagram } from './lib/pele'
import { extractMermaid, loadDoc, saveDoc } from './lib/storage'
import { DEFAULT_SOURCE } from './templates'
import { ensureFontLoaded, getFont, MONO_STACK } from './themes/fonts'
import { DEFAULT_THEME } from './themes/presets'
import { themeToVars, type Theme } from './themes/types'
import logoUrl from '../assets/icon.svg'

const DEFAULT_EXPORT: ExportOptions = { padding: 32, background: 'theme', customBackground: '#ffffff', embedFonts: true }

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [title, setTitle] = useState('Untitled diagram')
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT)
  const [fontVersion, setFontVersion] = useState(0)
  const [fitKey, setFitKey] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [showDesign, setShowDesign] = useState(() => window.innerWidth >= 1100)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  /** Source text whose first successful render should re-fit the preview. */
  const pendingFit = useRef<string | null>(null)

  // Restore the last session.
  useEffect(() => {
    loadDoc().then((doc) => {
      if (doc) {
        pendingFit.current = doc.source
        setTitle(doc.title)
        setSource(doc.source)
        setTheme(doc.theme)
        setExportOptions({ ...DEFAULT_EXPORT, ...doc.exportOptions })
      }
      setLoaded(true)
    })
  }, [])

  const debouncedDoc = useDebounced({ title, source, theme, exportOptions }, 400)
  useEffect(() => {
    if (loaded) saveDoc({ version: 1, ...debouncedDoc })
  }, [debouncedDoc, loaded])

  const font = getFont(theme.font)

  // Text is measured on a canvas, so the font must be loaded before layout.
  useEffect(() => {
    let cancelled = false
    ensureFontLoaded(font).finally(() => {
      if (cancelled) return
      forgetTextWidths()
      setFontVersion((v) => v + 1)
    })
    return () => {
      cancelled = true
    }
  }, [font])

  const renderSource = useDebounced(source, 80)
  const outcome = useMemo(
    () => (fontVersion > 0 ? renderDiagram(renderSource, { fontFamily: font.stack, fontFamilyMono: MONO_STACK }) : null),
    // fontVersion invalidates cached measurements after a font finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderSource, font.stack, fontVersion],
  )

  const lastGood = useRef<PreviewDiagram | null>(null)
  if (outcome?.ok) lastGood.current = { svg: outcome.result.svg, width: outcome.result.width, height: outcome.result.height }
  const diagram = renderSource.trim() ? lastGood.current : null
  const error = outcome && !outcome.ok && renderSource.trim() ? outcome.error : null

  useEffect(() => {
    if (outcome?.ok && pendingFit.current === renderSource) {
      pendingFit.current = null
      setFitKey((k) => k + 1)
    }
  }, [outcome, renderSource])

  const vars = useMemo(() => themeToVars(theme, font.stack, MONO_STACK), [theme, font.stack])
  const background = backgroundColor(theme, exportOptions)

  const replaceSource = (text: string, name?: string) => {
    pendingFit.current = text
    setSource(text)
    if (name) setTitle(name)
  }

  const importFile = async (file: File) => {
    replaceSource(extractMermaid(await file.text()), file.name.replace(/\.(mmd|mermaid|md|txt)$/i, ''))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'e' || (e.key === 's' && !e.shiftKey)) {
        e.preventDefault()
        setExportOpen(true)
      } else if (e.key === 'o') {
        e.preventDefault()
        fileInput.current?.click()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <TooltipProvider>
      <div
        className="flex h-full flex-col"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            setDragging(true)
          }
        }}
        onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) importFile(file)
        }}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3">
          <div className="flex items-center gap-2 pr-2">
            <img src={logoUrl} alt="" className="size-6" />
            <span className="text-[13px] font-semibold tracking-tight">Pele Studio</span>
          </div>
          <div className="h-5 w-px bg-zinc-200" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-56 min-w-0 rounded-md px-2 py-1 text-[13px] text-zinc-700 outline-none hover:bg-zinc-100 focus:bg-zinc-100"
            aria-label="Diagram title"
            spellCheck={false}
          />
          <div className="flex-1" />
          <Tip label="Toggle code panel">
            <Button variant="ghost" size="icon" onClick={() => setShowCode((v) => !v)} aria-label="Code panel" aria-pressed={showCode} className={cn(showCode && 'bg-zinc-100 text-zinc-900')}>
              <Code2 className="size-4" />
            </Button>
          </Tip>
          <Tip label="Toggle design panel">
            <Button variant="ghost" size="icon" onClick={() => setShowDesign((v) => !v)} aria-label="Design panel" aria-pressed={showDesign} className={cn(showDesign && 'bg-zinc-100 text-zinc-900')}>
              <Palette className="size-4" />
            </Button>
          </Tip>
          <div className="h-5 w-px bg-zinc-200" />
          <Button onClick={() => setTemplatesOpen(true)}>
            <LayoutTemplate className="size-4" /> Templates
          </Button>
          <Tip label="Open .mmd or .md (⌘O)">
            <Button onClick={() => fileInput.current?.click()}>
              <FileUp className="size-4" /> Import
            </Button>
          </Tip>
          <Tip label="Export (⌘E)">
            <Button variant="primary" onClick={() => setExportOpen(true)} disabled={!diagram}>
              <Download className="size-4" /> Export
            </Button>
          </Tip>
          <input
            ref={fileInput}
            type="file"
            accept=".mmd,.mermaid,.md,.txt,text/plain,text/markdown"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importFile(file)
              e.target.value = ''
            }}
          />
        </header>

        <main className="flex min-h-0 flex-1">
          {showCode && (
            <aside className="flex w-[min(400px,38vw)] min-w-[280px] shrink-0 flex-col border-r border-zinc-200 bg-white">
              <div className="flex h-9 items-center justify-between border-b border-zinc-100 px-4">
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Mermaid</span>
                {outcome?.ok && <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">{outcome.result.type}</span>}
              </div>
              <div className="min-h-0 flex-1">{loaded && <DiagramEditor value={source} onChange={setSource} error={error} />}</div>
            </aside>
          )}

          <section className="min-w-0 flex-1" aria-label="Preview">
            <DiagramPreview diagram={diagram} error={error} vars={vars} padding={exportOptions.padding} background={background} fitKey={fitKey} />
          </section>

          {showDesign && (
            <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-zinc-200 bg-white" aria-label="Design">
              <ThemePanel theme={theme} onChange={setTheme} />
            </aside>
          )}
        </main>

        {dragging && (
          <div className="pointer-events-none fixed inset-3 z-50 grid place-items-center rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/80 text-sm font-medium text-indigo-700">
            Drop a .mmd or .md file to open it
          </div>
        )}

        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          source={source}
          theme={theme}
          title={title}
          options={exportOptions}
          onOptionsChange={setExportOptions}
        />
        <TemplateGallery
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          vars={vars}
          fontStack={font.stack}
          background={theme.colors.bg}
          onPick={(t) => {
            replaceSource(t.source, t.name)
            setTemplatesOpen(false)
          }}
        />
      </div>
    </TooltipProvider>
  )
}
