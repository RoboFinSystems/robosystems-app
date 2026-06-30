import { ContactModal } from '@robosystems/core'

/** The contact modal in its open state — name, email, company, and message fields
 *  on a dark sheet, with the primary submit action. Renders via a portal, so the
 *  card root measures 0px (validate flags RENDER_THIN — benign; the dialog paints). */
export const Open = () => (
  <ContactModal
    isOpen
    onClose={() => {}}
    title="Contact Us"
    description="Send us a message and we'll get back to you as soon as possible."
    formType="general"
  />
)
