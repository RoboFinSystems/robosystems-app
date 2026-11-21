import FinalCTA from '@/components/landing/FinalCTA'
import {
  Cards,
  PAGE_BODY,
  PageHero,
  PageJsonLd,
  Section,
  TextLink,
} from '@/components/pages/PageParts'
import { getProductPage, productPageMetadata } from '@/lib/product-pages'

// Subordinate to /knowledge-graph-for-finance by design: it names the term's competing
// definitions without choosing one, and sends the reader to the knowledge graph page.
// Ledger claims are checked against docs/technical/event-driven-ledger and the
// documents-and-memory guide.

const page = getProductPage('/context-graph')

export const metadata = productPageMetadata(page)

const definitions = [
  {
    title: 'A record of decisions',
    body: 'The trail of why things were done across a company’s systems: approvals, exceptions and precedents, kept so an agent can learn how the organization actually decides.',
  },
  {
    title: 'Retrieval context for a model',
    body: 'A graph built from documents, so a language model is handed related passages and entities with a question rather than one isolated chunk of text.',
  },
  {
    title: 'An agent’s memory',
    body: 'What an agent has learned and done across sessions, stored as connected nodes it can recall instead of a flat log.',
  },
  {
    title: 'A knowledge graph with time and sources',
    body: 'Entities and facts, plus when each one held and where it came from, so an answer can say what was true at a date and why.',
  },
]

const carried = [
  {
    title: 'The entries behind a number',
    body: 'Every balance opens to the journal lines that make it up, oldest first, each with the balance it leaves.',
  },
  {
    title: 'The event behind an entry',
    body: 'A sale, a payment, an asset retired: the ledger records what happened as an event, and the entry is derived from it.',
  },
  {
    title: 'Who decided, and when',
    body: 'The AI drafts and your people approve. A classification, a posted entry and a closed period each record who did it and when.',
  },
  {
    title: 'The source document',
    body: 'A bank statement, an invoice or a receipt kept as it arrived, beside the entries it supports.',
  },
  {
    title: 'What the assistant should remember',
    body: 'A mapping decision, a counterparty you always treat a certain way, a note about a close: kept on the graph across conversations.',
  },
  {
    title: 'The public record beside it',
    body: 'The filings of 8,000+ public companies in the same ontology, each number traced to its tagged fact.',
  },
]

export default function ContextGraphPage() {
  return (
    <>
      <PageJsonLd page={page} />
      <article>
        <PageHero
          page={page}
          caption="14 days on the SEC repository, no card. Graphs start at $99 a month."
        >
          <p>
            &quot;Context graph&quot; means different things to different
            writers: a record of decisions, retrieval context for a model, an
            agent&apos;s memory, a knowledge graph with time and sources. The
            definitions overlap and none has settled.
          </p>
          <p>
            In finance the context is already defined: the entries, events,
            approvals and sources behind each number. RoboSystems holds it in
            the open-source knowledge graph for finance.
          </p>
        </PageHero>

        <div className={PAGE_BODY}>
          <Section title="Four definitions of context graph">
            <p>
              Each of these is in use today. We don&apos;t pick one; they
              describe different jobs.
            </p>
            <Cards items={definitions} />
          </Section>

          <Section title="Context graph in finance: what the knowledge graph carries">
            <p>
              Accounting has kept context for a long time: a number is only as
              good as the trail behind it. A knowledge graph for finance holds
              that trail as part of the graph, so an AI reading it gets the
              context with the number:
            </p>
            <Cards items={carried} />
          </Section>

          <Section title="Why we say knowledge graph">
            <p>
              The context above is one thing a knowledge graph for finance
              carries, beside the facts, concepts, periods and entities it
              connects. The broader term is the steadier one, and it&apos;s the
              one we build to.
            </p>
            <p>
              <TextLink href="/knowledge-graph-for-finance">
                What a knowledge graph for finance is, and what it holds →
              </TextLink>
            </p>
          </Section>

          <Section title="Read further">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <TextLink href="/blog/building-financial-context-graphs">
                  Knowledge graphs and ontology for finance: architecture and
                  use cases
                </TextLink>
              </li>
              <li>
                <TextLink href="/docs/technical/event-driven-ledger">
                  The event-driven ledger
                </TextLink>
                : how events become entries, in the docs
              </li>
              <li>
                <TextLink href="/docs/guides/documents-and-memory">
                  Documents and memory
                </TextLink>
              </li>
            </ul>
          </Section>
        </div>
      </article>
      <FinalCTA />
    </>
  )
}
