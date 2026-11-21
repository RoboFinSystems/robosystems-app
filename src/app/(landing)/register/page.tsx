import type { Metadata } from 'next'
import RegisterForm from './content'
import { registerMetadata } from './metadata'

export const metadata: Metadata = registerMetadata

export default function RegisterPage() {
  return <RegisterForm />
}
