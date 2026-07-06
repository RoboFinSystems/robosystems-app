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
}

export default withFlowbiteReact(nextConfig)
