# Contributing to RoboSystems App

Thank you for your interest in contributing to RoboSystems App! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/robosystems-app.git
   cd robosystems-app
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/RoboFinSystems/robosystems-app.git
   ```
4. **Set up your development environment** (see [Development Setup](#development-setup))

## Development Process

We use GitHub flow with automated tooling for our development process:

1. Create a feature branch using our tooling
2. Make your changes in small, atomic commits
3. Write or update tests for your changes
4. Update documentation as needed
5. Create a Claude-powered PR to the `main` branch

### Branch Creation and Naming

Use our automated branch creation tool with `npm`:

```bash
# Create a new feature branch
npm run feature:create feature add-graph-export main

# Create a bugfix branch
npm run feature:create bugfix fix-query-timeout main

# Create a hotfix branch
npm run feature:create hotfix critical-auth-patch main

# Create a chore branch
npm run feature:create chore update-dependencies main

# Create a refactor branch
npm run feature:create refactor improve-error-handling main
```

**Branch Types:**

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes for existing functionality
- `hotfix/` - Critical fixes that need immediate attention
- `chore/` - Maintenance tasks (deps, configs, etc.)
- `refactor/` - Code refactoring without functional changes

**Note:** All PRs must target the `main` branch only.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- System information (OS, Node.js version, browser)
- Relevant console logs or error messages
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear, descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Mockups or examples if applicable
- Possible implementation approach

### First-Time Contributors

Look for issues labeled `good first issue` or `help wanted`. These are great starting points for new contributors.

## Development Setup

### Prerequisites

- Node.js 22.x+ (check `.nvmrc`)
- npm 10.x+
- Git configured with your GitHub account
- VS Code (recommended) with recommended extensions

### Local Development Environment

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### Environment Configuration

Create a `.env` file with required configuration:

```env
# Required
NEXT_PUBLIC_ROBOSYSTEMS_API_URL=https://api.robosystems.ai  # or http://localhost:8000 for local

# Optional
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

## Coding Standards

### TypeScript Code Style

- **Formatter**: Prettier with configuration
- **Linter**: ESLint with Next.js rules
- **Type checking**: TypeScript strict mode
- **Import sorting**: Prettier plugin

Run code quality checks:

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run typecheck     # TypeScript type checking
```

### Commit Messages

Follow the Conventional Commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

Examples:

```
feat(graphs): add query export functionality
fix(auth): resolve session timeout issue
docs(readme): update deployment instructions
```

### Code Organization

- Follow existing project structure
- Use functional components with hooks
- Keep components focused and single-purpose
- Add TypeScript types for all props and returns
- Write JSDoc comments for complex logic

## Testing

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve code coverage
- Tests must pass locally before submitting PR

### Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- GraphList.test.tsx
```

### Writing Tests

- Use React Testing Library for component tests
- Use Vitst for unit tests
- Mock external dependencies
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example test structure:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { GraphList } from '../GraphList'

describe('GraphList', () => {
  it('should render graphs correctly', () => {
    // Arrange
    const graphs = [{ id: '1', name: 'Test Graph' }]

    // Act
    render(<GraphList graphs={graphs} />)

    // Assert
    expect(screen.getByText('Test Graph')).toBeInTheDocument()
  })

  it('should handle graph selection', () => {
    // Arrange
    const onSelect = vi.fn()
    render(<GraphList graphs={[]} onSelect={onSelect} />)

    // Act
    fireEvent.click(screen.getByRole('button'))

    // Assert
    expect(onSelect).toHaveBeenCalled()
  })
})
```

## Documentation

### Documentation Requirements

- Update README.md for significant changes
- Add JSDoc comments to exported functions
- Update component documentation
- Include inline comments for complex logic
- Update environment variable documentation if needed

### Component Documentation

Document React components with TypeScript interfaces:

```typescript
/**
 * Displays a list of graphs with filtering and sorting
 *
 * @example
 * <GraphList
 *   graphs={userGraphs}
 *   onSelect={handleGraphSelect}
 *   sortBy="created"
 * />
 */
interface GraphListProps {
  /** Array of graph objects to display */
  graphs: Graph[]
  /** Callback when a graph is selected */
  onSelect: (graph: Graph) => void
  /** Optional sorting criteria */
  sortBy?: 'name' | 'created' | 'modified'
}
```

## Pull Request Process

### Creating a Pull Request

We use an automated Claude-powered PR creation process:

```bash
# Create a PR with Claude analysis and review (default)
npm run pr:create

# Create a PR targeting main with Claude review
npm run pr:create main true

# Create a PR without Claude review (faster)
npm run pr:create main false
```

This will:

1. Analyze your changes using Claude AI
2. Generate a comprehensive PR description
3. Include test results and impact analysis
4. Create the PR on GitHub automatically

### Before Creating a PR

1. **Commit all changes**:

   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

2. **Update from upstream**:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

3. **Run all checks locally**:

   ```bash
   npm run test:all
   ```

4. **Push your branch**:
   ```bash
   git push origin your-branch-name
   ```

### PR Requirements

- All tests must pass
- Code must pass linting and formatting checks
- Must not decrease test coverage significantly
- Must include appropriate documentation updates
- Claude review is recommended for complex changes
- Must be reviewed by at least one maintainer

### Manual PR Creation

If needed, you can create a PR manually:

```bash
gh pr create --base main --title "Your PR title" --body "Your PR description"
```

### Review Process

1. Claude will analyze and create your PR automatically
2. Review the generated PR description and make adjustments
3. Address reviewer feedback promptly
4. Keep PR focused - one feature/fix per PR
5. Update PR based on feedback
6. Maintainer will merge once approved

## Release Process

### Creating a Release

Releases are created using our automated tooling:

```bash
# Create a patch release and deploy to staging
npm run release:create patch staging

# Create a minor release and deploy to staging
npm run release:create minor staging

# Create a major release (no auto-deploy)
npm run release:create major none
```

This will:

1. Create a release branch
2. Update version in package.json
3. Generate changelog
4. Create a release PR
5. Optionally trigger deployment

## Security

### Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security@robosystems.ai with details
2. Include steps to reproduce if possible
3. Allow time for the issue to be addressed before public disclosure

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Validate and sanitize all user inputs
- Keep dependencies up to date
- Follow OWASP guidelines for web security

## VS Code Integration

### Recommended Extensions

The project includes VS Code recommendations. Install them via:

1. Open Command Palette (`Cmd+Shift+P`)
2. Run `Extensions: Show Recommended Extensions`
3. Install all workspace recommendations

### VS Code Tasks

Use Command Palette > `Tasks: Run Task` for:

- **RoboSystems App Dev**: Start development server
- **Test All**: Run all quality checks
- **Create Feature**: Create feature branch
- **Create PR**: Create pull request
- **Core Pull/Push**: Manage core subtree

## Core Library Management

The `/src/lib/core` directory is a git subtree shared across RoboSystems apps:

```bash
# Pull latest core changes
npm run core:pull

# Push core changes (coordinate with team)
npm run core:push

# Initial subtree setup (rarely needed)
npm run core:add
```

**Important**: Core library changes affect multiple applications. Coordinate with the team before pushing changes.

## Questions and Support

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Documentation**: [docs.robosystems.ai](https://docs.robosystems.ai)
- **API Reference**: [api.robosystems.ai/docs](https://api.robosystems.ai/docs)

## Recognition

Contributors will be recognized in our [Contributors](https://github.com/RoboFinSystems/robosystems-app/graphs/contributors) page.

Thank you for contributing to RoboSystems App! 🚀
