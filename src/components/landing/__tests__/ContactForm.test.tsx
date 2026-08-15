import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContactForm, { copyForFormType } from '../ContactForm'

vi.mock('@robosystems/core/auth-components/TurnstileWidget', () => ({
  TurnstileWidget: () => null,
}))

describe('ContactForm copy by intent', () => {
  it('asks the default (integration) question for unknown types', () => {
    expect(copyForFormType('general').messageLabel).toBe(
      'Tell us about your integration needs'
    )
    expect(copyForFormType('enterprise_sales').success).toBe(
      'Our integration team will get back to you within 24 hours.'
    )
  })

  it('asks sales prospects about their organization, not integrations', () => {
    for (const type of ['sales', 'dedicated_deployment']) {
      const copy = copyForFormType(type)
      expect(copy.messageLabel).toBe('Tell us about your organization')
      expect(copy.placeholder).toMatch(/identity provider/i)
      expect(copy.success).not.toMatch(/integration team/i)
    }
  })

  it('keeps the neutral wording for legal inquiries', () => {
    expect(copyForFormType('terms-inquiry').messageLabel).toBe('Your Message')
    expect(copyForFormType('privacy-inquiry').messageLabel).toBe('Your Message')
  })

  it('renders the sales label and placeholder for a dedicated deployment', () => {
    render(<ContactForm onClose={vi.fn()} formType="dedicated_deployment" />)

    expect(
      screen.getByLabelText('Tell us about your organization')
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Which identity provider\?/)
    ).toBeInTheDocument()
  })
})
