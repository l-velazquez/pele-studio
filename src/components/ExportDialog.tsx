import { cn } from '../lib/cn'
import { Check, Copy, Download, Loader2, Share } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  buildExportSvg,
  canShareFile,
  clampScale,
  copyPng,
  downloadBlob,
  rasterize,
  slugify,
  svgBlob,
  type BackgroundMode,
  type ComposedSvg,
  type ExportOptions,
} from '../lib/export'
import { useIsMobile } from '../lib/media'
import type { Theme } from '../themes/types'
import { Button, Modal, SectionLabel, Segmented, Slider } from './ui'

type Format = 'png' | 'svg'

function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function ExportDialog({
  open,
  onOpenChange,
  source,
  theme,
  title,
  options,
  onOptionsChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  source: string
  theme: Theme
  title: string
  options: ExportOptions
  onOptionsChange: (o: ExportOptions) => void
}) {
  const [format, setFormat] = useState<Format>('png')
  const [scale, setScale] = useState(2)
  const [composed, setComposed] = useState<ComposedSvg | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'download' | 'copy' | null>(null)
  const [copied, setCopied] = useState(false)
  const [prepared, setPrepared] = useState<{ file: File; composed: ComposedSvg; scale: number } | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) return
    let cancelled = false
    buildExportSvg(source, theme, options).then(
      (c) => !cancelled && (setComposed(c), setError(null)),
      (e: Error) => !cancelled && (setComposed(null), setError(e.message)),
    )
    return () => {
      cancelled = true
    }
  }, [open, source, theme, options])

  const previewUrl = useMemo(() => (composed ? URL.createObjectURL(new Blob([composed.svg], { type: 'image/svg+xml' })) : null), [composed])
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl])

  const filename = `${slugify(title)}.${format}`

  // iOS only allows navigator.share() shortly after the tap, so the file is built ahead of time.
  useEffect(() => {
    if (!composed || typeof navigator.canShare !== 'function') return
    let cancelled = false
    const type = format === 'svg' ? 'image/svg+xml' : 'image/png'
    const blob = format === 'svg' ? Promise.resolve(svgBlob(composed)) : rasterize(composed, scale)
    blob.then(
      (b) => {
        const file = new File([b], filename, { type })
        if (!cancelled && canShareFile(file)) setPrepared({ file, composed, scale })
      },
      () => {},
    )
    return () => {
      cancelled = true
    }
  }, [composed, format, scale, filename])
  // Only offer the file if it still matches what the dialog is showing.
  const shareFile = prepared && prepared.composed === composed && prepared.scale === scale && prepared.file.name === filename ? prepared.file : null

  const set = (patch: Partial<ExportOptions>) => onOptionsChange({ ...options, ...patch })
  const effectiveScale = composed ? clampScale(composed.width, composed.height, scale) : scale
  const outW = composed ? Math.round(composed.width * (format === 'png' ? effectiveScale : 1)) : 0
  const outH = composed ? Math.round(composed.height * (format === 'png' ? effectiveScale : 1)) : 0

  const download = async () => {
    if (!composed) return
    setBusy('download')
    try {
      downloadBlob(format === 'svg' ? svgBlob(composed) : await rasterize(composed, scale), filename)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const copy = async () => {
    if (!composed) return
    setBusy('copy')
    try {
      if (format === 'svg') await navigator.clipboard.writeText(composed.svg)
      else await copyPng(await rasterize(composed, scale))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (e) {
      setError(`Copy failed: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  const share = async () => {
    if (!shareFile) return
    try {
      await navigator.share({ files: [shareFile], title })
    } catch (e) {
      // Dismissing the share sheet rejects with AbortError; that's not a failure.
      if ((e as Error).name !== 'AbortError') setError(`Share failed: ${(e as Error).message}`)
    }
  }

  // On phones the share sheet is the natural way out (Save Image, Messages, AirDrop), so it leads.
  const shareFirst = isMobile && !!shareFile
  const shareButton = shareFile && (
    <Button variant={shareFirst ? 'primary' : 'secondary'} className="h-9 w-full" onClick={share} disabled={!!busy}>
      <Share className="size-4" />
      Share {format.toUpperCase()}
    </Button>
  )

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Export diagram" description="Rendered fresh at full quality, independent of the preview zoom." className="w-[min(94vw,860px)]">
      <div className="grid min-h-0 flex-1 grid-cols-1 max-md:overflow-y-auto md:grid-cols-[1fr_280px]">
        <div className="flex h-[34dvh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 md:h-auto md:min-h-[280px] md:rounded-bl-2xl md:p-6">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Export preview"
              className={cn('max-h-full max-w-full md:max-h-[52vh] rounded shadow-[0_1px_3px_rgba(0,0,0,.08),0_10px_30px_rgba(0,0,0,.08)]', options.background === 'transparent' && 'checker')}
            />
          ) : error ? (
            <p className="max-w-sm text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <Loader2 className="size-5 animate-spin text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        <div className="flex flex-col gap-5 border-zinc-100 dark:border-zinc-800 p-5 max-md:border-t md:overflow-y-auto md:border-l">
          <section>
            <SectionLabel>Format</SectionLabel>
            <Segmented
              label="Format"
              value={format}
              onChange={setFormat}
              options={[
                { value: 'png', label: 'PNG' },
                { value: 'svg', label: 'SVG' },
              ]}
            />
          </section>

          {format === 'png' && (
            <section>
              <SectionLabel>Resolution</SectionLabel>
              <Segmented
                label="Resolution"
                value={String(scale)}
                onChange={(v) => setScale(Number(v))}
                options={[1, 2, 3, 4].map((s) => ({ value: String(s), label: `${s}×` }))}
              />
            </section>
          )}

          <section>
            <SectionLabel>Background</SectionLabel>
            <Segmented<BackgroundMode>
              label="Background"
              value={options.background}
              onChange={(background) => set({ background })}
              options={[
                { value: 'theme', label: 'Theme' },
                { value: 'transparent', label: 'None' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
            {options.background === 'custom' && (
              <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="relative size-6 overflow-hidden rounded-md ring-1 ring-zinc-900/10 dark:ring-white/10">
                  <input type="color" value={options.customBackground} onChange={(e) => set({ customBackground: e.target.value })} className="absolute -inset-1 size-8" aria-label="Custom background" />
                </span>
                <span className="font-mono uppercase">{options.customBackground}</span>
              </label>
            )}
          </section>

          <section>
            <SectionLabel action={<span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{options.padding}px</span>}>Padding</SectionLabel>
            <Slider label="Padding" value={options.padding} min={0} max={160} step={4} onChange={(padding) => set({ padding })} />
          </section>

          <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" checked={options.embedFonts} onChange={(e) => set({ embedFonts: e.target.checked })} className="mt-0.5 accent-zinc-900 dark:accent-zinc-100" />
            <span>
              Embed fonts
              <span className="block text-zinc-400 dark:text-zinc-500">Keeps typography exact. Turn off for smaller SVGs.</span>
            </span>
          </label>

          <div className="mt-auto space-y-2 pt-2">
            <p className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="truncate font-mono">{filename}</span>
              {composed && (
                <span className="tabular-nums">
                  {outW}×{outH}
                  {format === 'svg' && ` · ${formatBytes(composed.svg.length)}`}
                </span>
              )}
            </p>
            {format === 'png' && effectiveScale < scale && <p className="text-xs text-amber-600 dark:text-amber-400">Reduced to {effectiveScale.toFixed(1)}× to stay within browser canvas limits.</p>}
            {error && composed && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            {shareFirst && shareButton}
            <div className={cn('space-y-2', shareFirst && 'grid grid-cols-2 gap-2 space-y-0')}>
              <Button variant={shareFirst ? 'secondary' : 'primary'} className="h-9 w-full" onClick={download} disabled={!composed || !!busy}>
                {busy === 'download' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {shareFirst ? 'Download' : `Download ${format.toUpperCase()}`}
              </Button>
              <Button className="h-9 w-full" onClick={copy} disabled={!composed || !!busy}>
                {copied ? <Check className="size-4 text-emerald-600 dark:text-emerald-400" /> : busy === 'copy' ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : shareFirst ? 'Copy' : format === 'png' ? 'Copy image' : 'Copy SVG code'}
              </Button>
            </div>
            {!shareFirst && shareButton}
          </div>
        </div>
      </div>
    </Modal>
  )
}
