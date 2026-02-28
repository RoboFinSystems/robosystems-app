import FloatingElementsVariant from '@/components/landing/FloatingElementsVariant'

export default function ClientLibraries() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-zinc-900 to-black py-16 sm:py-20">
      <FloatingElementsVariant variant="os-client-libs" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">
            Client Libraries & SDKs
          </h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            Install RoboSystems client libraries for your preferred programming
            language
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* TypeScript/JavaScript */}
          <div className="group rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-blue-950/20 p-6 transition-all hover:border-blue-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M0 0v24h24v-24h-24zm19.5 16.5h-3v3h-9v-3h-3v-9h15v9z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              TypeScript / JavaScript
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Official TypeScript client with React components and hooks.
            </p>
            <div className="rounded bg-black p-2">
              <code className="text-xs text-gray-300">
                npm install @robosystems/client
              </code>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.npmjs.com/package/@robosystems/client"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                npm →
              </a>
              <a
                href="https://github.com/RoboFinSystems/robosystems-typescript-client"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                GitHub →
              </a>
            </div>
          </div>

          {/* Python */}
          <div className="group rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-green-950/20 p-6 transition-all hover:border-green-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <svg
                className="h-6 w-6 text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Python</h3>
            <p className="mb-4 text-sm text-gray-400">
              Python client library with Jupyter notebook support.
            </p>
            <div className="rounded bg-black p-2">
              <code className="text-xs text-gray-300">
                pip install robosystems-client
              </code>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://pypi.org/project/robosystems-client/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                PyPI →
              </a>
              <a
                href="https://github.com/RoboFinSystems/robosystems-python-client"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                GitHub →
              </a>
            </div>
          </div>

          {/* MCP Tools */}
          <div className="group rounded-xl border border-gray-800 bg-linear-to-br from-zinc-900 to-purple-950/20 p-6 transition-all hover:border-purple-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                className="h-6 w-6 text-purple-400"
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
            <h3 className="mb-3 text-xl font-semibold text-white">
              MCP Client
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Model Context Protocol client for AI agent integration.
            </p>
            <div className="rounded bg-black p-2">
              <code className="text-xs text-gray-300">
                npx -y @robosystems/mcp
              </code>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.npmjs.com/package/@robosystems/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                npm →
              </a>
              <a
                href="https://github.com/RoboFinSystems/robosystems-mcp-client"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
