import { useEffect, useState } from 'react'

export type Appearance = 'light' | 'dark' | 'system'

/** Kept in localStorage (not IndexedDB) so index.html can apply it before first paint. */
const KEY = 'pele-studio:appearance'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function read(): Appearance {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function apply(appearance: Appearance) {
  const dark = appearance === 'dark' || (appearance === 'system' && media().matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useAppearance(): [Appearance, (a: Appearance) => void] {
  const [appearance, setAppearance] = useState(read)

  useEffect(() => {
    apply(appearance)
    try {
      if (appearance === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, appearance)
    } catch {
      // Storage disabled: the choice lasts for this session only.
    }
    if (appearance !== 'system') return
    const mq = media()
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [appearance])

  return [appearance, setAppearance]
}
