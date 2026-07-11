# design-sync NOTES — RoboSystems (core + app landing surface)

This repo is a **Next.js app**, not a published component library. The "design system"
is the **published npm package `@robosystems/core`** (repo `RoboFinSystems/robosystems-core`),
installed at `node_modules/@robosystems/core` — compiled per-file ESM + a full `.d.ts`
tree (the git subtree at `src/lib/core` was retired 2026-07-11). The sync still runs
the package shape in **synth-entry mode**, now scanning the installed package's
compiled files. Read this before any re-sync.

This project's design project (`f0e9…`) is the **canonical home of BOTH** `@robosystems/core`
(55 components) **and** robosystems-app's own landing surface (`src/components/landing/`, 14
sections) — they ship in one bundle on `window.RobosystemsCore.*`. This is the inverse of
roboinvestor-app, which _refocused_ its project to its own landing only and dropped core (a
consumer); robosystems-app owns core, so its project keeps core and adds the app surface on top.

## Merged landing surface — how it's wired (added 2026-06-29)

Core's synth-entry + `build:types` path below is **unchanged**; landing is layered on via two
seams, so a single build emits all ~70 components:

- **`cfg.extraEntries: ["../../../.design-sync/landing-entry.ts"]`** — a barrel that re-exports
  each landing **default** export as a named export (defaults are skipped by `export *`).
  package-build merges it into the runtime global (`.bundle-entry.mjs`). Gives the 14 sections
  **runtime availability** (the cards render). Bounded to the git repo root, so it reaches
  `src/components/landing` even though `PKG_DIR` is `src/lib/core` (hence the `../../../`).
- **`cfg.componentSrcMap`** + 14 landing pins (`"HeroSection":
"../../../src/components/landing/HeroSection.tsx"`, …). Non-null pins _add_ a component to the
  card list and resolve its src path relative to `PKG_DIR`; the group derives from the path →
  group **`landing`**. Pins make the **cards**; the barrel makes them **render**.
- **`cfg.tsconfig: "../../../.design-sync/tsconfig.json"`**. One app-rooted tsconfig serves
  both: core's compiled files use only relative + bare-pkg imports, landing imports
  `@robosystems/core` directly (bare specifier → the installed package; the old `@/lib/core*`
  alias mappings were removed with the subtree) plus `@/lib/config/*` / `next/*`. It defines
  `@/*` → `src/*` and the two shims below. **Keep it clean JSON — no `//` comment keys**
  (the engine's comment-stripper mangles them).

### `[EXPORT_COLLISION]` on landing-entry.ts is BENIGN — do NOT "rename"

Build prints `! [EXPORT_COLLISION] landing-entry.ts exports 14 name(s) the main package also
exports`. False positive: the 14 names are in the barrel **and** in the pin-augmented `exported`
set (pins add them), so the gate sees them "twice." It only **warns**, never drops. Runtime
truth: validate reports `window.RobosystemsCore: 91 exports (70 fn)` — all 14 are bound. The
`__dsMainNs` Object.assign that "wins collisions" carries only the synth-main (core) namespace,
which has **no** landing keys, so it can't clobber them. Ignore the warning.

### `next/navigation` shim (required for HeroSection)

`HeroSection` calls `useSearchParams()`; in the static bundle there's no App Router context, so
it returns null and its `openContact` effect throws → blank card (`✗ [RENDER] root empty`).
`.design-sync/shims/next-navigation.tsx` returns a real empty `URLSearchParams` + no-op
`useRouter`/`usePathname` (aliased in the tsconfig). Core uses only `useRouter`/`usePathname`
(in handlers) → the shim is a safe superset; re-validate confirmed core's cards unchanged.
`next/image` is shimmed for the same render-time reason (only `HeroSection` imports it).

### Landing previews / overrides

4 authored previews (`.design-sync/previews/`): `HeroSection` (tall, `1280x1000`), `Header`
(`fixed` → black-backdrop wrap, single `1280x200`), `ContactModal` (Modal portal → single
`640x600`; trips a **benign** `[RENDER_THIN]` 0px like core's `ConfirmModal` — the dialog
paints), `FloatingElementsVariant` (`hero` + `features` variants in a framed parent,
`960x460`). The other 10 sections render their real UI from the floor card — author nicer demos
incrementally. CSS needs nothing new: the `./src/**` tailwind content glob already covers
`src/components/landing`, and the safelist ships the full brand palette.

### Deferred (Phase 2)

App-distinctive _views_ (`platform/`, `research/`, `blog/`, `graphs/`, `open-source/`) need
provider/data mocking (graph/entity/SSO contexts) → not in the barrel/pins yet. Add a
`cfg.provider` wrapper + barrel/pin entries when featuring them.

## Build setup (how the bundle is produced)

- **`PKG_DIR` = `node_modules/@robosystems/core`** — the real installed package (no
  symlink; `npm install` provides it). The package ships compiled per-file ESM (so
  the synth scan and esbuild consume `.js`) plus a full `.d.ts` tree → **prop types
  are real with no extra build step** (the old `build:types` step is retired).
- `cfg.srcDir: "."` → scan root IS the package dir.
- **No `--entry`** is passed → synth-entry mode; components discovered from
  PascalCase value exports across the package files.
- **`core-internal-entry.ts`** (in `cfg.extraEntries`): the package's real barrel
  deliberately omits three internal components with design cards (`AnimatedLogo`,
  `LogoBadge`, `ProgressiveText`); this extra entry re-exports them from their deep
  module paths so they bind on `window.RobosystemsCore` (same seam as landing).
  Their `componentSrcMap` pins are extensionless (`ui-components/Logo`) so the pin
  resolver finds the compiled `.js`.
- `--node-modules ./node_modules` (the app's — that's where react/flowbite/SDK resolve).

## CSS (the main lift — Tailwind v4, nothing static ships)

- `.design-sync/compile-css.mjs` (durable) compiles `src/app/globals.css` →
  `node_modules/@robosystems/core/.ds-compiled.css` via the app's own `@tailwindcss/postcss`,
  scanning the config's content globs (incl. `node_modules/@robosystems/core/**/*.js`), the previews dir, AND
  `.design-sync/tw-safelist.txt`. Brand tokens come from BOTH `@theme` in globals.css
  AND `theme.extend.colors` in `tailwind.config.ts`. `@font-face` is **stripped** from
  the output (fonts are wired separately — see below).
- **`tw-safelist.txt`** (durable) enumerates the full brand-color palette (primary/
  secondary/accent/gray/amber × every scale × bg/text/border/ring/from/to/via +
  hover/dark/focus) so the static `styles.css` carries the whole palette — designs the
  agent builds receive only that stylesheet, so every brand utility must be pre-generated.
  Layout/spacing utilities are component-usage-driven (broaden the safelist if needed).
- `cfg.cssEntry: ".ds-compiled.css"` (bounded to PKG_DIR; appended to `_ds_bundle.css`,
  which `styles.css` @imports → ships to designs).
- **`.ds-compiled.css` lives inside `node_modules/@robosystems/core/`** (disposable by
  construction — regenerated each build, wiped by any reinstall; `cfg.cssEntry` is
  bounded to `PKG_DIR`, which is why it must sit in the package dir).

## process.env shim (CRITICAL — required after EVERY build)

Core components read `process.env.NEXT_PUBLIC_*` at module scope (e.g.
`auth-core/config.ts` → `CURRENT_APP`, imported transitively by even leaf components
like `Spinner`). Next replaces these at build; the esbuild bundle only defines
`process.env.NODE_ENV`, so every other ref throws `ReferenceError: process is not
defined` at render. **`.design-sync/patch-bundle.mjs` injects a `process` shim as
line 2 of `_ds_bundle.js`** (line 1 stays the `@ds-bundle` contract header) and
refreshes `_ds_sync.json`'s `bundleSha12` (else validate reports the anchor stale).

**Run order, every time:**

```
node .design-sync/compile-css.mjs src/app/globals.css node_modules/@robosystems/core/.ds-compiled.css
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle
node .design-sync/patch-bundle.mjs ./ds-bundle    # <-- do NOT skip
node .ds-sync/package-validate.mjs ./ds-bundle
node .design-sync/gen-manifest.mjs ./ds-bundle    # <-- do NOT skip (card index)
```

**`_ds_manifest.json` (the pane's card index) MUST be generated and uploaded.**
package-build does not emit it; the claude.ai/design app's server-side self-check
normally rebuilds it, but that self-check does NOT fire on raw DesignSync file
uploads (confirmed 2026-06-29 — `_ds_needs_recompile` left in the remote listing
means it never ran). So a CLI sync leaves the OLD manifest in place: newly added
components (e.g. the merged `landing` group) never appear in the pane, and any
removed ones read "file not found". Run `gen-manifest.mjs` (derives namespace +
components from the `_ds_bundle.js` header, cards from each HTML's `@dsCard` marker,
tokens from `_ds_bundle.css`, fonts from `fonts.css`) and include `_ds_manifest.json`
in the upload set. Verify with `get_file _ds_manifest.json` — it must list all 70
components incl. the `landing` group.

`preview-rebuild.mjs` does NOT touch `_ds_bundle.js`, so the shim survives subagent
preview rebuilds — only full `package-build.mjs` / the `resync.mjs` driver overwrite
it and need re-patching afterward (the driver builds internally, so on re-sync run
the driver, then patch, then re-validate before upload).

## Fonts

- `cfg.extraFonts: [".design-sync/ds-fonts.css"]` — a hand-authored `@font-face` file
  whose url()s resolve to the real ttfs under `public/fonts/` (Space Grotesk + Orbitron).
  The converter copies them into `fonts/` and rewrites url()s to `./fonts/<basename>`.
  (Bare-ttf extraFonts entries do NOT work here — the globals.css `@font-face` use
  absolute `/fonts/...` urls that `extractFonts` can't resolve, which is why we strip
  them and supply this file instead.)
- **JetBrains Mono** is referenced only in the `font-family: mono` fallback chain and
  is NOT shipped by the app either (relies on system mono). Suppressed via
  `cfg.runtimeFontPrefixes: ["JetBrains"]` — accepted substitute, matches app behavior.

## Config decisions

- `componentSrcMap: {"SupportModal": null}` — SupportModal is a `export default`; the
  synth entry's `export *` doesn't re-export defaults, so it isn't on the global
  (`[BUNDLE_EXPORT]`). Excluded (it's app-coupled, floor-card-only anyway).
- `overrides.ConfirmModal: {cardMode:"single", viewport:"560x440"}` — it's an overlay
  (Flowbite Modal); single mode renders the open dialog inside the card.

## Known render warns (triaged benign — do NOT chase on re-sync)

- `[RENDER_THIN] AnimatedLogo`, `BrandSpinner` — SVG logo marks with no text; they
  paint fine (confirmed in screenshots), the heuristic just measures no text.
- `[RENDER_THIN] ConfirmModal` ("0px height") — the Modal renders via a portal, so the
  card root measures 0; the dialog itself renders correctly (confirmed in screenshot).

## Curated previews (24 authored, all graded good)

ui-components: Spinner, StatCard, EmptyState, LoadingState, ConfirmModal.
forms: StatusAlert, PasswordRequirements, SettingsCard, SettingsFormField.
settings: SettingsPageHeader. layout: PageHeader, PageContainer, SettingsContainer.
general: AnimatedLogo, BrandSpinner, LogoBadge, PageLayout. chat: ChatMessage,
ChatHeader, ChatInputArea, DeepResearchToggle. api-keys: ApiKeyDisplay,
SecureApiKeyField. console: ProgressiveText.
The other ~33 components ship the floor card (app-coupled: auth flows, providers,
selectors, data views) — authorable incrementally on any later re-sync.

### Component facts worth knowing (from source, not the stub .d.ts)

- **SecureApiKeyField / ApiKeyDisplay**: masked display is `keyId.slice(0,8)` + 24 dots
  (NOT derived from `apiKey`). Pick a readable `keyId` prefix (`rfs_live`, …).
- **ChatInputArea**: needs `textareaRef` — `{current:null} as RefObject<...>` works in a
  no-hook preview. Loading swaps textarea text to `"<Deep research|Thinking><dots>"`.
- **DeepResearchToggle**: `absolute top-3 left-3` — wrap in a sized `relative` parent.
- **ProgressiveText**: typewriter (~1ms/char → instant for capture); bare `<span>`, wrap
  for font/color; multiline needs `whitespace-pre-line` + JS `\n`.
- **PasswordRequirements**: `isValid` is tri-state (undefined/true/false).
- **ChatMessage**: `user` 'You'→teal right bubble / 'Agent'→gray left card; `isPartial`
  → spinner+progress; `taskId` → "Deep research" clock badge; body is react-markdown.

## Re-sync risks / watch-list

- **Must re-run `patch-bundle.mjs` after every full build / driver run** (see above) —
  the single most important step; skipping it reintroduces the `process` ReferenceError
  and a stale anchor.
- **Recompile `.ds-compiled.css` before every build** — it lives in
  `node_modules/@robosystems/core/`, so ANY `npm install`/package bump wipes it.
  Also recompile when `globals.css` or `tailwind.config.ts` change.
- **Core changes reach this sync via the npm package**: bump `@robosystems/core`
  in the app (`npm install @robosystems/core@<version>`), then re-run the pipeline.
  The bundle reflects the installed version, not a local checkout — to preview
  unreleased core work, install a `pack:local` tarball from the robosystems-core
  repo first.
- This is one of 3 sibling apps (roboledger-app, roboinvestor-app) consuming the same
  published `@robosystems/core`. Previews/config here are REUSABLE for those — only
  the brand color palette in their `globals.css`/`tailwind.config.ts` differs
  (RoboSystems=blue, RoboLedger=violet, RoboInvestor=emerald). Replication = copy
  `.design-sync/` (minus projectId), recompile CSS against that app's globals,
  rebuild+patch, re-grade for brand color, upload to that app's own project.

## App identity / logo brand (per-app)

`.design-sync/app-name` holds this app's name (robosystems | roboledger | roboinvestor).
`patch-bundle.mjs` reads it and injects `NEXT_PUBLIC_APP_NAME` into the process shim so
CURRENT_APP resolves correctly and the LOGO components (LogoBadge, AnimatedLogo,
BrandSpinner) render THIS app's mark + brand color. CSS brand colors (primary/secondary/
accent utilities) are already per-app via the compiled stylesheet; this fixes the
JS-driven logo brand, which otherwise defaults to the RoboSystems blue mark on every app.
Re-sync: keep `.design-sync/app-name` correct per app; the patch step handles the rest.

## Real types (npm-package era — `build:types` retired 2026-07-11)

Prop types come from the `.d.ts` tree that **ships inside the installed package**
(`node_modules/@robosystems/core/**/*.d.ts`, `"types": "./index.d.ts"`). There is
no local types build step anymore — the old `npm run build:types` script was
removed with the subtree.

- The real public API (barrel exports) ≠ the synth all-source scan: it exposes
  non-components (SDK clients, `AuthCore` namespace, `QueuedQueryError`, `GraphFilters`)
  and omits internal components. `cfg.componentSrcMap` reconciles this: 8
  null-exclusions for the non-components + 3 extensionless pins (`AnimatedLogo`,
  `LogoBadge`, `ProgressiveText`) to keep them — with their runtime bindings coming
  from `core-internal-entry.ts` (see Build setup). Net **55 core components** + the
  landing surface.

Full run order: `compile-css.mjs` → `package-build.mjs` → `patch-bundle.mjs` → `package-validate.mjs` → `gen-manifest.mjs` (then upload `_ds_manifest.json`).
