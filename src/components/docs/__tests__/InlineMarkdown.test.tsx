import { InlineMarkdown } from '@/components/docs/InlineMarkdown'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

// These descriptions come from the API's own schema — Pydantic docstrings and
// `Field(description=...)` text — and they are markdown. Rendered as plain text the
// markers become the sentence: `/docs/api` published "returns a `link_token` for Plaid
// Link" with the backticks visible, on 864 property descriptions.

describe('InlineMarkdown', () => {
  it('renders a backticked span as code', () => {
    render(
      <p>
        <InlineMarkdown>{'Pass `graph_id` in the URL.'}</InlineMarkdown>
      </p>
    )
    const code = screen.getByText('graph_id')
    expect(code.tagName).toBe('CODE')
  })

  it('leaves no backtick in the rendered text', () => {
    const { container } = render(
      <InlineMarkdown>
        {'Cached by `generationCount`; follow `downloadUrl` to fetch.'}
      </InlineMarkdown>
    )
    expect(container.textContent).not.toContain('`')
    expect(container.textContent).toBe(
      'Cached by generationCount; follow downloadUrl to fetch.'
    )
  })

  it('passes plain text through unchanged', () => {
    const { container } = render(
      <InlineMarkdown>{'No markup here at all.'}</InlineMarkdown>
    )
    expect(container.textContent).toBe('No markup here at all.')
  })

  it('keeps an unmatched backtick as literal text', () => {
    const { container } = render(
      <InlineMarkdown>{'A stray ` should not eat the rest.'}</InlineMarkdown>
    )
    expect(container.textContent).toBe('A stray ` should not eat the rest.')
    expect(container.querySelector('code')).toBeNull()
  })

  it('never interprets HTML in a description', () => {
    // The text is API-authored, but it reaches this component as data and is rendered
    // on a public page. Splitting on backticks and emitting the parts as children is
    // what keeps that inert — there is no dangerouslySetInnerHTML path here.
    const { container } = render(
      <InlineMarkdown>
        {'Use `<script>alert(1)</script>` carefully.'}
      </InlineMarkdown>
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toBe(
      'Use <script>alert(1)</script> carefully.'
    )
  })
})
