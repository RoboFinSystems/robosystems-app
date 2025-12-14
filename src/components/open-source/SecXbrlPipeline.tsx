export default function SecXbrlPipeline() {
  return (
    <div className="mb-12 overflow-hidden rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-950/60 via-cyan-900/40 to-blue-950/60 shadow-2xl shadow-cyan-500/20">
      <div className="p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
            <svg
              className="h-12 w-12 text-white"
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
          <div>
            <h3 className="text-3xl font-bold text-white">SEC XBRL Pipeline</h3>
            <p className="text-lg text-cyan-200">
              Load and query financial filings locally
            </p>
          </div>
        </div>

        <p className="mb-6 text-gray-300">
          Load company financial filings (10-K, 10-Q) by ticker symbol into a
          local graph database. Query revenue, net income, assets, and other
          GAAP metrics across multiple years with Cypher queries.
        </p>

        <div className="mb-6 space-y-3">
          <h4 className="text-lg font-semibold text-white">What You Can Do:</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="mr-2 text-cyan-400">✓</span>
              Download and process SEC filings for any public company
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-400">✓</span>
              Query financial metrics using Cypher graph database language
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-400">✓</span>
              Integrate with Claude Desktop or Claude Code via MCP
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-400">✓</span>
              Access programmatically via Python or TypeScript clients
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-400">✓</span>
              Compare financials across companies and time periods
            </li>
          </ul>
        </div>

        <div className="mb-6 rounded-xl bg-black/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-white">
            Quick Start - Load NVIDIA Filings:
          </h4>
          <pre className="overflow-x-auto text-sm text-gray-300">
            <code>{`# Start RoboSystems services
just start

# Create a test account with SEC access
just demo-sec

# Load NVIDIA filings (all available years)
just sec-load MSFT

# Query revenue data
just graph-query sec "MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(r:Report) RETURN r LIMIT 5"
`}</code>
          </pre>
        </div>

        <a
          href="https://github.com/RoboFinSystems/robosystems/wiki/SEC-XBRL-Pipeline"
          className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
        >
          View Full SEC Pipeline Documentation →
        </a>
      </div>
    </div>
  )
}
