import type { GraphInfo } from '@robosystems/client'
import { describe, expect, it } from 'vitest'
import { getNavigationItems } from '../sidebar-config'

const userGraph = { graphId: 'kg1', isRepository: false } as GraphInfo
const repository = { graphId: 'sec', isRepository: true } as GraphInfo

describe('getNavigationItems', () => {
  it.each([
    ['no graph', null],
    ['a user graph', userGraph],
    ['a repository', repository],
  ])('ends with Docs in a new tab with %s selected', (_, graph) => {
    const items = getNavigationItems(graph)
    const docs = items[items.length - 1]

    expect(docs).toMatchObject({
      label: 'Docs',
      href: '/docs',
      target: '_blank',
    })
    expect(docs.icon).toBeDefined()
  })

  it('keeps Repositories directly above the docs link', () => {
    const labels = getNavigationItems(userGraph).map((item) => item.label)

    expect(labels.slice(-3)).toEqual(['MCP', 'Repositories', 'Docs'])
  })

  // The blog is read from the public site, not from inside a graph's workspace.
  it('links nothing to the blog', () => {
    for (const graph of [null, userGraph, repository]) {
      const hrefs = getNavigationItems(graph).map((item) => item.href)

      expect(hrefs).not.toContain('/blog')
    }
  })
})
