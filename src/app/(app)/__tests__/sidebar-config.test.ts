import type { GraphInfo } from '@robosystems/client'
import { describe, expect, it } from 'vitest'
import { getNavigationItems } from '../sidebar-config'

const userGraph = { graphId: 'kg1', isRepository: false } as GraphInfo
const repository = { graphId: 'sec', isRepository: true } as GraphInfo

describe('getNavigationItems', () => {
  it('ends with Repositories', () => {
    const labels = getNavigationItems(userGraph).map((item) => item.label)

    expect(labels.slice(-2)).toEqual(['MCP', 'Repositories'])
  })

  // The sidebar is the graph's workspace. The docs are reached from the user menu
  // (core's CoreNavbar) and from the page that each guide explains; the blog is read
  // on the public site.
  it.each([
    ['no graph', null],
    ['a user graph', userGraph],
    ['a repository', repository],
  ])('links neither the docs nor the blog with %s selected', (_, graph) => {
    const hrefs = getNavigationItems(graph).flatMap((item) => [
      item.href,
      ...(item.items ?? []).map((child) => child.href),
    ])

    expect(hrefs).not.toContain('/docs')
    expect(hrefs).not.toContain('/blog')
  })
})
