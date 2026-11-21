// The source marker on the way to a trial: /pricing/from/<source> and /register/from/<source>
// (vault: specs/distribution/sec-repository-funnel.md, phase 2). Markers are paths because
// the analytics drop query strings. A source is a short lowercase slug such as
// `research-msft`; anything else is a 404, so the marked pages cannot be used to put
// arbitrary text into a URL we serve.

const SOURCE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_LENGTH = 48

export function parseTrialSource(raw: string): string | null {
  return raw.length <= MAX_LENGTH && SOURCE.test(raw) ? raw : null
}

export function markedRegisterPath(source: string): string {
  return `/register/from/${source}`
}
