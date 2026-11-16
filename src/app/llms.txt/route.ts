import { getAllPosts } from '@/lib/blog'
import type { DocsPage } from '@/lib/docs'
import { DOCS_SITE, getDocsCatalog, getDocsNav } from '@/lib/docs'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { orBuildFallback } from '@robosystems/core/docs/catalog'

// llms.txt (llmstxt.org): a plain-markdown map of the site for language models. Built from
// the same docs and blog catalogs as the sitemap, so it cannot list a page that is gone.
// The per-operation API reference stays out; its two hub pages stand in for it.

export const revalidate = 300

function link(title: string, url: string, note?: string): string {
  const text = note?.replace(/\s+/g, ' ').trim()
  return text ? `- [${title}](${url}): ${text}` : `- [${title}](${url})`
}

function docsLinks(pages: DocsPage[]): string[] {
  return pages.map((p) => link(p.title, `${SITE_URL}${p.path}`, p.description))
}

export async function GET() {
  const [catalog, posts] = await Promise.all([
    orBuildFallback(getDocsCatalog(), null),
    orBuildFallback(getAllPosts(), []),
  ])
  const guides = catalog
    ? (getDocsNav(catalog, DOCS_SITE, 'product')?.ordered ?? [])
    : []
  const technical = catalog
    ? (getDocsNav(catalog, DOCS_SITE, 'technical')?.ordered ?? [])
    : []

  const body = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    "RoboSystems is the open-source knowledge graph for finance (Apache 2.0 and MIT), built and operated by RFS LLC. Three kinds of graph on one platform: ledger graphs (RoboLedger, the general ledger built on it), the SEC shared repository of 8,000+ public companies' XBRL filings, and graphs you model yourself from your own schema, loaded from Parquet and queried with Cypher. One ontology underneath: the RoboSystems graph model, labelled in XBRL's standard terms wherever XBRL has one; every graph runs on it in LadybugDB, and reports leave as a holon (RDF), XBRL 2.1 or Tavi. It serves them over MCP at https://api.robosystems.ai/v1/mcp, so Claude, ChatGPT, or any MCP client can query them, extend a subgraph beside them, and keep semantic memory across sessions. The Finance AI Deployment, delivered by Harbinger FinLab (https://harbinger.finance/#deployment), puts it on your books in two to three weeks, on the managed platform, a Dedicated Deployment, or self-hosted in your own cloud.",
    '',
    '## Product',
    link('Platform', `${SITE_URL}/platform`, 'what the platform does'),
    link('Pricing', `${SITE_URL}/pricing`),
    link('Enterprise', `${SITE_URL}/enterprise`, 'dedicated deployments'),
    link(
      'About',
      `${SITE_URL}/about`,
      'who builds it and the company behind it'
    ),
    '',
    '## Guides',
    ...docsLinks(guides),
    '',
    '## Technical docs',
    ...docsLinks(technical),
    link('REST API reference', `${SITE_URL}/docs/api`, 'a page per operation'),
    link(
      'Extensions reference',
      `${SITE_URL}/docs/extensions`,
      'the RoboLedger and RoboInvestor operations and GraphQL reads'
    ),
    '',
    '## Blog',
    ...posts.map((post) =>
      link(
        post.title,
        `${SITE_URL}/blog/${post.slug}`,
        post.metaDescription || post.excerpt
      )
    ),
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
