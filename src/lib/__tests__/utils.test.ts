import { normalizeLocalUrl } from '../utils'

describe('normalizeLocalUrl', () => {
  const originalEnv = process.env.NODE_ENV

  const setNodeEnv = (env: string) => {
    process.env.NODE_ENV = env
  }

  afterEach(() => {
    setNodeEnv(originalEnv)
  })

  describe('Development environment', () => {
    beforeEach(() => {
      setNodeEnv('development')
    })

    it('should replace localstack:4566 with localhost:4566', () => {
      const input = 'http://localstack:4566/bucket/file.parquet'
      const expected = 'http://localhost:4566/bucket/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should handle S3-style URLs', () => {
      const input = 'https://bucket.localstack:4566/file.parquet'
      const expected = 'https://bucket.localhost:4566/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should not modify URLs without localstack:4566', () => {
      const input = 'https://s3.amazonaws.com/bucket/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(input)
    })

    it('should handle URLs with query parameters', () => {
      const input = 'http://localstack:4566/bucket/file.parquet?param=value'
      const expected = 'http://localhost:4566/bucket/file.parquet?param=value'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should handle URLs with fragments', () => {
      const input = 'http://localstack:4566/bucket/file.parquet#section'
      const expected = 'http://localhost:4566/bucket/file.parquet#section'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should handle empty strings', () => {
      expect(normalizeLocalUrl('')).toBe('')
    })

    it('should handle multiple occurrences of localstack:4566', () => {
      const input =
        'http://localstack:4566/redirect?next=http://localstack:4566/bucket'
      const expected =
        'http://localhost:4566/redirect?next=http://localhost:4566/bucket'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })
  })

  describe('Production environment', () => {
    beforeEach(() => {
      setNodeEnv('production')
    })

    it('should not modify URLs in production', () => {
      const input = 'http://localstack:4566/bucket/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(input)
    })

    it('should return URL unchanged', () => {
      const input = 'https://s3.amazonaws.com/bucket/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(input)
    })
  })

  describe('Test environment', () => {
    beforeEach(() => {
      setNodeEnv('test')
    })

    it('should not modify URLs in test environment', () => {
      const input = 'http://localstack:4566/bucket/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(input)
    })
  })

  describe('Edge cases', () => {
    beforeEach(() => {
      setNodeEnv('development')
    })

    it('should handle URLs with username:password', () => {
      const input = 'http://user:pass@localstack:4566/bucket'
      const expected = 'http://user:pass@localhost:4566/bucket'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should handle relative URLs', () => {
      const input = '/localstack:4566/file.parquet'
      const expected = '/localhost:4566/file.parquet'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should handle URL-like strings', () => {
      const input = 'Check http://localstack:4566 for files'
      const expected = 'Check http://localhost:4566 for files'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })

    it('should preserve case sensitivity', () => {
      const input = 'http://LocalStack:4566/Bucket/File.Parquet'
      const expected = 'http://localhost:4566/Bucket/File.Parquet'

      expect(normalizeLocalUrl(input)).toBe(expected)
    })
  })
})
