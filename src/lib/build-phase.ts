/**
 * The content catalogs throw when the CDN cannot be read, so a page regenerating at
 * runtime keeps its last good render. At build there is no last render to keep, and a
 * throw would fail the whole build (a fork or offline build has no CDN at all), so the
 * build falls back to an empty page that the first regeneration replaces.
 */
export async function orBuildFallback<T>(
  read: Promise<T>,
  fallback: T
): Promise<T> {
  if (process.env.NEXT_PHASE !== 'phase-production-build') return read
  return read.catch((error) => {
    console.warn('Content catalog unreachable during build:', error)
    return fallback
  })
}
