'use client'

import Link from 'next/link'

interface DedicatedDeploymentProps {
  onContactSales: () => void
}

const POINTS = [
  'Account-level isolation in an AWS account dedicated to you, operated by us',
  'SSO (OIDC) and SCIM provisioning from your identity provider',
  'AWS at cost, plus an operations fee and an annual platform fee',
  'Transferable to your own ownership — Account Transfer terms in the MSA from day one',
  'SEC repository access included through a managed-platform account',
]

const CHECK = (
  <svg
    className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-cyan-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
)

/**
 * The fourth "tier" on the pricing page — deliberately a full-width band
 * rather than a fourth column, because it is not priced per graph and has no
 * number to show. Pricing structure only (public in MSA Schedule B.4); the
 * quote is per engagement.
 */
export default function DedicatedDeployment({
  onContactSales,
}: DedicatedDeploymentProps) {
  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-linear-to-br from-zinc-900 to-cyan-950/30 p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-3 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-400 uppercase">
              Your own AWS account
            </div>
            <h3 className="font-heading mb-2 text-2xl font-bold text-white">
              Dedicated Deployment
            </h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">Talk to us</span>
              <span className="ml-2 text-gray-400">quoted per engagement</span>
            </div>
            <p className="text-gray-400">
              The whole platform provisioned into an AWS account dedicated to
              your organization, which we operate for you. For firms running
              many entities or clients, and for anyone with identity,
              procurement or isolation requirements a shared platform can&apos;t
              meet.
            </p>
          </div>
          <div className="lg:col-span-3">
            <ul className="mb-8 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start text-gray-300">
                  {CHECK}
                  {point}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onContactSales}
                className="rounded-lg bg-cyan-500/80 px-6 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-cyan-600/80"
              >
                Talk to us
              </button>
              <Link
                href="/enterprise"
                className="rounded-lg border border-cyan-700 px-6 py-3 text-center font-medium text-gray-300 transition-all duration-300 hover:bg-cyan-800/20 hover:text-white"
              >
                Compare deployment options &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
