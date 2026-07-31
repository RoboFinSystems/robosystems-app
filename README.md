# RoboSystems App

RoboSystems App is the web interface for the RoboSystems financial intelligence platform — unifying structured data, document search, and AI-powered insights in one application.

- **Knowledge Graph Management**: Create and manage multiple isolated graph databases with tiered infrastructure
- **Document Search**: Full-text and semantic search across SEC filings, uploaded documents, and connected sources
- **AI Console**: Natural language and Cypher query terminal with streaming results and MCP integration
- **AI Memory**: Browse, edit, and curate the per-graph semantic memory store behind remember/recall
- **Schema Explorer**: Inspect node labels, relationships, constraints, and indexes
- **Subgraph Workspaces**: Create isolated environments for development, testing, and collaboration
- **Data Lake**: DuckDB staging tables for data validation and bulk ingestion
- **Shared Repository Access**: Subscribe to and query SEC XBRL filings and public financial data
- **Research**: Public equity research pages built from SEC filings, every figure traceable to a filing
- **Backup Management**: Create, download, and restore graph database backups
- **Billing & Usage**: Manage subscriptions, view invoices, and track credit usage
- **Organization Management**: Manage team members and organization settings

## Quick Start

```bash
npm install              # Install dependencies
cp .env.example .env     # Configure environment (edit with your API endpoint)
npm run dev              # Start development server
```

The application will be available at http://localhost:3000

## Development Commands

### Core Development

```bash
npm run dev              # Start development server (port 3000)
npm run build            # Production build
```

### Testing

```bash
npm run test:all         # All tests and code quality checks
npm run test             # Run Vitest test suite
npm run test:coverage    # Generate coverage report
```

### Code Quality

```bash
npm run lint             # ESLint validation
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier code formatting
npm run format:check     # Check formatting compliance
npm run typecheck        # TypeScript type checking
```

### SDLC Commands

```bash
npm run feature:create   # Create a feature branch
npm run release:create   # Create GitHub release
npm run deploy:staging   # Deploy to staging environment
npm run deploy:prod      # Deploy to production
```

### Shared Core Library

Shared components live in the [`@robosystems/core`](https://www.npmjs.com/package/@robosystems/core) npm package (repo: [robosystems-core](https://github.com/RoboFinSystems/robosystems-core)). Bump the pinned version to pick up changes:

```bash
npm install @robosystems/core@latest
```

### Prerequisites

#### System Requirements

- Node.js 24+ (LTS)
- 4GB RAM minimum
- Modern browser (Chrome, Firefox, Safari, Edge)

#### Required Services

- RoboSystems API endpoint (local development or production)

#### Deployment Requirements

- Fork this repo (and the [robosystems](https://github.com/RoboFinSystems/robosystems) backend)
- AWS account with IAM Identity Center (SSO)
- Run `npm run setup:bootstrap` to configure OIDC and GitHub variables

See the **[Bootstrap Guide](https://github.com/RoboFinSystems/robosystems/wiki/Bootstrap-Guide)** for complete instructions including access modes (internal, public).

## Architecture

**Application Layer:**

- Next.js 16 App Router
- TypeScript 5 for type safety
- Flowbite React with Tailwind CSS for UI components
- RoboSystems Client SDK for API communication

**Core Library ([`@robosystems/core`](https://www.npmjs.com/package/@robosystems/core)):**

Shared modules consumed as an npm package across RoboSystems frontend apps:

- Auth components (login, register, password reset)
- Session management and JWT handling
- Graph creation wizard and shared components
- Layout, forms, chat, and settings components
- Graph, organization, and entity contexts
- SSE-based background job progress tracking

**Infrastructure:**

- AWS App Runner with auto-scaling
- S3 + CloudFront for static asset hosting
- CloudFormation templates in `/cloudformation/`

## Support

- [Issues](https://github.com/RoboFinSystems/robosystems-app/issues)
- [Wiki](https://github.com/RoboFinSystems/robosystems/wiki)
- [Projects](https://github.com/orgs/RoboFinSystems/projects)
- [Discussions](https://github.com/orgs/RoboFinSystems/discussions)

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

Apache-2.0 © 2026 RFS LLC
