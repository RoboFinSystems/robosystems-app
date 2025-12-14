import type { Metadata } from 'next'
import { CheckoutContent } from './content'

export const metadata: Metadata = {
  title: 'Payment Processing | RoboSystems',
  description: 'Processing your payment and setting up your subscription',
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ session_id: string }>
}) {
  const { session_id } = await params
  return <CheckoutContent sessionId={session_id} />
}
