import { useSyncExternalStore } from 'react'

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
