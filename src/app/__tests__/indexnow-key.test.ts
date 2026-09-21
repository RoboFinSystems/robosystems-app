import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// IndexNow proves we control a host by serving its key at the host root, so the key
// file has to exist in the image that serves robosystems.ai. It must not exist
// anywhere else, and this Dockerfile builds two images: the ECR one behind
// robosystems.ai, and the self-host image published to Docker Hub. A committed
// public/<key>.txt ends up in both — shipping our key to everyone who pulls the
// public image, and serving it from their host.
//
// So the file is written at build time from an arg the ECR build passes and the
// Docker Hub build does not. Nothing at runtime notices if that wiring comes undone;
// the key just quietly starts travelling again. These assert the shape instead.

const ROOT = process.cwd()
const PUBLIC_DIR = join(ROOT, 'public')
const KEY_FILE = /^[a-f0-9]{8,128}\.txt$/

describe('the IndexNow key', () => {
  it('is not committed to public/', () => {
    // The whole point: a key in the repo is a key in the Docker Hub image.
    expect(readdirSync(PUBLIC_DIR).filter((n) => KEY_FILE.test(n))).toEqual([])
  })

  it('is written into the image from a build arg', () => {
    const dockerfile = readFileSync(join(ROOT, 'Dockerfile'), 'utf8')
    expect(dockerfile).toMatch(/^ARG INDEXNOW_KEY=""$/m)
    // Named for its own value, which is what IndexNow fetches.
    expect(dockerfile).toContain('"/app/public/${INDEXNOW_KEY}.txt"')
  })

  it('is passed by the ECR build and withheld from the Docker Hub build', () => {
    const ecr = readFileSync(join(ROOT, '.github/workflows/build.yml'), 'utf8')
    const hub = readFileSync(
      join(ROOT, '.github/workflows/dockerhub.yml'),
      'utf8'
    )
    expect(ecr).toContain('--build-arg INDEXNOW_KEY=')
    expect(hub).not.toContain('INDEXNOW_KEY')
  })
})
