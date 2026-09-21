import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// IndexNow verifies that we own a host by fetching `https://<host>/<key>.txt` and
// checking it contains the key it is named for. The filename and the contents are
// therefore the same string in two places, and nothing at runtime notices when they
// stop matching — the submission just starts failing key validation, silently, while
// the workflow that sends it stays green. The shared `indexnow-ping` action checks the
// served file before submitting; this checks the file we ship, so a typo fails here
// rather than three hours after a deploy.

const PUBLIC_DIR = join(process.cwd(), 'public')

describe('the IndexNow key file', () => {
  const keyFiles = readdirSync(PUBLIC_DIR).filter((name) =>
    /^[a-f0-9]{8,128}\.txt$/.test(name)
  )

  it('is the only one of its kind', () => {
    // Two key files is not an error to IndexNow, but it means a rotation left the old
    // key live, and the variable the workflow reads matches only one of them.
    expect(keyFiles).toHaveLength(1)
  })

  it('contains exactly the key it is named for', () => {
    const [file] = keyFiles
    const key = file.replace(/\.txt$/, '')
    const contents = readFileSync(join(PUBLIC_DIR, file), 'utf8')
    expect(contents.trim()).toBe(key)
  })

  it('carries no trailing newline that a strict reader could trip on', () => {
    const [file] = keyFiles
    expect(readFileSync(join(PUBLIC_DIR, file), 'utf8')).not.toMatch(/\s/)
  })
})
