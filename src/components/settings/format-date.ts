/**
 * One date format for every settings card — "Aug 23, 2026". The core form
 * cards and the create-key dialog already render this shape; the list cards
 * used the bare locale default ("8/23/2026"), which put two formats on the
 * same page.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return 'Never'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
