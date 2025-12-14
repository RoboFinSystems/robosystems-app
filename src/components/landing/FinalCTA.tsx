'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'
import FloatingElementsVariant from './FloatingElementsVariant'

export default function FinalCTA() {
  const [showContact, setShowContact] = useState(false)

  return (
    <section className="relative overflow-hidden bg-black py-24">
      <FloatingElementsVariant variant="final" intensity={20} />
      <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading mb-6 text-4xl font-bold text-white md:text-5xl">
          Ready to Build Your Knowledge Graph?
        </h2>
        <p className="mb-12 text-xl text-gray-300">
          Transform your financial and operational data into an AI-ready
          knowledge graph that powers intelligent automation and insights.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => setShowContact(true)}
            className="group rounded-lg border border-gray-700 bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-all duration-300 hover:border-cyan-500/50"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        title="Contact Us"
        description="Tell us about your needs and our team will reach out to discuss how RoboSystems can help."
        formType="sales_inquiry"
      />
    </section>
  )
}
