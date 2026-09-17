import type { FC } from 'react'

// A link from a page in the app to the docs page that explains it. The docs wear the
// public site's chrome, so it opens in a new tab and the app keeps its place. One
// component so every page words and styles it the same way.

export const GuideLink: FC<{ href: string; label?: string }> = ({
  href,
  label = 'Read the guide',
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 whitespace-nowrap"
  >
    {label} →
  </a>
)
