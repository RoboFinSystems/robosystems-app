# Building with RoboSystems (core + app surface)

This project is **RoboSystems' canonical design system**: the shared `@robosystems/core`
React component library (buttons, modals, forms, layout, chat, …) **plus** robosystems-app's
own **landing / brand surface** — the composed marketing sections unique to RoboSystems. Both
are exported from `window.RobosystemsCore.*`; the Design System pane groups core under
`ui-components` / `forms` / `layout` / `chat` / … and the app sections under **`landing`**.

It is built on **Flowbite React** + **Tailwind CSS v4**, brand color **blue** (RoboSystems —
the sibling apps recolor the same core: RoboLedger violet, RoboInvestor emerald). Use core
primitives to build screens; use the `landing` sections when composing the marketing surface.

## Setup & wrapping

No provider wrapper is needed for the presentational components in this library —
they render standalone. **Styling is global CSS**: the bundle ships `styles.css`
(brand tokens, fonts, and compiled Tailwind utilities) — load it once and every
component and every utility class below is available. Dark mode follows a `dark`
class on any ancestor (`dark:` variants are defined throughout). The brand fonts
**Space Grotesk** (body/UI) and **Orbitron** (headings) are bundled and applied by
default — you do not import them.

(A few data/auth components — providers, selectors, auth forms — read React context
or fetch data and aren't meant for static composition; the presentational set below
is what you build screens from.)

## App landing surface (group `landing`)

robosystems-app's own marketing sections — composed, full-bleed, **dark by default** (they
paint their own near-black backgrounds and lean on layered blue gradients + the floating-blob
motion system). Most take **no props** — drop them in and they fill the width.

| Component (group `landing`)                    | What it is                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `HeroSection`                                  | "Financial Data, Finally Connected" — gradient hero + feature tiles |
| `Header`                                       | Fixed top nav — RoboSystems logo/wordmark, section links, sign-in   |
| `Footer`                                       | Site footer — product / applications columns, social, legal         |
| `FeaturesGrid`                                 | Platform capability grid                                            |
| `ApplicationsSection`                          | "Applications Powered by RoboSystems" — RoboLedger/RoboInvestor     |
| `SECRepositorySection`                         | SEC-repository / equity-research pitch                              |
| `IntegrationsSection`                          | "Connect & Extend" — official + build-your-own integrations         |
| `OpenSourceSection`                            | "Open Source Foundation" — self-host + why-open-source              |
| `ProductOverview`                              | Product overview band                                               |
| `FinalCTA`                                     | Closing call-to-action band                                         |
| `ContactForm`                                  | Name / email / company / message form                               |
| `ContactModal`                                 | The contact form in a modal (`isOpen`, `onClose`, `title`, …)       |
| `FloatingElements` / `FloatingElementsVariant` | Ambient brand-motion blobs (`variant`) behind sections              |

`ContactModal` takes `isOpen` / `onClose` / `title` / `description` / `formType`;
`FloatingElementsVariant` takes a `variant` (`hero`, `features`, `sec-repository`, …). The rest
render standalone.

## Styling idiom — Tailwind utilities, brand palette

Style everything with **Tailwind v4 utility classes**. There are no CSS-module class
names to import. Use the brand color families (each has the full `50 100 200 300 400
500 600 700 800 900 950` scale) as `bg-/text-/border-` utilities:

| Family        | Role                                       | Example                                                      |
| ------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `primary-*`   | brand (blue) — primary actions, accents    | `bg-primary-600`, `text-primary-600`, `hover:bg-primary-700` |
| `secondary-*` | cyan — secondary accents, chat user bubble | `bg-secondary-500`                                           |
| `accent-*`    | indigo — tertiary accents, gradients       | `text-accent-500`                                            |
| `gray-*`      | neutral text/surfaces/borders              | `text-gray-500`, `text-gray-900`, `border-gray-200`          |
| `amber-*`     | warm/warning accent                        | `bg-amber-500`                                               |

Type: `font-sans` (Space Grotesk, the default) for UI/body; `font-heading` (Orbitron)
for display headings. Standard Tailwind spacing/radius/shadow utilities apply
(`rounded-lg`, `gap-4`, `shadow`, `py-12`, …). A primary button is the canonical idiom:
`className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"`.

## Where the truth lives

- `styles.css` (and the `_ds_bundle.css` it imports) — the actual tokens and compiled
  utilities. Read it before inventing class names.
- Per component: `<Name>.d.ts` (props) and `<Name>.prompt.md` (usage), plus the preview
  card for a worked example.

## Idiomatic example

```jsx
const { StatCard, EmptyState } = window.RobosystemsCore
import { HiChartBar } from 'react-icons/hi' // the library's icon set

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">
        Dashboard
      </h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Graphs" value="12" icon={HiChartBar} />
        <StatCard label="Storage Used" value="1.2 GB" icon={HiChartBar} />
        <StatCard label="Monthly Spend" value="$3,480" icon={HiChartBar} />
      </div>
    </div>
  )
}
```

Icons are [`react-icons`](https://react-icons.github.io/react-icons/) (`react-icons/hi`
is the primary set); components that take an `icon` prop expect such a component.
