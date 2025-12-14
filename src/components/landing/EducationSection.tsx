import Link from 'next/link'

export default function EducationSection() {
  return (
    <section id="education" className="bg-black py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:mb-6 sm:text-4xl md:text-5xl">
            Learn & Master RoboSystems
          </h2>
          <p className="mx-auto max-w-3xl text-base text-gray-300 sm:text-lg md:text-xl">
            Comprehensive education resources for financial analysts,
            developers, and AI systems. Master Cypher queries, deploy your own
            infrastructure, and build on our platform.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cypher Query Training */}
          <div className="rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800 p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/20">
              <svg
                className="h-7 w-7 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4.172-4.172a4 4 0 015.656 0L28 24m0 0l-8-8m8 8H12"
                />
              </svg>
            </div>
            <h3 className="font-heading mb-4 text-xl font-semibold text-white">
              Cypher Query Mastery
            </h3>
            <p className="mb-6 text-gray-300">
              Learn to query financial knowledge graphs with Cypher, the
              powerful graph query language.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-cyan-400">•</span>
                Beginner tutorials for financial analysts
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-cyan-400">•</span>
                Advanced pattern matching for complex relationships
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-cyan-400">•</span>
                AI-assisted query generation examples
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-cyan-400">•</span>
                Financial-specific query templates
              </li>
            </ul>
            <Link
              href="/learn/cypher"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Start Learning Cypher
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Platform Documentation */}
          <div className="rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800 p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20">
              <svg
                className="h-7 w-7 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="font-heading mb-4 text-xl font-semibold text-white">
              Comprehensive Documentation
            </h3>
            <p className="mb-6 text-gray-300">
              Deep technical documentation for developers and AI systems
              building on RoboSystems.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-blue-400">•</span>
                API reference and SDK guides
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400">•</span>
                Knowledge graph schema documentation
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400">•</span>
                MCP tool integration tutorials
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400">•</span>
                AI-readable documentation format
              </li>
            </ul>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Browse Documentation
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* AWS Deployment Training */}
          <div className="rounded-2xl border border-gray-800 bg-linear-to-br from-zinc-900 to-zinc-800 p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/20">
              <svg
                className="h-7 w-7 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h3 className="font-heading mb-4 text-xl font-semibold text-white">
              Deployment Training
            </h3>
            <p className="mb-6 text-gray-300">
              Learn to deploy and maintain RoboSystems on your own AWS
              infrastructure.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-orange-400">•</span>
                AWS CloudFormation deployment guides
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-400">•</span>
                GitHub Actions CI/CD pipelines
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-400">•</span>
                Infrastructure scaling best practices
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-400">•</span>
                Monitoring and maintenance training
              </li>
            </ul>
            <Link
              href="/training/deployment"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              View Training Programs
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Blog & Articles */}
          <div className="rounded-2xl bg-linear-to-r from-purple-900/20 to-blue-900/20 p-8">
            <h3 className="mb-6 text-2xl font-semibold text-white">
              Latest Articles & Insights
            </h3>
            <div className="space-y-4">
              <article className="border-b border-gray-700 pb-4">
                <h4 className="mb-2 font-semibold text-white">
                  <Link
                    href="/blog/graph-rag-financial-analysis"
                    className="hover:text-cyan-400"
                  >
                    How GraphRAG Transforms Financial Analysis
                  </Link>
                </h4>
                <p className="text-sm text-gray-400">
                  Explore how knowledge graphs enhance AI's understanding of
                  complex financial relationships...
                </p>
              </article>
              <article className="border-b border-gray-700 pb-4">
                <h4 className="mb-2 font-semibold text-white">
                  <Link
                    href="/blog/cypher-for-accountants"
                    className="hover:text-cyan-400"
                  >
                    Cypher Queries for Accountants: A Practical Guide
                  </Link>
                </h4>
                <p className="text-sm text-gray-400">
                  Learn essential Cypher patterns for common accounting queries
                  and financial analysis...
                </p>
              </article>
              <article className="pb-4">
                <h4 className="mb-2 font-semibold text-white">
                  <Link
                    href="/blog/ai-financial-automation"
                    className="hover:text-cyan-400"
                  >
                    Building AI Agents for Financial Process Automation
                  </Link>
                </h4>
                <p className="text-sm text-gray-400">
                  Step-by-step guide to creating intelligent agents that
                  automate financial workflows...
                </p>
              </article>
            </div>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
            >
              View All Articles
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Community & Support */}
          <div className="rounded-2xl bg-linear-to-r from-green-900/20 to-blue-900/20 p-8">
            <h3 className="mb-6 text-2xl font-semibold text-white">
              Community & Support
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 font-semibold text-white">
                  GitHub Community
                </h4>
                <p className="mb-4 text-sm text-gray-300">
                  Join our active GitHub community for project planning, issue
                  tracking, and contributing to the platform.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="https://github.com/RoboFinSystems/robosystems/projects"
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Projects
                  </Link>
                  <Link
                    href="https://github.com/RoboFinSystems/robosystems/issues"
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Report Issues
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-white">
                  Professional Training
                </h4>
                <p className="mb-4 text-sm text-gray-300">
                  Get certified in RoboSystems deployment and administration
                  with our professional training programs.
                </p>
                <Link
                  href="/training"
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  Explore Training Options
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
