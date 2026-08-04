import withFlowbiteReact from 'flowbite-react/plugin/nextjs'

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
    ]
  },
}

export default withFlowbiteReact(nextConfig)
