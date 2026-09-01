'use client'

import FloatingElementsVariant from '@/components/landing/FloatingElementsVariant'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'
import SalesContactModal from '@/components/landing/SalesContactModal'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Deployment options — the three delivery modes side by side.
 *
 * Copy discipline (engagement model §9): SSO/SCIM are claimed as verified
 * against Okta and scoped to Dedicated Deployments; SOC 2 Type II is stated
 * as *in progress* — never as a completed audit or "certified" — with scope
 * described and linked to the MSA and Trust Center; the no-lock-in claim
 * rests on backups, the public API and Account Transfer — not on
 * "everything is readable over GraphQL", which awaits its audit.
 */

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

interface Mode {
  name: string
  tagline: string
  body: string
  facts: Array<{ label: string; value: string }>
  featured?: boolean
}

const MODES: Mode[] = [
  {
    name: 'Managed Platform',
    tagline: 'Self-serve · per graph',
    body: 'Your graphs run on our multi-tenant platform, each in its own isolated graph database. Sign up, connect QuickBooks or the SEC repository, done.',
    facts: [
      { label: 'Price', value: 'From $99 per graph per month' },
      {
        label: 'Paper',
        value:
          'The public Terms — or our hosted MSA plus a one-page Order Form when procurement asks',
      },
    ],
  },
  {
    name: 'Dedicated Deployment',
    tagline: 'Your own AWS account · operated by us',
    body: 'The same platform, provisioned into an AWS account dedicated to your organization inside our cloud organization, off the same assembly line as our own production. Account-level isolation. Sign in from your identity provider and provision users from it. Read-only visibility into the account, always.',
    facts: [
      {
        label: 'Price',
        value:
          'AWS at cost, plus an operations fee and an annual platform fee — quoted per engagement',
      },
      { label: 'Paper', value: 'MSA + Order Form, Schedule B' },
    ],
    featured: true,
  },
  {
    name: 'Self-Hosted',
    tagline: 'Your account · your operation',
    body: 'Clone the Apache-2.0 repository and bootstrap it into your own AWS account. You hold the root, the data, and the audit. Support, advisory and integration work are available from Harbinger FinLab — through the public API, with a key you issue and can revoke, never from inside your account.',
    facts: [
      { label: 'Price', value: 'Free to run. Services priced per engagement' },
      {
        label: 'Paper',
        value:
          'None required to run it. Services under a Harbinger MSA and a SOW',
      },
    ],
  },
]

const COMPARISON: Array<{ row: string; m: string; d: string; s: string }> = [
  {
    row: 'Who owns the AWS account',
    m: 'RoboSystems',
    d: 'RoboSystems — an account dedicated to you',
    s: 'You',
  },
  {
    row: 'Who operates it',
    m: 'RoboSystems',
    d: 'RoboSystems',
    s: 'You',
  },
  {
    row: 'Who holds your data',
    m: 'RoboSystems',
    d: 'RoboSystems, in your account only',
    s: 'You — we never hold it',
  },
  {
    row: 'Isolation',
    m: 'Your own graph database per subscription',
    d: 'Your own AWS account',
    s: 'Your environment',
  },
  {
    row: 'How you sign in',
    m: 'Email and password, with passkeys as a second factor',
    d: 'Your identity provider (OIDC SSO) with SCIM provisioning; passkeys',
    s: 'Whatever you configure — the same software',
  },
  {
    row: 'SEC repository',
    m: 'Add a subscription',
    d: 'Included through a managed-platform account',
    s: 'Rebuild from EDGAR with the open pipeline',
  },
  {
    row: 'Contract',
    m: 'Terms of Service, or MSA + Order Form',
    d: 'MSA + Order Form (Schedule B)',
    s: 'Apache 2.0; services via Harbinger FinLab',
  },
  {
    row: 'Attestation',
    m: 'SOC 2 Type II compliance in progress; the managed platform is inside the scope of the examination',
    d: 'Inside that scope for as long as we operate it',
    s: 'Your audit. You inherit the control design in the code and infrastructure — not our report',
  },
  {
    row: 'Leaving',
    m: 'Download backups; read everything through the public API',
    d: 'Account Transfer to your own ownership — a priced engagement, terms in the MSA from day one',
    s: 'Nothing to leave',
  },
]

const IDENTITY: Array<{ title: string; body: string; scope: string }> = [
  {
    title: 'Single sign-on',
    body: "Sign in from your identity provider over OIDC. Identities link once to an account we provisioned — deactivate someone at your IdP and they're refused, valid token or not. Verified end-to-end against Okta; any OIDC-compliant provider.",
    scope: 'Dedicated Deployments',
  },
  {
    title: 'SCIM 2.0 provisioning',
    body: 'Create, update and deactivate users from your identity provider. Deactivation revokes sessions and API keys immediately; delete is a deactivate, never destructive. Verified against Okta.',
    scope: 'Dedicated Deployments',
  },
  {
    title: 'Passkeys & MFA',
    body: 'WebAuthn passkeys as a second factor or for passwordless sign-in, with single-use recovery codes. A deployment can require them for organization owners and admins.',
    scope: 'Managed platform and Dedicated Deployments',
  },
  {
    title: 'Roles and scoped keys',
    body: "Viewer, member and admin on every graph. API keys scoped to a single graph work on that graph's REST, GraphQL and MCP endpoints and are refused everywhere else.",
    scope: 'Every mode',
  },
]

const SECURITY: string[] = [
  'Encryption in transit and at rest; every graph in its own database.',
  'Tenant isolation is tested, not asserted: an authenticated harness provisions two tenants against a live deployment and fires a cross-tenant and privilege-escalation matrix at it — REST, Cypher, GraphQL, MCP, both extension surfaces, both directions.',
  'A pinned supply chain: every CI action pinned to a commit, release deployments dispatch-only, provenance certified per pull request. Dedicated Deployments run a byte-identical, tag-pinned mirror of the public repository.',
  'Security incidents affecting your data: notice within 72 hours. Security releases: applied fleet-wide.',
  'SOC 2 Type II compliance is in progress with an independent CPA firm; the report will be available to customers under NDA once the audit is complete. Its scope is the environments we operate — the managed platform, and a Dedicated Deployment for as long as we operate it — never a self-hosted one.',
]

const BUYING: Array<{ title: string; body: string }> = [
  {
    title: 'Managed',
    body: 'Sign up; the public Terms govern. Need paper? The MSA is public — a one-page Order Form incorporates it.',
  },
  {
    title: 'Dedicated',
    body: "One conversation, one Order Form with Schedule B. Pricing is AWS at cost plus an operations fee and an annual platform fee; we don't mark up the cloud bill.",
  },
  {
    title: 'Self-hosted',
    body: 'No RoboSystems contract needed. Support and integration engagements are with Harbinger FinLab under its MSA and a SOW.',
  },
]

const sectionHeading =
  'font-heading mb-4 text-3xl font-bold text-white sm:text-4xl'
const sectionLede = 'mx-auto max-w-3xl text-gray-400'
const primaryButton =
  'rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40'
const secondaryButton =
  'rounded-lg border border-gray-700 px-8 py-3 font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white'

export default function EnterpriseContent() {
  const [showContact, setShowContact] = useState(false)
  const openContact = () => setShowContact(true)

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-black py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400">
                Deployment Options
              </div>
              <h1 className="font-heading mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                One platform. Three ways to run it.
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-300 sm:text-xl">
                Start on the managed platform in minutes. Move to an AWS account
                dedicated to you&mdash;provisioned and operated by us&mdash;when
                you outgrow it. Take the whole thing in-house whenever you want.
                Same open-source software, same public API, and integrations
                that never notice the move.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button onClick={openContact} className={primaryButton}>
                  Talk to us about a Dedicated Deployment
                </button>
                <Link href="/pricing" className={secondaryButton}>
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The three modes */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <FloatingElementsVariant variant="pricing" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className={sectionHeading}>Pick where it runs</h2>
              <p className={sectionLede}>
                The three modes are a ladder, not a menu. Most customers land on
                the managed platform, move to a Dedicated Deployment when their
                scale, identity or procurement requirements call for one, and
                keep the option to take the account with them.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-3">
              {MODES.map((mode) => (
                <div
                  key={mode.name}
                  className={`relative flex flex-col overflow-hidden rounded-2xl bg-linear-to-br from-cyan-900/40 to-cyan-900/10 p-6 sm:p-8 ${
                    mode.featured
                      ? 'border-2 border-cyan-500'
                      : 'border border-cyan-500/30'
                  }`}
                >
                  {mode.featured && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className="rounded-bl-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
                        NEW
                      </div>
                    </div>
                  )}
                  <div className="mb-1 text-sm font-medium text-cyan-400">
                    {mode.tagline}
                  </div>
                  <h3 className="font-heading mb-4 text-2xl font-bold text-white">
                    {mode.name}
                  </h3>
                  <p className="mb-6 text-gray-300">{mode.body}</p>
                  <dl className="mb-8 space-y-3 text-sm">
                    {mode.facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="font-semibold text-gray-200">
                          {fact.label}
                        </dt>
                        <dd className="text-gray-400">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-auto">
                    {mode.name === 'Managed Platform' && (
                      <Link
                        href="/pricing"
                        className="block w-full rounded-lg border border-cyan-700 py-3 text-center font-medium text-gray-300 transition-all hover:bg-cyan-800/20 hover:text-white"
                      >
                        See pricing
                      </Link>
                    )}
                    {mode.name === 'Dedicated Deployment' && (
                      <button
                        onClick={openContact}
                        className="block w-full rounded-lg bg-cyan-500/80 py-3 text-center font-medium text-white transition-all hover:bg-cyan-600/80"
                      >
                        Talk to us
                      </button>
                    )}
                    {mode.name === 'Self-Hosted' && (
                      <a
                        href="https://github.com/RoboFinSystems/robosystems/wiki/Bootstrap-Guide"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-lg border border-cyan-700 py-3 text-center font-medium text-gray-300 transition-all hover:bg-cyan-800/20 hover:text-white"
                      >
                        Bootstrap guide
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-500">
              Running many entities or clients? Start the conversation
              early&mdash;every graph beyond your first is a routine lift on the
              managed platform, and at scale a Dedicated Deployment is usually
              the better fit.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="relative bg-black py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className={sectionHeading}>Side by side</h2>
              <p className={sectionLede}>
                Who owns what, who operates what, and what each mode means for
                your data, your sign-in and your exit.
              </p>
            </div>
            <div className="mx-auto max-w-6xl overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-zinc-900 text-xs tracking-wide text-gray-400 uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      &nbsp;
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Managed Platform
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 font-semibold text-cyan-400"
                    >
                      Dedicated Deployment
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Self-Hosted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-zinc-950">
                  {COMPARISON.map((r) => (
                    <tr key={r.row}>
                      <th
                        scope="row"
                        className="px-5 py-4 align-top font-medium text-gray-200"
                      >
                        {r.row}
                      </th>
                      <td className="px-5 py-4 align-top text-gray-400">
                        {r.m}
                      </td>
                      <td className="px-5 py-4 align-top text-gray-300">
                        {r.d}
                      </td>
                      <td className="px-5 py-4 align-top text-gray-400">
                        {r.s}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Identity & access */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <FloatingElementsVariant variant="platform" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className={sectionHeading}>Identity &amp; access</h2>
              <p className={sectionLede}>
                Sign-in from your identity provider, accounts provisioned and
                deactivated by it, passkeys as a second factor. SSO and SCIM are
                configured during onboarding of a Dedicated Deployment; they
                aren&apos;t offered on the managed platform.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
              {IDENTITY.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-gray-700"
                >
                  <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-400">{item.body}</p>
                  <div className="text-xs font-medium tracking-wide text-cyan-400 uppercase">
                    {item.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & attestation */}
        <section className="relative bg-black py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h2 className={sectionHeading}>
                  One security program, every environment we operate
                </h2>
                <p className="text-gray-400">
                  The managed platform and every Dedicated Deployment come off
                  the same assembly line and run the same controls. What we
                  claim about them is stated in the contract you sign and on the
                  Trust Center&mdash;not only here&mdash;and we say &ldquo;in
                  progress&rdquo; until the auditor says otherwise.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a
                    href="https://trust.robosystems.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={secondaryButton + ' text-center'}
                  >
                    Trust Center
                  </a>
                  <Link
                    href="/pages/msa"
                    className={secondaryButton + ' text-center'}
                  >
                    Read the MSA
                  </Link>
                </div>
              </div>
              <ul className="space-y-4 lg:col-span-3">
                {SECURITY.map((line) => (
                  <li
                    key={line}
                    className="flex items-start rounded-xl border border-gray-800 bg-zinc-900 p-4 text-sm text-gray-300"
                  >
                    {CHECK}
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Nothing held hostage */}
        <section className="relative bg-zinc-950 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className={sectionHeading}>Nothing held hostage</h2>
            <p className="text-lg text-gray-300">
              Every backup is a downloadable archive. Every graph is a remote
              MCP server and a public API. And a Dedicated Deployment can be
              transferred to your own AWS account through the{' '}
              <span className="text-white">Account Transfer engagement</span>
              &mdash;terms in the MSA on day one, never negotiated under renewal
              pressure. You leave with the entire running system, in an account
              you own, still working; your integrations never notice, because
              they only ever spoke the public API.
            </p>
          </div>
        </section>

        {/* How buying works + CTA */}
        <section className="relative bg-black py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className={sectionHeading}>How buying works</h2>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {BUYING.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-800 bg-zinc-900 p-6"
                >
                  <h3 className="font-heading mb-2 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={openContact} className={primaryButton}>
                Talk to us about a Dedicated Deployment
              </button>
              <Link href="/pages/msa" className={secondaryButton}>
                Read the MSA
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <SalesContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        variant="dedicated_deployment"
      />
    </div>
  )
}
