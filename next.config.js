import withFlowbiteReact from 'flowbite-react/plugin/nextjs'

// Blog posts that moved to roboledger.ai (site-content-surfaces, decided 2026-09-02). The
// content machine flags them `site: roboledger`, which drops them from this app's /blog list
// and sitemap on the next reindex; the redirect keeps the old URL and its backlinks pointing
// at the new home. Add a slug here whenever a post's site changes.
const MOVED_TO_ROBOLEDGER = ['claude-ledger']

// The research portal moved whole to roboinvestor.ai the same day: the index, every
// /research/:ticker page and the YouTube first-comment links that point at them.
const RESEARCH_ORIGIN = 'https://roboinvestor.ai'

// Server Actions compare the browser `Origin` with the host Next sees, which behind
// CloudFront is App Runner's own. The public host is therefore listed explicitly: the
// prod apex always, plus the host of the app URL this build was made for, so staging
// (staging.robosystems.ai) and a fork on its own domain pass the check too.
function appUrlHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_ROBOSYSTEMS_APP_URL ?? '').host
  } catch {
    return null
  }
}

export const SERVER_ACTION_ALLOWED_ORIGINS = [
  ...new Set(['robosystems.ai', appUrlHost()].filter(Boolean)),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions POST to the page route and Next rejects the request unless
  // the browser `Origin` matches the `Host`/`x-forwarded-host` it sees. In prod
  // the app runs on App Runner behind CloudFront, whose origin is the raw
  // `*.awsapprunner.com` host — so Next never sees the public host and every
  // action (graph/entity selection persistence) 500s. Allow the public origins
  // explicitly so the CSRF origin check passes (see
  // SERVER_ACTION_ALLOWED_ORIGINS). www redirects to the apex.
  experimental: {
    serverActions: {
      allowedOrigins: SERVER_ACTION_ALLOWED_ORIGINS,
    },
  },
  async redirects() {
    return [
      // Billing lives on the Organization page — it is org-scoped, and its
      // Billing / Subscriptions / Invoices tabs sit beside Graphs and Members.
      //
      // /billing stays as a redirect rather than being deleted: Stripe's portal
      // return URL and checkout cancel URL are built server-side from
      // ROBOSYSTEMS_URL, and the API's repository upsell messages are
      // long-lived. Those point here until the matching API deploy lands, and
      // older links keep working indefinitely afterwards.
      //
      // Handled here rather than by `redirect()` in a page: the (app) layout
      // streams, so the shell flushes before a page-level redirect throws and
      // Next falls back to a JS-dependent client redirect. A config redirect is
      // a real HTTP 307 issued before any rendering, which is what a Stripe
      // return URL needs.
      //
      // permanent: false on purpose — a 308 is cached by the browser
      // indefinitely and would outlive any future move. No SEO cost either:
      // robots.ts disallows /billing.
      {
        source: '/billing',
        destination: '/organization?tab=billing',
        permanent: false,
      },
      // The extensions surface moved out of the platform API reference into its own hub
      // at /docs/extensions, so reads (GraphQL) and writes (named operations) are
      // documented as one thing instead of as unrelated tags.
      //
      // permanent: true — these are the canonical homes now, and the wiki already
      // publishes links to /docs/graphql. The GraphQL tag's two HTTP operations no
      // longer have pages of their own: they render on the GraphQL page itself, which
      // is where anyone following an old operation link wants to land anyway.
      {
        source: '/docs/graphql',
        destination: '/docs/extensions/graphql',
        permanent: true,
      },
      {
        source: '/docs/graphql/:field',
        destination: '/docs/extensions/graphql/:field',
        permanent: true,
      },
      // `:operation*` matches zero segments too, so these also cover the bare tag
      // URLs — `/docs/api/graphql` and `/docs/api/roboledger-fiscal-close` — and no
      // separate exact-match rule is needed.
      {
        source: '/docs/api/graphql/:operation*',
        destination: '/docs/extensions/graphql',
        permanent: true,
      },
      {
        source: '/docs/api/:tag(roboledger-.*|roboinvestor)/:operation*',
        destination: '/docs/extensions/:tag/:operation*',
        permanent: true,
      },
      // The tags above are the ones the spec carries now. The reference was published on
      // 09-17 against the previous names — `Extensions: RoboLedger`, `Extensions:
      // RoboInvestor`, `Extensions: GraphQL` — so `extensions-*` is what was in the
      // sitemap for the three days before the API was retagged, and what an outside link
      // is likeliest to hold. Only the bare tag pages need a rule: an operation under any
      // of them is resolved by slug in OperationReference and redirected to whichever tag
      // now holds it, which is also what covers the Auth carve-out and the next retag.
      //
      // RoboLedger's one tag became eight, so there is no single successor page; the hub
      // lists all eight and is the honest destination.
      {
        source: '/docs/api/:tag(extensions-roboledger|roboledger)',
        destination: '/docs/extensions',
        permanent: true,
      },
      {
        source: '/docs/api/extensions-roboinvestor',
        destination: '/docs/extensions/roboinvestor',
        permanent: true,
      },
      {
        source: '/docs/api/extensions-graphql/:operation*',
        destination: '/docs/extensions/graphql',
        permanent: true,
      },
      // /open-source was setup instructions dressed as a marketing page (local quick
      // start, SEC pipeline, MCP setup, client libraries, AWS bootstrap), and most of its
      // recent commits were fixes keeping those claims current. The technical docs are now
      // the canonical home for that content, opened by a get-started section that carries
      // what the page taught; the positioning half lives in the homepage's open-source
      // section and the Self-Hosted card on /enterprise.
      //
      // permanent: true on purpose, the opposite of /billing's call. /open-source is an
      // indexed public page with outside links, and the retirement is final: a 308 is
      // what moves its search signals to /docs/technical and drops the old URL from the
      // index. Should the docs ever move, the new home redirects in turn.
      {
        source: '/open-source',
        destination: '/docs/technical',
        permanent: true,
      },
      // permanent: true is a 308, which search engines treat as a 301: the old URL's
      // signals move to the new site with the page.
      ...MOVED_TO_ROBOLEDGER.map((slug) => ({
        source: `/blog/${slug}`,
        destination: `https://roboledger.ai/blog/${slug}`,
        permanent: true,
      })),
      {
        source: '/research',
        destination: `${RESEARCH_ORIGIN}/research`,
        permanent: true,
      },
      {
        source: '/research/:ticker',
        destination: `${RESEARCH_ORIGIN}/research/:ticker`,
        permanent: true,
      },
    ]
  },
}

export default withFlowbiteReact(nextConfig)
