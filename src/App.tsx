import { cn } from './lib/cn'
import { AlertTriangle, Code2, Download, Eye, FileUp, LayoutTemplate, Palette } from 'lucide-react'
import { forgetTextWidths } from 'pele'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DiagramEditor } from './components/DiagramEditor'
import { DiagramPreview, type PreviewDiagram } from './components/DiagramPreview'
import { ExportDialog } from './components/ExportDialog'
import { MobileMenu } from './components/MobileMenu'
import { TemplateGallery } from './components/TemplateGallery'
import { ThemePanel } from './components/ThemePanel'
import { AppearanceMenu, Button, Tip, TooltipProvider } from './components/ui'
import { useAppearance } from './lib/appearance'
import { backgroundColor, type ExportOptions } from './lib/export'
import { useIsMobile } from './lib/media'
import { renderDiagram, renderKeepingSize } from './lib/pele'
import { extractMermaid, loadDoc, saveDoc } from './lib/storage'
import { DEFAULT_SOURCE } from './templates'
import { ensureFontLoaded, getFont, MONO_STACK } from './themes/fonts'
import { DEFAULT_THEME } from './themes/presets'
import { DEFAULT_FONT_SIZE, themeToVars, type Theme } from './themes/types'
import logoUrl from '../assets/icon.svg'
import logoDarkUrl from '../assets/icon-dark.svg'

const REPO_URL = 'https://github.com/l-velazquez/pele-studio'

type MobileTab = 'code' | 'preview' | 'design'

const MOBILE_TABS: { id: MobileTab; label: string; icon: typeof Code2 }[] = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'design', label: 'Design', icon: Palette },
]

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
  const [appearance, setAppearance] = useAppearance()
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
  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview')
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
        // Docs saved before font size existed lack these fields.
        setTheme({ ...doc.theme, fontSize: doc.theme.fontSize ?? DEFAULT_FONT_SIZE, keepSize: doc.theme.keepSize ?? true })
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
    () => {
      if (fontVersion === 0) return null
      const render = theme.keepSize ? renderKeepingSize : renderDiagram
      return render(renderSource, { fontFamily: font.stack, fontFamilyMono: MONO_STACK, fontSize: theme.fontSize })
    },
    // fontVersion invalidates cached measurements after a font finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderSource, font.stack, theme.fontSize, theme.keepSize, fontVersion],
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
    setMobileTab('preview')
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
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 max-md:gap-1 max-md:pr-1.5">
          <div className="flex shrink-0 items-center gap-2 pr-2 max-md:pr-0">
            <img src={logoUrl} alt="" className="size-6 dark:hidden" />
            <img src={logoDarkUrl} alt="" className="hidden size-6 dark:block" />
            <span className="text-[13px] font-semibold tracking-tight max-md:sr-only">Pele Studio</span>
          </div>
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 max-md:hidden" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-56 min-w-0 rounded-md px-2 py-1 text-[13px] text-zinc-700 dark:text-zinc-300 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 max-md:w-auto max-md:flex-1 max-md:font-medium"
            aria-label="Diagram title"
            spellCheck={false}
          />
          {isMobile ? (
            <>
              <Button variant="primary" size="icon" className="size-9 shrink-0" onClick={() => setExportOpen(true)} disabled={!diagram} aria-label="Export">
                <Download className="size-4" />
              </Button>
              <MobileMenu
                appearance={appearance}
                onAppearanceChange={setAppearance}
                onTemplates={() => setTemplatesOpen(true)}
                onImport={() => fileInput.current?.click()}
                repoUrl={REPO_URL}
              />
            </>
          ) : (
            <>
              <div className="flex-1" />
              <Tip label="View source on GitHub">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
              </Tip>
              <AppearanceMenu value={appearance} onChange={setAppearance} />
              <Tip label="Toggle code panel">
                <Button variant="ghost" size="icon" onClick={() => setShowCode((v) => !v)} aria-label="Code panel" aria-pressed={showCode} className={cn(showCode && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100')}>
                  <Code2 className="size-4" />
                </Button>
              </Tip>
              <Tip label="Toggle design panel">
                <Button variant="ghost" size="icon" onClick={() => setShowDesign((v) => !v)} aria-label="Design panel" aria-pressed={showDesign} className={cn(showDesign && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100')}>
                  <Palette className="size-4" />
                </Button>
              </Tip>
              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
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
            </>
          )}
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

        <main className="relative flex min-h-0 flex-1">
          {(isMobile || showCode) && (
            <aside
              className={cn(
                'flex flex-col bg-white dark:bg-zinc-900',
                isMobile ? 'absolute inset-0 z-10' : 'w-[min(400px,38vw)] min-w-[280px] shrink-0 border-r border-zinc-200 dark:border-zinc-800',
                isMobile && mobileTab !== 'code' && 'hidden',
              )}
            >
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4">
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Mermaid</span>
                {outcome?.ok && <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{outcome.result.type}</span>}
              </div>
              <div className="min-h-0 flex-1">{loaded && <DiagramEditor value={source} onChange={setSource} error={error} />}</div>
              {isMobile && error && (
                <div role="alert" className="flex shrink-0 items-start gap-2 border-t border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-2 text-xs text-red-700 dark:text-red-300">
                  <AlertTriangle className="mt-px size-3.5 shrink-0" />
                  <span className="line-clamp-2">
                    {error.line > 0 && <span className="font-medium">Line {error.line}: </span>}
                    {error.message}
                  </span>
                </div>
              )}
            </aside>
          )}

          <section className="min-w-0 flex-1" aria-label="Preview" inert={isMobile && mobileTab !== 'preview'}>
            <DiagramPreview
              diagram={diagram}
              error={error}
              vars={vars}
              padding={exportOptions.padding}
              background={background}
              fitKey={fitKey}
              emptyHint={isMobile ? 'Write Mermaid in the Code tab' : 'Start typing Mermaid on the left'}
            />
          </section>

          {(isMobile || showDesign) && (
            <aside
              className={cn(
                'overflow-y-auto bg-white dark:bg-zinc-900',
                isMobile ? 'absolute inset-0 z-10' : 'w-[300px] shrink-0 border-l border-zinc-200 dark:border-zinc-800',
                isMobile && mobileTab !== 'design' && 'hidden',
              )}
              aria-label="Design"
            >
              <div className={cn(isMobile && 'mx-auto max-w-lg')}>
                <ThemePanel theme={theme} onChange={setTheme} />
              </div>
            </aside>
          )}
        </main>

        {isMobile && (
          <nav className="flex shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-[env(safe-area-inset-bottom)]" aria-label="Panels">
            {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobileTab(id)}
                aria-current={mobileTab === id ? 'page' : undefined}
                className={cn(
                  'relative flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  mobileTab === id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400',
                )}
              >
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', mobileTab === id && 'bg-zinc-100 dark:bg-zinc-800')}>
                  <Icon className="size-4.5" />
                </span>
                {label}
                {id === 'code' && error && <span className="absolute top-2 left-[calc(50%+14px)] size-2 rounded-full bg-red-500" aria-label="Syntax error" />}
              </button>
            ))}
          </nav>
        )}

        {dragging && (
          <div className="pointer-events-none fixed inset-3 z-50 grid place-items-center rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/80 text-sm font-medium text-indigo-700 dark:text-indigo-300">
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
