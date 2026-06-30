// Design-system shim for `next/navigation`. The static design-sync bundle has no
// Next.js App Router context, so the real hooks return null (useSearchParams,
// usePathname); a component that then calls `.get()`/string methods on them throws
// at mount and React tears down the tree (HeroSection's `openContact` effect did
// exactly this → blank card). Aliased in via .design-sync/tsconfig.json (design-sync
// build only — the real app is unaffected). Faithful, no-op stand-ins; safe supersets
// of what core (useRouter/usePathname) and landing (useSearchParams) call.

const noop = () => {}

export function useRouter() {
  return {
    push: noop,
    replace: noop,
    prefetch: noop,
    back: noop,
    forward: noop,
    refresh: noop,
  }
}

export function usePathname() {
  return '/'
}

export function useSearchParams() {
  // Real (empty) URLSearchParams → `.get()` returns null instead of throwing.
  return new URLSearchParams()
}

export function useParams() {
  return {}
}

export function useSelectedLayoutSegment() {
  return null
}

export function useSelectedLayoutSegments() {
  return []
}

export function redirect() {}
export function permanentRedirect() {}
export function notFound() {}
export const RedirectType = { push: 'push', replace: 'replace' }
