import FloatingElementsVariant from './FloatingElementsVariant'

export default function DemoSection() {
  return (
    <section id="demo" className="relative bg-black py-24">
      <FloatingElementsVariant variant="demo" intensity={8} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            See RoboSystems in Action
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            Watch how companies use RoboSystems to transform their financial
            data into actionable intelligence with AI-powered analysis.
          </p>

          {/* Demo Video Placeholder */}
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-800 bg-zinc-900">
            <div className="aspect-video bg-linear-to-br from-zinc-800 to-zinc-900">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20">
                    <svg
                      className="h-10 w-10 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Product Demo Coming Soon
                  </h3>
                  <p className="text-gray-400">
                    See how to build your knowledge graph in minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-16 grid gap-8 text-left md:grid-cols-3">
            <div className="rounded-xl bg-zinc-900 p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Financial Reporting
              </h3>
              <p className="text-sm text-gray-400">
                Generate instant reports with AI that understands your entire
                financial history
              </p>
            </div>
            <div className="rounded-xl bg-zinc-900 p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Anomaly Detection
              </h3>
              <p className="text-sm text-gray-400">
                AI agents continuously monitor for unusual patterns and
                transactions
              </p>
            </div>
            <div className="rounded-xl bg-zinc-900 p-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Predictive Analytics
              </h3>
              <p className="text-sm text-gray-400">
                Forecast trends based on relationships in your knowledge graph
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
