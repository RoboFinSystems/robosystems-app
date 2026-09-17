// A code sample outside the prose wrapper, so an example keeps its own width and does not
// pick up the typography plugin's `pre` margins.

export function CodeBlock({
  children,
  label,
}: {
  children: string
  label?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      {label && (
        <div className="border-b border-gray-800 px-4 py-2 font-mono text-xs text-gray-500">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-gray-200">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  )
}
