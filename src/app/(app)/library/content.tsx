'use client'

import {
  getLibraryElement,
  getLibraryElementArcs,
  listLibraryElements,
  listLibraryTaxonomies,
  searchLibraryElements,
  type LibraryElement,
  type LibraryElementArc,
  type LibraryTaxonomy,
} from '@/lib/library-client'
import { Alert, Badge, Button, Card, Spinner, TextInput } from 'flowbite-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiBookOpen,
  HiExternalLink,
  HiInformationCircle,
  HiSearch,
} from 'react-icons/hi'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const PAGE_SIZE = 50

// ──────────────────────────────────────────────────────────────────────
// Page shell
// ──────────────────────────────────────────────────────────────────────

export function LibraryContent() {
  const [taxonomies, setTaxonomies] = useState<LibraryTaxonomy[]>([])
  const [taxonomiesState, setTaxonomiesState] = useState<LoadState>('idle')
  const [taxonomiesError, setTaxonomiesError] = useState<string | null>(null)

  const [selectedTaxonomyId, setSelectedTaxonomyId] = useState<string | null>(
    null
  )
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  )

  // Sidebar only lists concept (reporting) taxonomies; cross-taxonomy
  // mappings are surfaced per-element in the detail panel.
  // Order: sfac6 (primitives) → fac (fundamental accounting concepts) →
  // rs-gaap (full canonical) — general-to-specific, each layer
  // specializes the one above.
  const reportingTaxonomies = useMemo(() => {
    const order: Record<string, number> = { sfac6: 0, fac: 1, 'rs-gaap': 2 }
    return taxonomies
      .filter((t) => (t.taxonomyType ?? 'reporting') === 'reporting')
      .sort((a, b) => {
        const ai = order[a.standard ?? ''] ?? 99
        const bi = order[b.standard ?? ''] ?? 99
        if (ai !== bi) return ai - bi
        return (a.standard ?? '').localeCompare(b.standard ?? '')
      })
  }, [taxonomies])

  useEffect(() => {
    setTaxonomiesState('loading')
    listLibraryTaxonomies(true)
      .then((rows) => {
        setTaxonomies(rows)
        setTaxonomiesState('ready')
        if (rows.length > 0 && !selectedTaxonomyId) {
          const reporting = rows.filter(
            (r) => (r.taxonomyType ?? 'reporting') === 'reporting'
          )
          // Default to sfac6 (the conceptual entry point), then fac,
          // then rs-gaap, matching the sidebar ordering.
          const sfac6 = reporting.find((r) => r.standard === 'sfac6')
          const fac = reporting.find((r) => r.standard === 'fac')
          const rsGaap = reporting.find((r) => r.standard === 'rs-gaap')
          setSelectedTaxonomyId(
            sfac6?.id ?? fac?.id ?? rsGaap?.id ?? reporting[0]?.id ?? rows[0].id
          )
        }
      })
      .catch((err: Error) => {
        setTaxonomiesError(err.message)
        setTaxonomiesState('error')
      })
    // We only want this once on mount; selectedTaxonomyId default comes with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <HiBookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Taxonomy Library
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Shared reference material for reporting taxonomies. Every entity
            graph pulls a read-only copy at provision time. Library content is
            curated; tenant CoA and mappings are authored locally.
          </p>
        </div>
      </header>

      {taxonomiesState === 'loading' && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Spinner size="sm" />
          <span>Loading taxonomies…</span>
        </div>
      )}
      {taxonomiesState === 'error' && (
        <Alert color="failure" icon={HiInformationCircle}>
          Failed to load taxonomies: {taxonomiesError}
        </Alert>
      )}

      {taxonomiesState === 'ready' && (
        // Fixed viewport-relative height so the three cards keep their
        // bounds when the detail panel's content changes. Each card has
        // its own internal scroll so clicking an element doesn't reflow
        // the page.
        <div
          className="grid grid-cols-12 items-stretch gap-6"
          style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
        >
          <TaxonomySidebar
            taxonomies={reportingTaxonomies}
            selectedId={selectedTaxonomyId}
            onSelect={(id) => {
              setSelectedTaxonomyId(id)
              setSelectedElementId(null)
            }}
          />
          <ElementBrowser
            taxonomyId={selectedTaxonomyId}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
          <ElementDetail
            elementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Taxonomy sidebar
// ──────────────────────────────────────────────────────────────────────

function TaxonomySidebar({
  taxonomies,
  selectedId,
  onSelect,
}: {
  taxonomies: LibraryTaxonomy[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <aside className="col-span-12 min-h-0 md:col-span-3">
      <Card className="flex h-full flex-col overflow-hidden">
        <h2 className="shrink-0 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Taxonomies
        </h2>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {taxonomies.map((t) => {
            const isSelected = t.id === selectedId
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelect(t.id)}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate font-mono text-xs"
                      title={`${t.standard ?? '?'}/${t.version ?? ''}`}
                    >
                      {t.standard ?? '?'}
                      <span className="text-gray-400 dark:text-gray-500">
                        /{t.version ?? ''}
                      </span>
                    </span>
                    {t.elementCount !== null && (
                      <Badge color="gray" size="xs" className="shrink-0">
                        {t.elementCount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <div
                    className="truncate text-xs text-gray-500 dark:text-gray-400"
                    title={t.name}
                  >
                    {t.name}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>
    </aside>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Element browser (paginated list + search)
// ──────────────────────────────────────────────────────────────────────

function ElementBrowser({
  taxonomyId,
  selectedElementId,
  onSelectElement,
}: {
  taxonomyId: string | null
  selectedElementId: string | null
  onSelectElement: (id: string) => void
}) {
  const [elements, setElements] = useState<LibraryElement[]>([])
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  // Three independent filter axes — all AND together. `classification`
  // also accepts the synthetic 'abstract' sentinel (sets isAbstract=true)
  // because abstracts are rendered in the same chip row by convention.
  const [classification, setClassification] = useState<string | null>(null)
  const [statementContext, setStatementContext] = useState<string | null>(null)
  const [derivationRole, setDerivationRole] = useState<string | null>(null)

  const activeQuery = search.trim()
  const searchMode = activeQuery.length > 0

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const rows = searchMode
        ? await searchLibraryElements({
            query: activeQuery,
            limit: PAGE_SIZE,
          })
        : await listLibraryElements({
            taxonomyId: taxonomyId ?? undefined,
            classification:
              classification && classification !== 'abstract'
                ? classification
                : undefined,
            statementContext: statementContext ?? undefined,
            derivationRole: derivationRole ?? undefined,
            isAbstract:
              classification === 'abstract'
                ? true
                : classification !== null
                  ? false
                  : null,
            limit: PAGE_SIZE,
            offset,
          })
      setElements(rows)
      setState('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }, [
    taxonomyId,
    offset,
    classification,
    statementContext,
    derivationRole,
    searchMode,
    activeQuery,
  ])

  useEffect(() => {
    load()
  }, [load])

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [
    taxonomyId,
    classification,
    statementContext,
    derivationRole,
    activeQuery,
  ])

  return (
    <section className="col-span-12 min-h-0 md:col-span-4">
      <Card className="flex h-full flex-col overflow-hidden">
        <h2 className="shrink-0 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Elements
        </h2>

        <div className="flex gap-2">
          <TextInput
            icon={HiSearch}
            sizing="sm"
            placeholder="Search qname, name, label…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="space-y-1">
          <ClassificationPicker
            selected={classification}
            onSelect={setClassification}
            disabled={searchMode}
          />
          <StatementContextPicker
            selected={statementContext}
            onSelect={setStatementContext}
            disabled={searchMode}
          />
          <DerivationRolePicker
            selected={derivationRole}
            onSelect={setDerivationRole}
            disabled={searchMode}
          />
        </div>

        {state === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Spinner size="sm" /> Loading…
          </div>
        )}
        {state === 'error' && (
          <Alert color="failure" icon={HiInformationCircle}>
            {error}
          </Alert>
        )}

        {state === 'ready' && elements.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No elements match these filters.
          </p>
        )}

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {elements.map((el) => {
            const isSelected = el.id === selectedElementId
            return (
              <li key={el.id}>
                <button
                  onClick={() => onSelectElement(el.id)}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="truncate font-mono text-sm" title={el.qname}>
                    {el.qname}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span
                      className="truncate text-xs text-gray-500 dark:text-gray-400"
                      title={el.name}
                    >
                      {el.name}
                    </span>
                    <Badge
                      color={
                        el.elementType === 'hypercube'
                          ? 'indigo'
                          : el.isAbstract
                            ? 'purple'
                            : classificationColor(el.classification ?? '')
                      }
                      size="xs"
                      className="shrink-0"
                    >
                      {el.elementType === 'hypercube'
                        ? 'hypercube'
                        : el.isAbstract
                          ? 'abstract'
                          : classificationLabel(el.classification ?? '—')}
                    </Badge>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {!searchMode && state === 'ready' && elements.length === PAGE_SIZE && (
          <div className="flex shrink-0 justify-between pt-2">
            <Button
              size="xs"
              color="gray"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              ← Previous
            </Button>
            <span className="self-center text-xs text-gray-500 dark:text-gray-400">
              {offset + 1}–{offset + elements.length}
            </span>
            <Button
              size="xs"
              color="gray"
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>
    </section>
  )
}

function ClassificationPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: string | null
  onSelect: (value: string | null) => void
  disabled?: boolean
}) {
  // Six primitive buckets + abstract.
  // Stocks: asset, liability, equity (balance-sheet positions)
  // Flows:  inflow, outflow (income-statement + equity-change primitives —
  //         revenue/gain collapse into inflow, expense/loss into outflow)
  //         cashflow (cash-flow-statement reconciliations + movements)
  // Direction is carried by balance_type; statement_context + derivation_role
  // axes preserve everything else. FAC has no gain/loss concepts, and Charlie
  // notes SFAC 6 Revenue ≠ us-gaap:OperatingIncome — so we don't force the
  // R/E/G/L split here.
  const stockClasses: Array<{ value: string; label: string }> = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
  ]
  const flowClasses: Array<{ value: string; label: string; title?: string }> = [
    { value: 'inflow', label: 'Inflow', title: 'Credit-flow primitive (was revenue + gain)' },
    { value: 'outflow', label: 'Outflow', title: 'Debit-flow primitive (was expense + loss)' },
    { value: 'cashflow', label: 'Cash Flow', title: 'Net cash movements + period-over-period movements' },
  ]

  const chipClass = (value: string) =>
    `rounded px-2 py-1 text-xs ${
      selected === value
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`

  const allClass = `rounded px-2 py-1 text-xs ${
    selected === null
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
  } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`

  return (
    <div className="flex flex-wrap gap-1">
      <button onClick={() => onSelect(null)} disabled={disabled} className={allClass}>
        All
      </button>
      {stockClasses.map((c) => (
        <button
          key={c.value}
          onClick={() => onSelect(c.value)}
          disabled={disabled}
          className={chipClass(c.value)}
        >
          {c.label}
        </button>
      ))}
      <span className="mx-1 self-center text-gray-300 dark:text-gray-600">
        ·
      </span>
      {flowClasses.map((c) => (
        <button
          key={c.value}
          onClick={() => onSelect(c.value)}
          disabled={disabled}
          title={c.title}
          className={chipClass(c.value)}
        >
          {c.label}
        </button>
      ))}
      <span className="mx-1 self-center text-gray-300 dark:text-gray-600">
        ·
      </span>
      <button
        onClick={() => onSelect('abstract')}
        disabled={disabled}
        title="Abstract grouping concepts (hypercubes, RollUps, LineItems)."
        className={`rounded px-2 py-1 text-xs ${
          selected === 'abstract'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        Abstract
      </button>
    </div>
  )
}

function StatementContextPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: string | null
  onSelect: (value: string | null) => void
  disabled?: boolean
}) {
  const values: Array<{ value: string; label: string; title?: string }> = [
    { value: 'balance_sheet', label: 'BS' },
    { value: 'income_statement', label: 'IS' },
    { value: 'cash_flow', label: 'CF' },
    { value: 'equity_changes', label: 'Equity Δ' },
    { value: 'disclosure', label: 'Disclosure' },
    {
      value: 'metadata',
      label: 'Metadata',
      title: 'Entity / document identifiers',
    },
    {
      value: 'analysis',
      label: 'Analysis',
      title: 'Ratios / computed metrics',
    },
  ]
  const chip = (active: boolean) =>
    `rounded px-2 py-1 text-xs ${
      active
        ? 'bg-teal-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`

  return (
    <div className="flex flex-wrap gap-1">
      <span className="self-center pr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Context
      </span>
      <button
        onClick={() => onSelect(null)}
        disabled={disabled}
        className={chip(selected === null)}
      >
        All
      </button>
      {values.map((v) => (
        <button
          key={v.value}
          onClick={() => onSelect(v.value)}
          disabled={disabled}
          title={v.title}
          className={chip(selected === v.value)}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

function DerivationRolePicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: string | null
  onSelect: (value: string | null) => void
  disabled?: boolean
}) {
  const values: Array<{ value: string; label: string; title?: string }> = [
    {
      value: 'primitive',
      label: 'Primitive',
      title: 'Leaf element — basic stock, flow, or CF delta',
    },
    {
      value: 'aggregate',
      label: 'Aggregate',
      title: 'RollUp head (subtotals, totals, NetCashFlow rollups)',
    },
    { value: 'ratio', label: 'Ratio', title: 'Computed metric (ROA, CurrentRatio)' },
    { value: 'identifier', label: 'Identifier', title: 'Entity/document metadata' },
    {
      value: 'structural',
      label: 'Structural',
      title: 'Abstracts, hypercubes, LineItems — grouping only',
    },
  ]
  const chip = (active: boolean) =>
    `rounded px-2 py-1 text-xs ${
      active
        ? 'bg-amber-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`

  return (
    <div className="flex flex-wrap gap-1">
      <span className="self-center pr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Role
      </span>
      <button
        onClick={() => onSelect(null)}
        disabled={disabled}
        className={chip(selected === null)}
      >
        All
      </button>
      {values.map((v) => (
        <button
          key={v.value}
          onClick={() => onSelect(v.value)}
          disabled={disabled}
          title={v.title}
          className={chip(selected === v.value)}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Element detail (labels, references, mappings)
// ──────────────────────────────────────────────────────────────────────

function ElementDetail({
  elementId,
  onSelectElement,
}: {
  elementId: string | null
  onSelectElement: (id: string) => void
}) {
  const [element, setElement] = useState<LibraryElement | null>(null)
  const [arcs, setArcs] = useState<LibraryElementArc[]>([])
  const [state, setState] = useState<LoadState>('idle')

  useEffect(() => {
    if (!elementId) {
      setElement(null)
      setArcs([])
      setState('idle')
      return
    }
    setState('loading')
    Promise.all([
      getLibraryElement({ id: elementId }),
      getLibraryElementArcs(elementId),
    ])
      .then(([el, arcRows]) => {
        setElement(el)
        setArcs(arcRows)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [elementId])

  // Group arcs by mapping taxonomy so the detail panel shows them in
  // three collapsible buckets (fac-to-rs-gaap, sfac6-to-fac, type-subtype).
  const arcsByTaxonomy = useMemo(() => {
    const groups = new Map<string, LibraryElementArc[]>()
    for (const arc of arcs) {
      const key = arc.taxonomyStandard ?? 'other'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(arc)
    }
    return groups
  }, [arcs])

  const sortedLabels = useMemo(() => {
    if (!element) return []
    const roleOrder = [
      'standard',
      'verbose',
      'terse',
      'documentation',
      'periodStart',
      'periodEnd',
      'negated',
      'total',
      'commentaryGuidance',
      'other',
    ]
    return [...element.labels].sort((a, b) => {
      const ia = roleOrder.indexOf(a.role)
      const ib = roleOrder.indexOf(b.role)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }, [element])

  return (
    <section className="col-span-12 min-h-0 md:col-span-5">
      <Card className="flex h-full flex-col overflow-hidden">
        {state === 'idle' && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Select an element to view details
          </div>
        )}
        {state === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Loading element…
          </div>
        )}
        {state === 'ready' && element && (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div>
              <h2
                className="font-mono text-lg font-semibold break-words text-gray-900 dark:text-white"
                title={element.qname}
              >
                {element.qname}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {element.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {element.classification && (
                <Badge
                  color={classificationColor(element.classification)}
                  title="Economic nature (SFAC 6)"
                >
                  {element.classification}
                </Badge>
              )}
              {element.statementContext && (
                <Badge color="gray" title="Statement context">
                  {element.statementContext}
                </Badge>
              )}
              {element.derivationRole && (
                <Badge color="purple" title="Derivation role">
                  {element.derivationRole}
                </Badge>
              )}
              <Badge color="gray">{element.balanceType}</Badge>
              <Badge color="gray">{element.periodType}</Badge>
              <Badge color="gray">{element.elementType}</Badge>
              {element.isAbstract && <Badge color="purple">abstract</Badge>}
              {element.isMonetary && <Badge color="indigo">monetary</Badge>}
              <Badge color="info">{element.source}</Badge>
            </div>

            {sortedLabels.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Labels
                </h3>
                <ul className="space-y-1">
                  {sortedLabels.map((lab, i) => (
                    <li
                      key={`${lab.role}-${lab.language}-${i}`}
                      className="rounded bg-gray-50 p-2 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{lab.role}</span>
                        <span>·</span>
                        <span>{lab.language}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {lab.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {element.references.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  References
                </h3>
                <ul className="space-y-1">
                  {element.references.map((ref, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {ref.refType && (
                        <Badge color="gray" size="xs" className="mr-2">
                          {ref.refType}
                        </Badge>
                      )}
                      {ref.citation}
                      {ref.uri && (
                        <a
                          href={ref.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <HiExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {arcs.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Mappings ({arcs.length})
                </h3>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Cross-taxonomy arcs — equivalence, generalization, and
                  type-subtype bridges. Click a peer to jump to it.
                </p>
                <div className="space-y-3">
                  {Array.from(arcsByTaxonomy.entries()).map(
                    ([taxonomyStandard, taxonomyArcs]) => (
                      <div key={taxonomyStandard}>
                        <div className="mb-1 flex items-center justify-between px-1">
                          <span className="font-mono text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                            {taxonomyStandard}
                          </span>
                          <Badge color="gray" size="xs">
                            {taxonomyArcs.length}
                          </Badge>
                        </div>
                        <ul className="space-y-0.5">
                          {taxonomyArcs.map((arc) => (
                            <li key={arc.id}>
                              <button
                                onClick={() => onSelectElement(arc.peer.id)}
                                className="w-full rounded px-2 py-1 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                title={`${arc.associationType} · ${arc.direction}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="shrink-0 text-xs text-gray-400 dark:text-gray-500"
                                    title={
                                      arc.direction === 'outgoing'
                                        ? 'this element → peer'
                                        : 'peer → this element'
                                    }
                                  >
                                    {arc.direction === 'outgoing' ? '→' : '←'}
                                  </span>
                                  <span className="truncate font-mono text-xs text-blue-700 dark:text-blue-300">
                                    {arc.peer.qname}
                                  </span>
                                  <Badge
                                    color={arcTypeColor(arc.associationType)}
                                    size="xs"
                                    className="ml-auto shrink-0"
                                  >
                                    {arc.associationType}
                                  </Badge>
                                </div>
                                {arc.peer.name &&
                                  arc.peer.name !==
                                    arc.peer.qname.split(':').pop() && (
                                    <div className="truncate pl-5 text-xs text-gray-500 dark:text-gray-400">
                                      {arc.peer.name}
                                    </div>
                                  )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function classificationColor(
  cls: string
):
  | 'success'
  | 'failure'
  | 'warning'
  | 'info'
  | 'purple'
  | 'indigo'
  | 'pink'
  | 'gray' {
  switch (cls) {
    case 'asset':
      return 'success'
    case 'liability':
      return 'failure'
    case 'equity':
      return 'purple'
    case 'inflow':
      return 'info'
    case 'outflow':
      return 'warning'
    case 'cashflow':
      return 'indigo'
    default:
      return 'gray'
  }
}

function arcTypeColor(
  assocType: string
):
  | 'success'
  | 'failure'
  | 'warning'
  | 'info'
  | 'purple'
  | 'indigo'
  | 'pink'
  | 'gray' {
  switch (assocType) {
    case 'equivalence':
      return 'info'
    case 'general-special':
      return 'purple'
    case 'essence-alias':
      return 'indigo'
    default:
      return 'gray'
  }
}

// Human-friendly labels for badges. All 7 SFAC 6 buckets already
// display cleanly; kept as a stable extension point for future labels.
function classificationLabel(cls: string): string {
  return cls
}
