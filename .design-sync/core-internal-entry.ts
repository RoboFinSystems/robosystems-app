// Runtime bindings for core-internal components that have design cards (via
// componentSrcMap pins) but are NOT exported from @robosystems/core's public
// barrel. Under the old subtree the synthesized all-source entry exported
// them; the published package's real barrel deliberately omits them, so this
// extra entry re-exports them from their deep module paths instead.
export { ProgressiveText } from '@robosystems/core/components/console/ProgressiveText'
export { AnimatedLogo, LogoBadge } from '@robosystems/core/ui-components/Logo'
