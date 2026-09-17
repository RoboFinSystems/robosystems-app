import type { TocHeading } from '@/lib/docs'
import { MCP_API_URL, MCP_CONNECTOR_NAME, MCP_OAUTH_URL } from '@/lib/mcp'
import Link from 'next/link'

// The opening of /docs/technical, where the retired /open-source page now redirects. The
// technical docs are written for the hosted platform (docs-surfaces D8), so this leads the
// same way: an account and key, a first request, an MCP client, the client libraries. The
// self-hosting topics the old page taught (run the stack, load SEC filings, deploy to AWS)
// follow, each in the shortest runnable form, and every topic hands off to the wiki page
// that owns the detail. It is app code rather than wiki text for one reason: the API and
// MCP addresses come from @/lib/mcp, so a staging build shows staging URLs. Everything
// else here is a command or a link, which keeps it from drifting the way the old page's
// prose did. No real company is named; a ticker is a placeholder.

export const GET_STARTED_HEADINGS: TocHeading[] = [
  { depth: 2, text: 'Get started', id: 'get-started' },
  {
    depth: 3,
    text: 'Create an account and API key',
    id: 'create-an-account-and-api-key',
  },
  { depth: 3, text: 'Make your first request', id: 'make-your-first-request' },
  { depth: 3, text: 'Connect an MCP client', id: 'connect-an-mcp-client' },
  { depth: 3, text: 'Client libraries', id: 'client-libraries' },
  { depth: 3, text: 'Run the stack locally', id: 'run-the-stack-locally' },
  {
    depth: 3,
    text: 'Deploy to your AWS account',
    id: 'deploy-to-your-aws-account',
  },
]

const heading = (id: string) => {
  const h = GET_STARTED_HEADINGS.find((entry) => entry.id === id)
  if (!h) throw new Error(`unknown get-started heading: ${id}`)
  return h.text
}

function External({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export function TechnicalGetStarted() {
  return (
    <section aria-labelledby="get-started">
      <h2 id="get-started">{heading('get-started')}</h2>
      <p>
        Every example here runs against the hosted API at{' '}
        <code>{MCP_API_URL}</code>. RoboSystems is also open source, and the
        last two steps run it on your own machine or in your own AWS account.
        Each step links to the page that covers it in full.
      </p>

      <h3 id="create-an-account-and-api-key">
        {heading('create-an-account-and-api-key')}
      </h3>
      <p>
        <Link href="/register">Sign up</Link>, then create a key under{' '}
        <Link href="/settings">Settings → API keys</Link>. A key can reach all
        your graphs or just one, and it is shown once, so put it in your
        environment straight away.
      </p>
      <pre>
        <code>{`export ROBOSYSTEMS_API_KEY=rfs...`}</code>
      </pre>
      <p>
        Full guide:{' '}
        <Link href="/docs/technical/authentication-and-api-keys">
          Authentication &amp; API Keys
        </Link>
        .
      </p>

      <h3 id="make-your-first-request">{heading('make-your-first-request')}</h3>
      <p>
        Send the key in the <code>X-API-Key</code> header. List the graphs you
        can reach, then query one with Cypher. A graph comes from{' '}
        <strong>Create Graph</strong> in the app, from connecting QuickBooks in{' '}
        <External href="https://roboledger.ai/docs">RoboLedger</External>, or
        from a subscription to the SEC repository, whose graph id is{' '}
        <code>sec</code>.
      </p>
      <pre>
        <code>{`curl -H "X-API-Key: $ROBOSYSTEMS_API_KEY" ${MCP_API_URL}/v1/graphs
export GRAPH_ID=kg...   # a graphId from that list

curl -X POST "${MCP_API_URL}/v1/graphs/$GRAPH_ID/query/cypher" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "MATCH (n) RETURN labels(n) AS label, count(*) AS count"}'`}</code>
      </pre>
      <p>
        Full guides: <Link href="/docs/technical/quick-start">Quick Start</Link>{' '}
        and{' '}
        <Link href="/docs/technical/querying-the-analytical-graph">
          Querying the Analytical Graph
        </Link>
        .
      </p>

      <h3 id="connect-an-mcp-client">{heading('connect-an-mcp-client')}</h3>
      <p>
        Every graph is a remote MCP server, and one address reaches all of them.
        Your client sends you to RoboSystems to sign in, and you choose the
        graph on the consent screen. There is no key to copy.
      </p>
      <pre>
        <code>{MCP_OAUTH_URL}</code>
      </pre>
      <p>
        It&apos;s a standard remote MCP server, so there is nothing to install:
        add the address as a connector in Claude, ChatGPT, Grok, Cursor, VS Code
        or any other MCP client, and sign in. In Claude Code it is one command:
      </p>
      <pre>
        <code>{`claude mcp add --transport http ${MCP_CONNECTOR_NAME} ${MCP_OAUTH_URL}`}</code>
      </pre>
      <p>
        Scripts, CI and clients that can&apos;t sign in pin one graph in the URL
        and send an API key instead. Use your graph id, or <code>sec</code> for
        the public SEC repository.
      </p>
      <pre>
        <code>{`URL:    ${MCP_API_URL}/v1/graphs/{GRAPH_ID}/mcp
Header: X-API-Key: <your API key>`}</code>
      </pre>
      <p>Then ask in plain language. On the SEC repository:</p>
      <ul>
        <li>
          &ldquo;Show me this company&apos;s revenue for the last five
          years.&rdquo;
        </li>
        <li>
          &ldquo;Compare gross margin across the last eight quarters.&rdquo;
        </li>
        <li>
          &ldquo;Which filers mention goodwill impairment in their latest
          10-K?&rdquo;
        </li>
      </ul>
      <p>On your own graph:</p>
      <ul>
        <li>&ldquo;What&apos;s blocking the month-end close?&rdquo;</li>
        <li>&ldquo;Show me last quarter&apos;s income statement.&rdquo;</li>
        <li>&ldquo;Which accounts are still unmapped?&rdquo;</li>
        <li>
          &ldquo;Remember what we found about margins so we can pick it up next
          time.&rdquo;
        </li>
        <li>
          &ldquo;Create a subgraph so we can try a different model without
          touching the main graph.&rdquo;
        </li>
      </ul>
      <p>
        Full guide:{' '}
        <Link href="/docs/technical/ai-operators-and-mcp">
          AI Operators &amp; MCP
        </Link>
        .
      </p>

      <h3 id="client-libraries">{heading('client-libraries')}</h3>
      <ul>
        <li>
          <strong>Python:</strong> <code>pip install robosystems-client</code> (
          <External href="https://pypi.org/project/robosystems-client/">
            PyPI
          </External>
          ,{' '}
          <External href="https://github.com/RoboFinSystems/robosystems-python-client">
            GitHub
          </External>
          )
        </li>
        <li>
          <strong>TypeScript:</strong>{' '}
          <code>npm install @robosystems/client</code> (
          <External href="https://www.npmjs.com/package/@robosystems/client">
            npm
          </External>
          ,{' '}
          <External href="https://github.com/RoboFinSystems/robosystems-typescript-client">
            GitHub
          </External>
          )
        </li>
        <li>
          <strong>MCP stdio bridge:</strong> <code>@robosystems/mcp</code>, for
          clients that only run local MCP servers (
          <External href="https://github.com/RoboFinSystems/robosystems-mcp-client">
            GitHub
          </External>
          )
        </li>
        <li>
          <strong>Integration template:</strong> connect your own data source
          from its own repository, through the public API, so it survives every
          upgrade and works against managed and self-hosted deployments alike (
          <External href="https://github.com/RoboFinSystems/robosystems-integration-template">
            GitHub
          </External>
          )
        </li>
      </ul>
      <p>
        The SDKs are generated from the live OpenAPI spec. Full guide:{' '}
        <Link href="/docs/technical/building-custom-integrations">
          Building Custom Integrations
        </Link>
        .
      </p>

      <h3 id="run-the-stack-locally">{heading('run-the-stack-locally')}</h3>
      <p>
        You need Docker, uv and just. One command starts the API, the graph
        database, PostgreSQL, Valkey and the orchestrator, and every example in
        these docs then works against <code>http://localhost:8000</code> with
        the demo account&apos;s key. SEC filings are free locally: load the
        companies you want by ticker.
      </p>
      <pre>
        <code>{`git clone https://github.com/RoboFinSystems/robosystems.git
cd robosystems
brew install uv just
just start               # the API answers at http://localhost:8000
just demo-user           # a demo account and API key, written to .local/config.json
just sec-load <TICKER>   # every available year for one company; add a year to load one`}</code>
      </pre>
      <p>
        Full guides:{' '}
        <Link href="/docs/technical/local-development">Local Development</Link>{' '}
        and{' '}
        <Link href="/docs/technical/sec-xbrl-pipeline">SEC XBRL Pipeline</Link>.
      </p>

      <h3 id="deploy-to-your-aws-account">
        {heading('deploy-to-your-aws-account')}
      </h3>
      <p>
        A fork deploys itself with GitHub Actions and CloudFormation. GitHub
        signs in to AWS through OIDC, so no long-lived AWS credentials are
        stored in GitHub. Bootstrap creates the identity provider, the deploy
        roles, the container registry and the repository&apos;s variables.
      </p>
      <pre>
        <code>{`aws configure sso --profile robosystems-sso
just bootstrap
just deploy prod`}</code>
      </pre>
      <p>
        The API deploys private by default, reachable only from inside the VPC.
        Public mode puts it behind an internet-facing load balancer with TLS on
        your own domain. Full guide:{' '}
        <Link href="/docs/technical/bootstrap-guide">Bootstrap Guide</Link>.
      </p>
      <hr />
    </section>
  )
}
