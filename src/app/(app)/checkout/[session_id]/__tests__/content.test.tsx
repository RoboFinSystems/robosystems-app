import { describe, expect, test } from 'vitest'
import { isRepositoryResource } from '../content'

// F9 regression: the post-checkout redirect keys on whether the paid resource
// is a shared repository (→ getting-started) or an owned graph (→ dashboard).
// The prior `!isUUID()` heuristic misread every `kg…` graph as a repository —
// graph ids are `kg`-prefixed, never UUIDs — sending a paying owner to the
// shared-repo getting-started page.
describe('isRepositoryResource (F9 checkout redirect discriminator)', () => {
  test('an owned entity graph id is NOT a repository', () => {
    expect(isRepositoryResource('kg19ffe6c5233e644b74bc')).toBe(false)
  })

  test('a subgraph id is NOT a repository', () => {
    expect(isRepositoryResource('kg123_dev')).toBe(false)
  })

  test('uppercase KG prefix is still an owned graph', () => {
    expect(isRepositoryResource('KG19ffe6c5233e644b74bc')).toBe(false)
  })

  test('a shared repository name IS a repository', () => {
    expect(isRepositoryResource('sec')).toBe(true)
    expect(isRepositoryResource('industry')).toBe(true)
  })

  test('null resource is not a repository', () => {
    expect(isRepositoryResource(null)).toBe(false)
  })
})
