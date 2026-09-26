import { Constraints } from '@/components/docs/api/Constraints'
import type { ApiCatalog, ApiParameter } from '@/lib/openapi'
import { constraintsOf, enumValuesOf, typeLabel } from '@/lib/openapi-schema'

// Path, query and header parameters. Separate from the field table because a parameter
// carries its own `required` flag and location rather than living in a model's
// `required` list.

export function ParameterTable({
  catalog,
  parameters,
}: {
  catalog: ApiCatalog
  parameters: ApiParameter[]
}) {
  if (parameters.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-900/70 text-xs tracking-wide text-gray-500 uppercase">
            <th scope="col" className="px-4 py-2 font-semibold">
              Name
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
          {parameters.map((parameter) => {
            const values = enumValuesOf(catalog, parameter.schema)
            const constraints = constraintsOf(parameter.schema)
            return (
              <tr
                key={`${parameter.location}:${parameter.name}`}
                className="border-t border-gray-800 align-top"
              >
                <td className="px-4 py-3">
                  <code className="font-mono text-cyan-300">
                    {parameter.name}
                  </code>
                  <span className="mt-1 block text-xs text-gray-500">
                    {parameter.required ? 'required' : 'optional'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-400">
                  {typeLabel(catalog, parameter.schema)}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {parameter.description ||
                    parameter.schema.description ||
                    parameter.schema.title ||
                    '—'}
                  {values.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      One of:{' '}
                      {values.map((value, i) => (
                        <span key={value}>
                          {i > 0 && ', '}
                          <code className="font-mono text-gray-400">
                            {value}
                          </code>
                        </span>
                      ))}
                    </p>
                  )}
                  {parameter.schema.default !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      Default:{' '}
                      <code className="font-mono text-gray-400">
                        {JSON.stringify(parameter.schema.default)}
                      </code>
                    </p>
                  )}
                  {constraints.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      <Constraints values={constraints} />
                    </p>
                  )}
                  {parameter.examples.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {parameter.examples.length > 1 ? 'Examples' : 'Example'}:{' '}
                      {parameter.examples.map((example, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          <code className="font-mono text-gray-400">
                            {JSON.stringify(example.value)}
                          </code>
                          {example.label !== 'Example' && ` (${example.label})`}
                        </span>
                      ))}
                    </p>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
