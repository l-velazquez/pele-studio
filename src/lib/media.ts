import { useEffect, useState, useSyncExternalStore } from 'react'

/** Matches Tailwind's `md` breakpoint: below it the app switches to the single-pane mobile layout. */
const MOBILE_QUERY = '(max-width: 767px)'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY)

/** Below Tailwind's `lg`, both side panels together would squeeze the preview to a sliver. */
export const useFitsOnePanel = () => useMediaQuery('(max-width: 1023px)')

export interface CodePeek {
  /** Show the diagram above the editor in the mobile Code tab. */
  open: boolean
  /** Share of the panel height the preview takes. */
  size: number
}

const PEEK_KEY = 'pele-studio:code-peek'
const DEFAULT_PEEK: CodePeek = { open: true, size: 0.38 }

function readPeek(): CodePeek {
  try {
    const v = JSON.parse(localStorage.getItem(PEEK_KEY) ?? 'null')
    return { open: typeof v?.open === 'boolean' ? v.open : DEFAULT_PEEK.open, size: typeof v?.size === 'number' ? v.size : DEFAULT_PEEK.size }
  } catch {
    return DEFAULT_PEEK
  }
}

/** UI preference, so kept in localStorage alongside appearance rather than in the saved document. */
export function useCodePeek(): [CodePeek, (p: CodePeek) => void] {
  const [peek, setPeek] = useState(readPeek)
  useEffect(() => {
    try {
      localStorage.setItem(PEEK_KEY, JSON.stringify(peek))
    } catch {
      // Storage disabled: the choice lasts for this session only.
    }
  }, [peek])
  return [peek, setPeek]
}
