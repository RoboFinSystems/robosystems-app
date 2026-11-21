import type { ProductPage } from '@/lib/product-pages'
import { productPageJsonLd } from '@/lib/product-pages'
import { BOOK_PATH } from '@/lib/site'
import Link from 'next/link'
import type { ReactNode } from 'react'

// The pieces every page in app/(pages) shares, so the pages differ only in what they say.

export function PageJsonLd({ page }: { page: ProductPage }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productPageJsonLd(page)).replace(
          /</g,
          '\\u003c'
        ),
      }}
    />
  )
}

export function PageHero({
  page,
  children,
  caption,
}: {
  page: ProductPage
  children: ReactNode
  caption?: string
}) {
  return (
    <div className="relative">
      <div className="from-secondary-900/20 via-primary-900/20 to-accent-900/20 absolute inset-0 bg-linear-to-br"></div>
      <header className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-secondary-400 mb-4 text-sm font-semibold tracking-wider uppercase">
          {page.ogEyebrow}
        </p>
        <h1 className="font-heading mb-6 text-4xl font-bold text-white md:text-5xl">
          {page.h1}
        </h1>
        <div className="space-y-4 text-xl leading-relaxed text-gray-300">
          {children}
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="from-secondary-500 to-primary-500 shadow-secondary-500/25 hover:shadow-secondary-500/40 rounded-lg bg-linear-to-r px-6 py-3 text-center font-medium text-white shadow-lg transition-all"
          >
            Start free trial
          </Link>
          {/* A plain <a>: /book redirects to the scheduler on another site. */}
          <a
            href={BOOK_PATH}
            className="rounded-lg border border-gray-600 px-6 py-3 text-center font-medium text-white transition-all hover:border-gray-500 hover:bg-white/5"
          >
            Book 20 minutes
          </a>
          <Link
            href={page.docsPath}
            className="rounded-lg border border-gray-600 px-6 py-3 text-center font-medium text-white transition-all hover:border-gray-500 hover:bg-white/5"
          >
            Read the docs
          </Link>
        </div>
        {caption && <p className="mt-4 text-sm text-gray-400">{caption}</p>}
      </header>
    </div>
  )
}

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-gray-900 py-14">
      <h2 className="font-heading mb-6 text-3xl font-bold text-white">
        {title}
      </h2>
      <div className="space-y-4 text-lg leading-relaxed text-gray-300">
        {children}
      </div>
    </section>
  )
}

// `wrap` breaks a lone URL across lines on a phone rather than hiding its end.
export function Code({ children, wrap }: { children: string; wrap?: boolean }) {
  return (
    <pre
      className={`rounded-lg border border-gray-800 bg-zinc-950 px-4 py-3 text-sm text-gray-200 ${wrap ? 'break-all whitespace-pre-wrap' : 'overflow-x-auto'}`}
    >
      <code>{children}</code>
    </pre>
  )
}

export function TextLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  const external = href.startsWith('http')
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-secondary-400 hover:text-secondary-300"
    >
      {children}
    </a>
  ) : (
    <Link href={href} className="text-secondary-400 hover:text-secondary-300">
      {children}
    </Link>
  )
}

export function Cards({
  items,
}: {
  items: { title: string; body: ReactNode }[]
}) {
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-gray-800 bg-zinc-950/60 p-5"
        >
          <dt className="mb-2 font-semibold text-white">{item.title}</dt>
          <dd className="text-base text-gray-400">{item.body}</dd>
        </div>
      ))}
    </dl>
  )
}

export const PAGE_BODY = 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'
