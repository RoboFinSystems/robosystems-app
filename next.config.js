import withFlowbiteReact from 'flowbite-react/plugin/nextjs'

// Blog posts that moved to roboledger.ai (site-content-surfaces, decided 2026-09-02). The
// content machine flags them `site: roboledger`, which drops them from this app's /blog list
// and sitemap on the next reindex; the redirect keeps the old URL and its backlinks pointing
// at the new home. Add a slug here whenever a post's site changes.
const MOVED_TO_ROBOLEDGER = ['claude-ledger']

// The research portal moved whole to roboinvestor.ai the same day: the index, every
// /research/:ticker page and the YouTube first-comment links that point at them.
const RESEARCH_ORIGIN = 'https://roboinvestor.ai'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions POST to the page route and Next rejects the request unless
  // the browser `Origin` matches the `Host`/`x-forwarded-host` it sees. In prod
  // the app runs on App Runner behind CloudFront, whose origin is the raw
  // `*.awsapprunner.com` host — so Next never sees `robosystems.ai` and every
  // action (graph/entity selection persistence) 500s. Allow the public origin
  // explicitly so the CSRF origin check passes. www redirects to the apex, so
  // only the apex is listed.
  experimental: {
    serverActions: {
      allowedOrigins: ['robosystems.ai'],
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
      // robots.ts already disallows /billing/.
      {
        source: '/billing',
        destination: '/organization?tab=billing',
        permanent: false,
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
