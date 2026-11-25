// The section reads left to right as one flow: what comes in, what it becomes,
// what gets done to it, and where it is reached from. The second column is the
// ontology drawn as the graph it is, with the two extensions that build on it.

const SOURCES = [
  {
    name: 'QuickBooks',
    kind: 'Accounting',
    lines: ['Chart of accounts', 'Journal entries and transactions'],
  },
  {
    name: 'Bank feeds',
    kind: 'Plaid and Mercury',
    lines: ['Bank and card transactions', 'Balances to reconcile against'],
  },
  {
    name: 'SEC filings',
    kind: 'The shared repository',
    lines: ['10-K, 10-Q, 20-F and 40-F', 'XBRL facts and the filing text'],
  },
  {
    name: 'Documents',
    kind: 'Knowledge base',
    lines: ['Policies, contracts and workpapers', 'Indexed for search'],
  },
  {
    name: 'Your own data',
    kind: 'A graph you model',
    lines: ['Your schema, loaded from Parquet'],
  },
]

// Each chip names what an operation does, short enough to sit on one row.
const JOBS = [
  {
    job: 'Query',
    does: 'Ask the graph directly, or let your AI write the query.',
    tools: ['Execute Cypher Statement', 'Build Fact Grid'],
  },
  {
    job: 'Read',
    does: "A company's statements and notes, whole, from its filing or from your ledger.",
    tools: ['Financial Statement Analysis', 'Disclosures', 'Information Block'],
  },
  {
    job: 'Search and recall',
    does: 'Find the passage in filings and your documents; keep what matters between sessions.',
    tools: ['Search Documents', 'Create Memory', 'Recall Semantic Memory'],
  },
  {
    job: 'Load',
    does: 'Stage your files and write them into the graph.',
    tools: ['Upload File', 'Stage File', 'Materialize'],
  },
  {
    job: 'Run',
    does: 'A graph on its own instance, with branches and backups.',
    tools: ['Create New Graph Database', 'Create Subgraph', 'Create Backup'],
  },
]

const ACCESS: {
  name: string
  line: string
  formats?: string[]
  links?: { label: string; href: string }[]
}[] = [
  {
    name: 'The apps',
    line: 'RoboLedger for the books, RoboInvestor for the portfolio',
    links: [
      { label: 'roboledger.ai', href: 'https://roboledger.ai' },
      { label: 'roboinvestor.ai', href: 'https://roboinvestor.ai' },
    ],
  },
  {
    name: 'Your AI',
    line: 'One set of tools from Claude, ChatGPT or any MCP client',
  },
  {
    name: 'AI Operators',
    line: 'The platform’s own AI behind the console and the background work, Claude through AWS Bedrock, paid in credits. MCP and the API use none',
  },
  {
    name: 'API',
    line: 'GraphQL and REST, with Python and TypeScript clients',
  },
  {
    name: 'Report files',
    line: 'Every report and filing is a file you can keep and open without us',
    formats: ['Holon (RDF)', 'DataBook', 'Tavi JSON', 'XBRL 2.1'],
    links: [
      { label: 'Open one in the xbrlkit viewer', href: 'https://xbrlkit.com' },
    ],
  },
  {
    name: 'Graph backup',
    line: 'The whole graph, backed up nightly, downloads as a LadybugDB file to open in G.V() or query from Python',
    formats: ['LadybugDB (.lbdb)'],
  },
]

type Tone = 1 | 2 | 3
// Blue for the shared ontology, violet for the ledger, cyan for the portfolio.
const TONES: Record<Tone, string> = {
  1: '96 165 250',
  2: '167 139 250',
  3: '34 211 238',
}
const tone = (n: Tone, alpha = 1) => `rgb(${TONES[n]} / ${alpha})`

// The schema graph's nodes, on a 420 x 540 canvas: the shared ontology above,
// and what each extension adds below it.
const NODES: {
  id: string
  label: string
  sub: string
  x: number
  y: number
  tone: Tone
}[] = [
  {
    id: 'report',
    label: 'Report',
    sub: 'a filing or a close',
    x: 97,
    y: 104,
    tone: 1,
  },
  {
    id: 'fact',
    label: 'Fact',
    sub: 'one reported value',
    x: 313,
    y: 104,
    tone: 1,
  },
  {
    id: 'element',
    label: 'Element',
    sub: 'the concept',
    x: 97,
    y: 206,
    tone: 1,
  },
  {
    id: 'entity',
    label: 'Entity',
    sub: 'the company',
    x: 313,
    y: 206,
    tone: 1,
  },
  {
    id: 'entry',
    label: 'Entry',
    sub: 'debits and credits',
    x: 97,
    y: 372,
    tone: 2,
  },
  { id: 'event', label: 'Event', sub: 'what happened', x: 97, y: 458, tone: 2 },
  {
    id: 'security',
    label: 'Security',
    sub: 'the instrument',
    x: 313,
    y: 372,
    tone: 3,
  },
  {
    id: 'position',
    label: 'Position',
    sub: 'units and cost basis',
    x: 313,
    y: 458,
    tone: 3,
  },
]

const EDGES: {
  from: string
  to: string
  label: string
  dx?: number
  dy?: number
}[] = [
  { from: 'report', to: 'fact', label: 'reports', dy: -8 },
  { from: 'fact', to: 'element', label: 'measures', dx: -8, dy: -12 },
  { from: 'fact', to: 'entity', label: 'about', dx: 26, dy: 4 },
  { from: 'entry', to: 'element', label: 'maps to', dx: 34, dy: 2 },
  { from: 'event', to: 'entry', label: 'posts as', dx: 34, dy: 4 },
  { from: 'security', to: 'entity', label: 'issued by', dx: -38, dy: 2 },
  { from: 'position', to: 'security', label: 'in', dx: 14, dy: 4 },
]

// The ontology every graph shares, and the two extensions built on it.
const FRAMES = [
  { label: 'The shared ontology', x: 6, y: 34, w: 404, h: 222 },
  { label: 'RoboLedger adds', x: 6, y: 322, w: 190, h: 190 },
  { label: 'RoboInvestor adds', x: 220, y: 322, w: 190, h: 190 },
]

const NODE_W = 150
const NODE_H = 54

function SchemaGraph() {
  const at = (id: string) => NODES.find((n) => n.id === id)!
  return (
    <svg
      viewBox="0 0 420 524"
      role="img"
      aria-label="The schema. In the shared ontology, a report reports facts; a fact measures an element and is about an entity. RoboLedger adds events that post as entries, and an entry maps to an element. RoboInvestor adds positions in securities, and a security is issued by an entity."
      className="mx-auto h-auto w-full max-w-md"
    >
      <defs>
        <marker
          id="schema-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 z" fill="rgb(156 163 175 / 0.8)" />
        </marker>
      </defs>
      {FRAMES.map((frame) => (
        <g key={frame.label}>
          <rect
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
            rx="16"
            fill="rgb(17 17 20)"
            stroke="rgb(113 113 122 / 0.7)"
            strokeWidth="1.25"
          />
          <text
            x={frame.x + 14}
            y={frame.y - 9}
            className="fill-gray-300 text-[12px] font-semibold tracking-wide uppercase"
          >
            {frame.label}
          </text>
        </g>
      ))}
      <text
        x="210"
        y="54"
        textAnchor="middle"
        className="fill-gray-400 text-[11.5px]"
      >
        with Period, Unit, Dimension, Taxonomy and Structure
      </text>
      {EDGES.map((edge) => {
        const a = at(edge.from)
        const b = at(edge.to)
        // Leave each node at its edge, not its centre.
        const dx = b.x - a.x
        const dy = b.y - a.y
        const horizontal = Math.abs(dx) / NODE_W > Math.abs(dy) / NODE_H
        const ox = horizontal ? (Math.sign(dx) * NODE_W) / 2 : 0
        const oy = horizontal ? 0 : (Math.sign(dy) * NODE_H) / 2
        const x1 = a.x + ox
        const y1 = a.y + oy
        const x2 = b.x - ox
        const y2 = b.y - oy
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgb(156 163 175 / 0.5)"
              strokeWidth="1.5"
              markerEnd="url(#schema-arrow)"
            />
            <text
              x={(x1 + x2) / 2 + (edge.dx ?? 0)}
              y={(y1 + y2) / 2 + (edge.dy ?? 0)}
              textAnchor="middle"
              className="fill-gray-300 text-[12px]"
            >
              {edge.label}
            </text>
          </g>
        )
      })}
      {NODES.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x - NODE_W / 2}
            y={node.y - NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            rx="11"
            fill={tone(node.tone, 0.14)}
            stroke={tone(node.tone, 0.6)}
            strokeWidth="1.5"
          />
          <text
            x={node.x}
            y={node.y - 3}
            textAnchor="middle"
            className="fill-white text-[15px] font-semibold"
          >
            {node.label}
          </text>
          <text
            x={node.x}
            y={node.y + 15}
            textAnchor="middle"
            className="fill-gray-400 text-[11.5px]"
          >
            {node.sub}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-400 uppercase">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 text-xs text-gray-300">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function SchemaArchitecture() {
  return (
    <section className="relative bg-black py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Data Architecture & Search
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            Your sources in one graph you can query, with search and memory
            beside it. A graph you model yourself takes your own schema, loaded
            from Parquet.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-gray-800 bg-gradient-to-b from-zinc-900 to-black p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr_1.35fr_1fr] lg:gap-8">
            <Step n={1} title="Comes in">
              <div className="space-y-3">
                {SOURCES.map((source) => (
                  <div
                    key={source.name}
                    className="rounded-lg border border-gray-800 bg-zinc-900/60 p-3"
                  >
                    <div className="font-semibold text-white">
                      {source.name}
                    </div>
                    <div className="mb-1 text-xs text-blue-300">
                      {source.kind}
                    </div>
                    <ul className="space-y-0.5 text-xs text-gray-400">
                      {source.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Step>

            <Step n={2} title="Becomes one graph">
              <SchemaGraph />
              <p className="mt-4 text-center text-xs text-gray-400">
                Your ledger and the public filings share one ontology, so a
                question reads the same against either.
              </p>
            </Step>

            <Step n={3} title="Gets done">
              <div className="space-y-3">
                {JOBS.map((item) => (
                  <div
                    key={item.job}
                    className="rounded-lg border border-gray-800 bg-zinc-900/60 p-3"
                  >
                    <div className="font-semibold text-white">{item.job}</div>
                    <p className="mb-2 text-xs text-gray-400">{item.does}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded bg-blue-900/40 px-2 py-0.5 text-xs text-blue-200"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Step>

            <Step n={4} title="Reached from">
              <div className="space-y-3">
                {ACCESS.map((way) => (
                  <div
                    key={way.name}
                    className="rounded-lg border border-gray-800 bg-zinc-900/60 p-3"
                  >
                    <div className="font-semibold text-white">{way.name}</div>
                    <p className="text-xs text-gray-400">{way.line}</p>
                    {way.formats && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {way.formats.map((format) => (
                          <span
                            key={format}
                            className="rounded bg-blue-900/40 px-2 py-0.5 text-xs text-blue-200"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    )}
                    {way.links && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {way.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-300 underline underline-offset-2 hover:text-blue-200"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Step>
          </div>
        </div>

        {/* Schema Capabilities */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="node-card group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-800/60 to-zinc-900 p-6 transition-all">
            <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Ontology</h3>
            <p className="text-sm text-gray-400">
              Use the RoboSystems ontology, with its domain extensions for the
              books (RoboLedger) and the portfolio (RoboInvestor). Or define
              your own ontology and materialize your graph from Parquet.
            </p>
          </div>
          <div className="node-card group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-800/60 to-zinc-900 p-6 transition-all">
            <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Dedicated Graph Instances
            </h3>
            <p className="text-sm text-gray-400">
              Each graph runs on its own graph-database instance, and its ledger
              in its own database schema, so your data never mixes with another
              organization&apos;s. Every graph is backed up nightly and
              downloads whole.
            </p>
          </div>
          <div className="node-card group rounded-xl border border-gray-800 bg-gradient-to-br from-zinc-800/60 to-zinc-900 p-6 transition-all">
            <div className="node-icon mb-4 flex h-12 w-12 items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
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
            <h3 className="mb-2 text-lg font-semibold text-white">
              Semantic Hybrid Search
            </h3>
            <p className="text-sm text-gray-400">
              Hybrid full-text and semantic search across filings, your
              documents and your AI&apos;s memory. In the graph, vector search
              finds nodes by meaning and follows their relationships in one
              Cypher query.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
