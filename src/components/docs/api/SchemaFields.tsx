import { Constraints } from '@/components/docs/api/Constraints'
import { InlineMarkdown } from '@/components/docs/InlineMarkdown'
import type { ApiCatalog, SchemaObject } from '@/lib/openapi'
import { schemaFields, schemaUnion } from '@/lib/openapi-schema'

// A model's fields as a table, with a nested model opening its own table underneath. The
// tables are plain HTML rather than a client-side schema explorer, because the whole point
// of moving the reference off the API host is that a crawler reads the fields without
// running anything.

function FieldTable({
  catalog,
  schema,
  depth,
  seen,
}: {
  catalog: ApiCatalog
  schema: SchemaObject | undefined
  depth: number
  seen: string[]
}) {
  const fields = schemaFields(catalog, schema, depth, seen)
  if (fields.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-900/70 text-xs tracking-wide text-gray-500 uppercase">
            <th scope="col" className="px-4 py-2 font-semibold">
              Field
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Type
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name} className="border-t border-gray-800 align-top">
              <td className="px-4 py-3">
                <code className="font-mono text-cyan-300">{field.name}</code>
                <span className="mt-1 block text-xs text-gray-500">
                  {field.required ? 'required' : 'optional'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-400">
                {field.type}
              </td>
              <td className="px-4 py-3 text-gray-300">
                {field.description && (
                  <p>
                    <InlineMarkdown>{field.description}</InlineMarkdown>
                  </p>
                )}
                {field.enumValues.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    One of:{' '}
                    {field.enumValues.map((value, i) => (
                      <span key={value}>
                        {i > 0 && ', '}
                        <code className="font-mono text-gray-400">{value}</code>
                      </span>
                    ))}
                  </p>
                )}
                {field.defaultValue !== null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Default:{' '}
                    <code className="font-mono text-gray-400">
                      {field.defaultValue}
                    </code>
                  </p>
                )}
                {field.constraints.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    <Constraints values={field.constraints} />
                  </p>
                )}
                {field.nested && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-cyan-400">
                      {field.nested.name} fields
                    </summary>
                    <div className="mt-3">
                      <FieldTable
                        catalog={catalog}
                        schema={field.nested.schema}
                        depth={depth + 1}
                        seen={[...seen, field.nested.name]}
                      />
                    </div>
                  </details>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ValueList({ values }: { values: string[] }) {
  return values.map((value, i) => (
    <span key={value}>
      {i > 0 && ', '}
      <code className="font-mono text-cyan-300">{value}</code>
    </span>
  ))
}

export function SchemaFields({
  catalog,
  schema,
}: {
  catalog: ApiCatalog
  schema: SchemaObject | undefined
}) {
  const union = schemaUnion(catalog, schema)
  if (!union) {
    return <FieldTable catalog={catalog} schema={schema} depth={0} seen={[]} />
  }

  // A tagged union: every arm is a whole body of its own, so each gets its own table.
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        One of {union.variants.length} shapes
        {union.discriminator && (
          <>
            , chosen by{' '}
            <code className="font-mono text-cyan-300">
              {union.discriminator}
            </code>
          </>
        )}
        .
      </p>
      {union.variants.map((variant) => (
        <div key={variant.name}>
          <h3 className="mb-2 text-sm font-semibold text-gray-200">
            {variant.values.length > 0 ? (
              <>
                {union.discriminator && (
                  <code className="font-mono text-gray-400">
                    {union.discriminator} ={' '}
                  </code>
                )}
                <ValueList values={variant.values} />
              </>
            ) : (
              variant.name
            )}
          </h3>
          {variant.description
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="mb-3 text-sm text-gray-400">
                <InlineMarkdown>{paragraph}</InlineMarkdown>
              </p>
            ))}
          <FieldTable
            catalog={catalog}
            schema={variant.schema}
            depth={0}
            seen={variant.name ? [variant.name] : []}
          />
        </div>
      ))}
    </div>
  )
}
