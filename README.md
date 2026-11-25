# RoboSystems App

**The web app for [RoboSystems](https://github.com/RoboFinSystems/robosystems), the open-source knowledge graph for finance.** Served at [robosystems.ai](https://robosystems.ai): the public site, the docs and the blog, and the signed-in app where you create graphs, connect your AI agents to them over MCP, query them, keep documents on them and manage the subscription.

It works with all three kinds of graph the platform runs: your company's graph, shared repositories of public data (today, the SEC repository of 8,000+ filers), and generic graphs you define from your own schema. Ledger work happens in [roboledger-app](https://github.com/RoboFinSystems/roboledger-app) and portfolio work in [roboinvestor-app](https://github.com/RoboFinSystems/roboinvestor-app); one sign-in covers all three.

## What it does

- **Graphs**: create an entity graph or a generic graph, choose its tier, and see its size, details and members
- **MCP**: connect any MCP client (Claude, ChatGPT, Cursor) to a graph or one of its subgraphs, by OAuth or with a key scoped to that graph
- **Console**: ask questions of the selected graph, in plain language or Cypher, from a drawer on every page; `/do` makes a change instead. It runs on the platform's AI, so it uses credits
- **Search and Knowledge Base**: full-text and semantic search across a graph's documents or the SEC filings, and documents of your own to create and edit
- **Memory**: browse and edit the per-graph store your AI agents remember to and recall from
- **Data Lake**: the graph's DuckDB staging tables, from Parquet you upload or from a ledger's or portfolio's records, ingested into the graph
- **Schema**: the node and relationship types in the graph, with their properties
- **Subgraphs**: isolated workspaces beside a graph, for development, agent scratch data and teams
- **Backups**: create a copy of the graph and download it
- **Repositories**: subscribe to shared repositories such as the SEC repository
- **Activity**: every change made to a graph through the API, MCP clients and AI Operators, with who made it
- **Usage, billing and organization**: credits, storage and limits; subscriptions and invoices; members and invitations
- **Account**: profile, password, passkeys, API keys and connected apps
- **Docs**: product guides, the technical docs, and the REST API and extensions references, rendered from the live API

A tour for the app's users: [Find your way around the app](https://robosystems.ai/docs/guides/the-robosystems-app).

## Quick Start

Needs Node.js 26 (see `.nvmrc`) and a RoboSystems API: `just start` in a [robosystems](https://github.com/RoboFinSystems/robosystems) checkout, or a hosted one. Against a local API, sign in with the demo user that `just demo-user` creates there.

```bash
npm install
cp .env.example .env     # points at a local API on http://localhost:8000
npm run dev              # http://localhost:3000
```

**In Docker instead.** From the backend checkout, `just start apps` runs the published images of all three apps against your local API: RoboSystems on http://localhost:3000, RoboLedger on 3001, RoboInvestor on 3002. To build them from your checkouts, run `just clone-apps`, comment out the `*_APP_IMAGE` / `*_APP_PULL_POLICY` pairs in the backend's `.env`, and run `just start apps build`. In that profile the landing page shows a maintenance screen; sign in at `/login`. More: [Local Development](https://robosystems.ai/docs/technical/local-development).

The settings that matter locally, all in `.env.example`:

| Variable                                                                                                | Purpose                                                       |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_ROBOSYSTEMS_API_URL`                                                                       | The API the app calls                                         |
| `NEXT_PUBLIC_ROBOSYSTEMS_APP_URL`, `NEXT_PUBLIC_ROBOLEDGER_APP_URL`, `NEXT_PUBLIC_ROBOINVESTOR_APP_URL` | The three apps, for moving between them signed in             |
| `NEXT_PUBLIC_S3_ENDPOINT_URL`                                                                           | The local stack's S3 server, for uploads; unset in production |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                                                        | Cloudflare Turnstile on the public forms; empty turns it off  |

### Deploying your own

1. Fork this repository and the [robosystems](https://github.com/RoboFinSystems/robosystems) backend.
2. Run `just bootstrap` in the backend: it deploys OIDC and sets this repository's `AWS_ROLE_ARN`, `AWS_ACCOUNT_ID` and `AWS_REGION`.
3. Run `npm run setup:gha` here to set the remaining deployment variables.
4. Deploy with `npm run deploy:staging` or `npm run deploy:prod`, which run the deployment workflows.

The compute is chosen by the `APP_COMPUTE` GitHub variable (`apprunner` by default; per environment with `APP_COMPUTE_PROD` / `APP_COMPUTE_STAGING`). App Runner is closed to new AWS customers, so an account that has never used it must set `APP_COMPUTE=ecs-express`. Without a default VPC, also set `ECS_SUBNETS` to comma-separated public subnet IDs in at least two AZs. See the [Bootstrap Guide](https://robosystems.ai/docs/technical/bootstrap-guide).

## Development

```bash
npm run dev              # development server on port 3000
npm run build            # production build (npm run start to serve it)
npm run test             # Vitest suite
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # coverage report
npm run test:all         # tests, then format, lint fix, typecheck and cfn-lint
npm run lint             # ESLint (lint:fix to fix)
npm run format:check     # Prettier (format to write)
npm run typecheck        # TypeScript
```

`test:all` rewrites files (Prettier and `eslint --fix`), and its `cfn-lint` step runs through `uvx`, so it needs [uv](https://docs.astral.sh/uv/).

Shared components come from [`@robosystems/core`](https://www.npmjs.com/package/@robosystems/core) ([robosystems-core](https://github.com/RoboFinSystems/robosystems-core)), used by all three apps. Changes are made there and reach this app through a version bump: `npm install @robosystems/core@latest`.

## Architecture

- **Next.js 16** App Router, React 19, TypeScript 5 and Tailwind CSS 4
- **[`@robosystems/core`](https://www.npmjs.com/package/@robosystems/core)**: sign-in and session, the graph, organization and entity contexts, the graph creation wizard, the console, background-job progress over SSE, the docs renderer, and the UI primitives in `@robosystems/core/ui`
- **[`@robosystems/client`](https://www.npmjs.com/package/@robosystems/client)**: every call to the API. The app signs in with short-lived JWTs; see [Authentication & API Keys](https://robosystems.ai/docs/technical/authentication-and-api-keys)
- **Docs and blog**: the guides and technical docs are published from the backend repository to the content CDN and rendered here; the API and extensions references are rendered on the server from the running API's OpenAPI spec and GraphQL schema

**On AWS:** App Runner or ECS Express Mode behind CloudFront, with static assets on S3, deployed from the CloudFormation templates in [`cloudformation/`](cloudformation/) by GitHub Actions. A multi-arch image is also published to Docker Hub as `robofinsystems/robosystems-app`, which is what `just start apps` runs.

## Documentation

- **Product guides**: [robosystems.ai/docs/guides](https://robosystems.ai/docs/guides)
- **Technical docs**: [robosystems.ai/docs/technical](https://robosystems.ai/docs/technical). For this app: [Local Development](https://robosystems.ai/docs/technical/local-development) · [AI Operators & MCP](https://robosystems.ai/docs/technical/ai-operators-and-mcp) · [Bootstrap Guide](https://robosystems.ai/docs/technical/bootstrap-guide)
- **API reference**: [robosystems.ai/docs/api](https://robosystems.ai/docs/api)

## Support

- [Issues](https://github.com/RoboFinSystems/robosystems-app/issues) · [Discussions](https://github.com/orgs/RoboFinSystems/discussions) · [Projects](https://github.com/orgs/RoboFinSystems/projects)
- [CONTRIBUTING.md](.github/CONTRIBUTING.md): branch conventions, coding standards and the pull request process

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details. The license does not cover the RoboSystems and RoboLedger names or logos; see [NOTICE](NOTICE).

Apache-2.0 © 2026 RFS LLC
