// design-sync landing barrel — robosystems-app's own brand surface, merged into
// the @robosystems/core bundle via cfg.extraEntries.
//
// The package-shape synth entry discovers @robosystems/core's 55 components from
// src/lib/core; this barrel adds the app's landing sections on top of the SAME
// window.RobosystemsCore.* global. Every landing section is a DEFAULT export and
// `export *` skips defaults, so we name each one here. Relative paths keep the
// barrel alias-free; the sections' own `@/…` and `next/*` imports resolve through
// esbuild's tsconfig (cfg.tsconfig → .design-sync/tsconfig.json).
//
// Scope: Phase 1 = landing / brand surface. App-distinctive views (platform,
// research, blog, graphs, open-source) need provider/data mocking → a later phase.

export { default as ApplicationsSection } from '../src/components/landing/ApplicationsSection'
export { default as ContactForm } from '../src/components/landing/ContactForm'
export { default as ContactModal } from '../src/components/landing/ContactModal'
export { default as FeaturesGrid } from '../src/components/landing/FeaturesGrid'
export { default as FinalCTA } from '../src/components/landing/FinalCTA'
export { default as FloatingElements } from '../src/components/landing/FloatingElements'
export { default as FloatingElementsVariant } from '../src/components/landing/FloatingElementsVariant'
export { default as Footer } from '../src/components/landing/Footer'
export { default as Header } from '../src/components/landing/Header'
export { default as HeroSection } from '../src/components/landing/HeroSection'
export { default as IntegrationsSection } from '../src/components/landing/IntegrationsSection'
export { default as OpenSourceSection } from '../src/components/landing/OpenSourceSection'
export { default as ProductOverview } from '../src/components/landing/ProductOverview'
export { default as SECRepositorySection } from '../src/components/landing/SECRepositorySection'
