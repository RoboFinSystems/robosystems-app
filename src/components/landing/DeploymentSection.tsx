import { BOOK_PATH } from '@/lib/site'
import EmailForATime from './EmailForATime'

const DEPLOYMENT_URL = 'https://harbinger.finance/#deployment'

// The fee and what it leaves out are the lock's fee line, said together wherever the price
// appears. Hosting is always RoboSystems' (speaker-neutral under the Harbinger badge).
const POINTS = [
  'Variance explanation, close checklist and peer benchmark in your MCP client, every number traced',
  'Your general ledger and the public companies you compare yourselves against, read side by side. QuickBooks connects directly; any other ledger comes in through the API or a file.',
  'Your books stay in the ledger you close in today, or you keep them on RoboLedger. An ERP is only ever read, and nothing writes to QuickBooks until you post an entry.',
  'Your team runs the deploy with Harbinger on a screenshare you control; workflows are built through keys you issue and can revoke',
  'Your people approve every entry. Harbinger never signs in to your books.',
  '$7,500 to $10,000, fixed by scope: half up front, half at handover.',
  '$7,500 sets up your ledger as a knowledge graph, SEC peer data and three workflows; $10,000 adds one data source from another system, as a graph of its own.',
  'Hosting is separate: from $99 a graph a month on the managed platform, Dedicated quoted, or free to self-host. Peer benchmarks use the SEC repository ($29 or $99 a month, 14-day trial).',
  'You keep everything Harbinger builds.',
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
 * The offer, on the homepage. A full-width band in the shape of the pricing page's
 * DedicatedDeployment: the Finance AI Deployment is a fixed-fee engagement delivered by
 * Harbinger FinLab, so it states a price range rather than a per-graph price. It is not the
 * Dedicated Deployment product; it runs on whichever deployment the client picks, so the
 * copy always names the offer in full and says so.
 */
export default function DeploymentSection() {
  return (
    <section id="deployment" className="relative bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="node-card relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-linear-to-br from-zinc-900 to-cyan-950/30 p-6 sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="relative grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-3 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-400 uppercase">
                Delivered by Harbinger FinLab
              </div>
              <h2 className="font-heading mb-4 text-3xl font-bold text-white">
                The Finance AI Deployment
              </h2>
              <p className="text-gray-300">
                RoboSystems where you choose (the RoboSystems managed platform,
                a Dedicated Deployment RoboSystems runs, or your own cloud), on
                your books, with three working agent workflows, in two to three
                weeks, at a fixed fee.
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
                <a
                  href={BOOK_PATH}
                  className="rounded-lg bg-cyan-500/80 px-6 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-cyan-600/80"
                >
                  Book 20 minutes
                </a>
                <a
                  href={DEPLOYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-cyan-700 px-6 py-3 text-center font-medium text-gray-300 transition-all duration-300 hover:bg-cyan-800/20 hover:text-white"
                >
                  See the deployment &rarr;
                </a>
              </div>
              <EmailForATime />
              <p className="mt-6 border-t border-cyan-500/20 pt-4 text-sm text-gray-400">
                Integrators and consultancies: deliver the Finance AI Deployment
                for your clients. You keep the services; RoboSystems runs the
                platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
