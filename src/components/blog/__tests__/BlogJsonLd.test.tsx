import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlogJsonLd } from '../BlogJsonLd'

function jsonLd(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('script[type="application/ld+json"]')
  ).map((s) => JSON.parse(s.textContent || '{}'))
}

describe('BlogJsonLd', () => {
  it("uses the post's own 1200×630 card as the BlogPosting image, not the logo", () => {
    const { container } = render(
      <BlogJsonLd
        post={{
          slug: 'semantic-sovereignty',
          site: 'robosystems',
          title: 'Semantic Sovereignty',
          date: '2026-07-26',
          author: 'Joey French',
          excerpt: 'sovereignty',
        }}
      />
    )

    const posting = jsonLd(container).find((d) => d['@type'] === 'BlogPosting')
    expect(posting.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://robosystems.ai/blog/semantic-sovereignty/og.png',
      width: 1200,
      height: 630,
    })
  })
})
