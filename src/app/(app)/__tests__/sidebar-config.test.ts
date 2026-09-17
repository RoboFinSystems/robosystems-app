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
  ])('ends with Docs and Blog in a new tab with %s selected', (_, graph) => {
    const items = getNavigationItems(graph)
    const [docs, blog] = items.slice(-2)

    expect(docs).toMatchObject({
      label: 'Docs',
      href: '/docs',
      target: '_blank',
    })
    expect(blog).toMatchObject({
      label: 'Blog',
      href: '/blog',
      target: '_blank',
    })
    expect(docs.icon).toBeDefined()
    expect(blog.icon).toBeDefined()
  })

  it('keeps Repositories directly above the docs and blog links', () => {
    const labels = getNavigationItems(userGraph).map((item) => item.label)

    expect(labels.slice(-4)).toEqual(['MCP', 'Repositories', 'Docs', 'Blog'])
  })
})
