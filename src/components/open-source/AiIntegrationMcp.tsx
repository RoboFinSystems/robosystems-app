import { MCP_API_URL, MCP_CONNECTOR_NAME, MCP_OAUTH_URL } from '@/lib/mcp'

export default function AiIntegrationMcp() {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-purple-400/40 bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-pink-950/60 shadow-2xl shadow-purple-500/20">
      <div className="p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">
              AI Integration via MCP
            </h3>
            <p className="text-lg text-purple-200">
              Connect Claude, ChatGPT, Grok, Cursor, or any MCP client
            </p>
          </div>
        </div>

        <p className="mb-6 text-gray-300">
          Use the Model Context Protocol (MCP) to give AI assistants direct
          access to your financial data. Ask questions in natural language and
          let your assistant query the knowledge graph automatically.
        </p>

        <div className="mb-6 space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Integration Options:
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">✓</span>
              <strong className="text-white">Claude:</strong>
              <span className="ml-1">
                Add a custom connector for conversational financial analysis
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">✓</span>
              <strong className="text-white">Claude Code:</strong>
              <span className="ml-1">
                Query financial data while coding and building applications
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">✓</span>
              <strong className="text-white">Cursor / VS Code:</strong>
              <span className="ml-1">
                Point your editor at the same URL and query inline
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">✓</span>
              <strong className="text-white">ChatGPT / Grok:</strong>
              <span className="ml-1">
                Add the same URL as a connector and sign in — no key to paste
              </span>
            </li>
          </ul>
        </div>

        <div className="mb-6 space-y-4 rounded-xl bg-black/50 p-4">
          <div>
            <h4 className="mb-1 text-sm font-semibold text-white">
              Sign in with one URL — no key, no install
            </h4>
            <p className="mb-3 text-xs text-gray-400">
              One address for every graph you can reach. The client sends you to
              RoboSystems to sign in, and you choose the graph on the consent
              screen — nothing to copy, store, or rotate.
            </p>
            <pre className="overflow-x-auto text-sm text-gray-300">
              <code>{`URL: ${MCP_OAUTH_URL}`}</code>
            </pre>
          </div>
          <div className="border-t border-purple-500/20 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Claude Code (one command):
            </h4>
            <pre className="overflow-x-auto text-sm text-gray-300">
              <code>{`claude mcp add --transport http ${MCP_CONNECTOR_NAME} \\
  ${MCP_OAUTH_URL}`}</code>
            </pre>
          </div>
          <div className="border-t border-purple-500/20 pt-4">
            <h4 className="mb-1 text-sm font-semibold text-white">
              Or pin one graph — scripts, CI, and clients that can&apos;t sign
              in
            </h4>
            <p className="mb-3 text-xs text-gray-400">
              The id in the path fixes the workspace: your own graph id for a
              private ledger, or <code>sec</code> for the public SEC repository.
              This route also takes an API key.
            </p>
            <pre className="overflow-x-auto text-sm text-gray-300">
              <code>{`URL:    ${MCP_API_URL}/v1/graphs/{GRAPH_ID}/mcp
Header: X-API-Key: rfs*`}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-black/50 p-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Ask the public SEC repository:
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "What was Apple's revenue for the last 5 years?"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Compare NVIDIA and AMD net income trends"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Show me Tesla's total assets by quarter"
              </li>
            </ul>
          </div>
          <div className="border-t border-purple-500/20 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Ask your own graph:
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "What's blocking the month-end close?"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Show me last quarter's income statement"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Which accounts are still unmapped?"
              </li>
            </ul>
          </div>
          <div className="border-t border-purple-500/20 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-white">
              AI Memory & Workspaces:
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Create a memory workspace and save what we found about margins"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "What patterns did we identify in last quarter's analysis?"
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400">•</span>
                "Fork the graph into an analytical workspace"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
