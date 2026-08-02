// Runtime bindings for core-internal components that have design cards (via
// componentSrcMap pins) but are NOT exported from @robosystems/core's public
// barrel. Under the old subtree the synthesized all-source entry exported
// them; the published package's real barrel deliberately omits them, so this
// extra entry re-exports them from their deep module paths instead.
export { ProgressiveText } from '@robosystems/core/components/console/ProgressiveText'
export { AnimatedLogo, LogoBadge } from '@robosystems/core/ui-components/Logo'

// Added for core 0.5.x. The search/forms components from the same releases
// (SearchBar, SearchHitCard, SearchPagination, SearchResultsMeta, CategoryInput,
// TagInput, MarkdownProse) ARE in the public barrel and bind without help; these
// eight are not, so they need the same deep-path treatment as the three above.
export { SessionWarningDialog } from '@robosystems/core/auth-components/SessionWarningDialog'
export { TurnstileWidget } from '@robosystems/core/auth-components/TurnstileWidget'
export { ConsoleMarkdown } from '@robosystems/core/components/console/ConsoleMarkdown'
export { CoverageBrowser } from '@robosystems/core/research/CoverageBrowser'
export { CoverageCard } from '@robosystems/core/research/CoverageCard'
export { CoverageGrid } from '@robosystems/core/research/CoverageGrid'
export { CoverageHistory } from '@robosystems/core/research/CoverageHistory'
export { ResearchArticle } from '@robosystems/core/research/ResearchArticle'
