import { parseTrialSource } from '@/lib/trial-source'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RegisterForm from '../../content'
import { registerMetadata } from '../../metadata'

// /register with a source marker (src/lib/trial-source.ts): the same form, so the
// analytics can count sign-ups started from each source.
export const metadata: Metadata = registerMetadata

export default async function MarkedRegisterPage({
  params,
}: {
  params: Promise<{ source: string }>
}) {
  if (!parseTrialSource((await params).source)) notFound()
  return <RegisterForm />
}
