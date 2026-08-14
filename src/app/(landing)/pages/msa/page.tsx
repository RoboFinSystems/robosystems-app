import type { Metadata } from 'next'
import MasterServiceAgreement from './content'

export const metadata: Metadata = {
  title: 'Master Service Agreement | RoboSystems',
  description:
    'The Master Service Agreement governing RoboSystems platform services purchased under an Order Form.',
  alternates: { canonical: 'https://robosystems.ai/pages/msa' },
}

export default function MsaPage() {
  return <MasterServiceAgreement />
}
