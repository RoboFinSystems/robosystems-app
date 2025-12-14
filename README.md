# RoboSystems App

RoboSystems App is the graph database management interface for the RoboSystems platform, providing developers and data engineers with powerful tools to create, manage, and query financial knowledge graphs.

- **Graph Database Management**: Create and manage graph databases with visual schema designers and multi-tenant isolation
- **Interactive Query Interface**: Execute Cypher queries with syntax highlighting, real-time results, and export capabilities
- **Schema Definition Tools**: Design custom graph schemas with node and relationship type builders for any data model
- **Subgraph Management**: Create isolated subgraphs for versioning, access control, and AI memory layers
- **Shared Repository Access**: Query SEC XBRL filings and public financial data from shared knowledge graphs

## Core Features

RoboSystems App is the primary interface for managing graph databases on the RoboSystems platform. While RoboLedger handles QuickBooks integration and RoboInvestor manages investment data, RoboSystems App focuses on the foundational graph infrastructure that powers these specialized applications.

- **Entity Graph Creation**: Launch new graph databases with predefined schemas for RoboLedger, RoboInvestor, and other entity types
- **Generic Graph Builder**: Design custom graph schemas for any use case with flexible node and relationship definitions
- **Query Playground**: Interactive Cypher query editor with auto-completion, syntax validation, and result visualization
- **Schema Explorer**: Visual schema inspection showing node types, relationships, and property definitions
- **Subgraph Workflows**: Create, manage, and query subgraphs with independent schemas and access controls
- **Database Analytics**: Monitor query performance, storage usage, and database health metrics
- **API Key Management**: Generate and manage API keys for programmatic database access
- **Credit Usage Tracking**: Monitor AI operation credits and storage usage across your organization

## Quick Start

### Development Environment

```bash
# Clone the repository
git clone https://github.com/RoboFinSystems/robosystems-app.git
cd robosystems-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoint

# Start development server
npm run dev
```

The application will be available at: http://localhost:3000

### Docker Development

```bash
# Build and run with Docker
docker build -t robosystems-app .
docker run -p 3000:3000 --env-file .env robosystems-app
```

## Development Commands

### Core Development

```bash
npm run dev              # Start development server (port 3000)
npm run build           # Production build with optimization
```

### Code Quality

```bash
npm run lint            # ESLint validation
npm run lint:fix        # Auto-fix linting issues
npm run format          # Prettier code formatting
npm run format:check    # Check formatting compliance
npm run typecheck       # TypeScript type checking
```

### Testing

```bash
npm run test            # Run Vitest test suite
npm run test:watch      # Interactive test watch mode
npm run test:coverage   # Generate coverage report
npm run test:all        # All tests and code quality checks
```

### SDLC Commands

```bash
npm run feature:create  # Create a feature branch
npm run pr:create       # Create pull request
npm run release:create  # Create GitHub release
npm run deploy:staging  # Deploy to staging environment
npm run deploy:prod     # Deploy to production
```

### Core Subtree Management

```bash
npm run core:pull       # Pull latest core subtree updates
npm run core:push       # Push core subtree changes
npm run core:add        # Add core subtree
```

### Prerequisites

#### System Requirements

- Node.js 22+ (LTS recommended)
- npm 10+ or yarn 1.22+
- 4GB RAM minimum
- Modern browser (Chrome, Firefox, Safari, Edge)

#### Required Services

- RoboSystems API endpoint (production or development)
- Optional: AWS account for production deployment

## Architecture

### Application Layer

- **Next.js 15 App Router** with React Server Components for optimal performance
- **TypeScript 5** for type safety and developer experience
- **Flowbite React Components** with Tailwind CSS for consistent UI
- **RoboSystems Client SDK** for API communication and authentication

### Key Application Features

#### Graph Management (`/app/(app)/graphs/`)

The primary interface for creating and managing graph databases:

- **Graph Creation Wizard**: Step-by-step workflow for creating entity or generic graphs
- **Graph List View**: Overview of all graphs with status, tier, and usage metrics
- **Graph Settings**: Configuration for database tier, access control, and retention

#### Query Interface (`/app/(app)/query/`)

Interactive query playground for graph exploration:

- **Cypher Editor**: Monaco-based editor with syntax highlighting and auto-completion
- **Query History**: Save and replay previous queries
- **Result Viewer**: Tabular and JSON views with export to CSV/JSON
- **Query Templates**: Pre-built queries for common operations

#### Schema Designer (`/app/(app)/schema/`)

Visual tools for defining and inspecting graph schemas:

- **Schema Builder**: Drag-and-drop interface for creating nodes and relationships
- **Property Editor**: Define property types, constraints, and indexes
- **Schema Validation**: Real-time validation of schema definitions
- **Import/Export**: Share schemas as JSON or YAML

#### Subgraph Management (`/app/(app)/subgraphs/`)

Tools for creating and managing subgraphs:

- **Subgraph Creation**: Define subgraphs with custom schemas
- **Access Control**: Manage permissions at the subgraph level
- **Version History**: Track schema changes and data evolution
- **AI Memory Layers**: Special subgraphs for AI agent context

#### Shared Repositories (`/app/(app)/shared-repositories/`)

Access to public financial knowledge graphs:

- **SEC XBRL**: Subscribe to the SEC XBRL shared repository knowledge graph
- **MCP Client Config**: Create API Keys for accessing the MCP server
- **AI Credit Management**: View and manage subscription AI credits to use AI agents

### Core Library (`/src/lib/core/`)

Shared authentication and utility modules maintained as a git subtree:

- **Auth Components**: Login/register forms with RoboSystems branding
- **Auth Core**: Session management and JWT handling
- **UI Components**: Consistent interface elements across RoboSystems apps
- **Contexts**: User, company, and credit system contexts
- **Task Monitoring**: Background SSE job progress tracking

## CI/CD

### GitHub Actions Setup

Configure GitHub repository secrets and variables using the automated setup script:

```bash
# Run the GitHub Actions setup script
npm run setup:gha

# Or run directly
./bin/gha-setup
```

This will guide you through configuring all required secrets and variables for the CI/CD pipeline.

### GitHub Actions Workflows

#### Primary Deployment Workflows

- **`prod.yml`**: Production deployment pipeline
  - Manual deployment via workflow_dispatch
  - Deploys to robosystems.ai with S3 static hosting
  - Full testing, build, and ECS deployment
  - Auto-scaling configuration with Fargate Spot

- **`staging.yml`**: Staging environment deployment
  - Manual workflow dispatch
  - Deploys to staging.robosystems.ai
  - Integration testing environment

- **`test.yml`**: Automated testing suite
  - Runs on pull requests and main branch
  - TypeScript, ESLint, and Prettier checks
  - Vitest unit and integration tests
  - Build verification

- **`build.yml`**: Docker image building
  - Multi-architecture support (AMD64/ARM64)
  - Pushes to Amazon ECR
  - Static asset upload to S3

### CloudFormation Templates

Infrastructure as Code templates in `/cloudformation/`:

- **`template.yaml`**: Complete ECS Fargate stack with auto-scaling
- **`s3.yaml`**: Static asset hosting for CloudFront CDN

## Support

- Issues: [GitHub Issues](https://github.com/RoboFinSystems/robosystems-app/issues)
- Discussions: [GitHub Discussions](https://github.com/RoboFinSystems/robosystems-app/discussions)
- Projects: [GitHub Projects](https://github.com/RoboFinSystems/robosystems-app/projects)
- Wiki: [GitHub Wiki](https://github.com/RoboFinSystems/robosystems-app/wiki)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT © 2025 RFS LLC
