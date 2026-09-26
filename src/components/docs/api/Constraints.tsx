// A field's or parameter's validation limits as one line. A pattern is shown as code,
// because a regex set in prose is unreadable; the ranges read as words.

export function Constraints({ values }: { values: string[] }) {
  return (
    <>
      Constraints:{' '}
      {values.map((value, i) => {
        const pattern = value.startsWith('matches ')
          ? value.slice('matches '.length)
          : null
        return (
          <span key={value}>
            {i > 0 && '; '}
            {pattern ? (
              <>
                matches{' '}
                <code className="font-mono break-all text-gray-400">
                  {pattern}
                </code>
              </>
            ) : (
              value
            )}
          </span>
        )
      })}
    </>
  )
}
