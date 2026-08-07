/**
 * MCP connector addressing.
 *
 * The MCP transport is URL-anchored: the graph id lives in the path and never
 * becomes a tool argument, so a connector reaches exactly one workspace. A
 * subgraph is addressed the same way — its id (`{parent}_{name}`) is a
 * complete address, not a modifier on the parent's, so every helper here takes
 * a workspace id and never assumes it is a top-level graph.
 */

export const MCP_API_URL = (
  process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'https://api.robosystems.ai'
).replace(/\/$/, '')

/** Bare MCP endpoint for a workspace — no credential. */
export const mcpEndpointFor = (workspaceId: string) =>
  `${MCP_API_URL}/v1/graphs/${workspaceId}/mcp`

/**
 * Connector names must be distinct per workspace, so the full id rides along.
 * Deriving this from the parent instead is what let a subgraph connector get
 * labeled with its parent's id.
 */
export const connectorNameFor = (workspaceId: string) =>
  `robosystems-${workspaceId}`

/** Mirrors the API's `construct_subgraph_id`. */
export const subgraphIdFor = (parentGraphId: string, name: string) =>
  `${parentGraphId}_${name}`

/** Subgraph ids are `{parent}_{name}`; a parent id never contains `_`. */
export const parentGraphIdOf = (workspaceId: string) =>
  workspaceId.split('_')[0]

export const isSubgraphId = (workspaceId: string) => workspaceId.includes('_')

/**
 * The API's subgraph name rule (`CreateSubgraphRequest.validate_name` and
 * `SUBGRAPH_NAME_PATTERN`): alphanumeric only, 1–20 characters, normalized to
 * lowercase. Hyphens are rejected — the id parser splits on `_` and matches
 * `[a-zA-Z0-9]{1,20}` for the name half.
 */
export const SUBGRAPH_NAME_PATTERN = /^[a-z0-9]{1,20}$/
export const SUBGRAPH_NAME_MAX_LENGTH = 20
