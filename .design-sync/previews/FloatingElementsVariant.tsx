import { FloatingElementsVariant } from '@robosystems/core'

/** Ambient brand-motion blobs (animated, blurred gradient orbs) layered behind the
 *  hero. Absolutely positioned, so they need a sized `relative` parent. */
export const Hero = () => (
  <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-black">
    <FloatingElementsVariant variant="hero" />
  </div>
)

/** The features-section tuning of the same motion system. */
export const Features = () => (
  <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-black">
    <FloatingElementsVariant variant="features" />
  </div>
)
