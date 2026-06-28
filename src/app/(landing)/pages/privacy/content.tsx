'use client'

import ContactModal from '@/components/landing/ContactModal'
import Link from 'next/link'
import { useState } from 'react'

export default function PrivacyPolicy() {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <section>
        <div className="privacy-content mx-auto max-w-(--breakpoint-md) px-4 py-8 text-left lg:px-12 lg:py-16 dark:text-white [&>h1]:mb-8 [&>h1]:text-3xl [&>h1]:font-bold [&>p]:mb-6 [&>p>strong:only-child]:mt-8 [&>p>strong:only-child]:mb-4 [&>p>strong:only-child]:block [&>p>strong:only-child]:text-xl [&>p>strong:only-child]:font-bold [&>ul]:mb-6 [&>ul]:ml-6 [&>ul>li]:mb-2">
          <h1>
            <strong>PRIVACY POLICY</strong>
          </h1>

          <p className="mb-12 text-gray-600 dark:text-gray-400">
            Last Revision: October 1, 2025
          </p>

          <p className="mt-8 text-2xl font-semibold">
            <strong>Introduction</strong>
          </p>

          <p>
            PLEASE READ THIS PRIVACY POLICY CAREFULLY BEFORE USING THE
            ROBOSYSTEMS PLATFORM OR ACCESSING ANY OF OUR SERVICES.
          </p>

          <p>
            <strong>
              RFS LLC is a Wyoming Limited Liability Company, operating under
              the fictitious name RoboSystems (&quot;RoboSystems&quot;, the
              &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot;
              &quot;our&quot;). We take your privacy seriously and are committed
              to protecting your personal information. This Privacy Policy
              describes how we collect, use, and share information when you use
              our graph database platform, data integration services, and
              applications including RoboLedger and RoboInvestor.
            </strong>
          </p>

          <p>
            This Privacy Policy (&quot;Policy&quot;) outlines our practices for
            protecting your information on the{' '}
            <Link href="/">RoboSystems.ai</Link> platform and related services
            (collectively, the &quot;Platform&quot; or &quot;Services&quot;). It
            includes the types of information we gather, how we use it, and the
            choices you have regarding our use of your information.
          </p>

          <p>
            We reserve the right to modify this Policy at any time. Each
            modification shall be effective upon its posting to the Platform.
            Your continued use of the Services following any modification
            constitutes your acceptance of the changes. It is therefore
            important that you review this Policy regularly.{' '}
            <strong>
              If you have any questions concerning this Policy, please{' '}
              <button
                onClick={() => setShowContactModal(true)}
                className="text-cyan-500 underline hover:text-cyan-400"
              >
                contact us
              </button>
              .
            </strong>
          </p>

          <p>
            <strong>1. Information We Collect</strong>
          </p>

          <p>
            <strong>Account Information:</strong> When you create an account, we
            collect your name, email address, company name, and password. For
            organization accounts, we may also collect business information
            including address, tax identification numbers, and billing details.
          </p>

          <p>
            <strong>Graph Database Content:</strong> We store and process the
            data you upload to your graph database, including financial data,
            operational data, and any custom data structures you create. This
            data remains your property, and we only process it to provide our
            Services.
          </p>

          <p>
            <strong>Integration Data:</strong> When you connect third-party
            services (like QuickBooks or Plaid), we collect authentication
            tokens and sync data as authorized by you. We store this data
            securely in your isolated graph database instance.
          </p>

          <p>
            <strong>Usage Information:</strong> We collect information about how
            you use our Platform, including:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>API calls and credit consumption</li>
            <li>Query patterns and performance metrics</li>
            <li>Feature usage and interaction patterns</li>
            <li>Error logs and debugging information</li>
          </ul>

          <p>
            <strong>Technical Information:</strong> We automatically collect
            certain technical information, including:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>IP addresses and device information</li>
            <li>Browser type and operating system</li>
            <li>Access times and referring URLs</li>
            <li>Cookie data and similar tracking technologies</li>
          </ul>

          <p>
            <strong>2. How We Use Your Information</strong>
          </p>

          <p>We use the information we collect to:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Provide Services:</strong> Operate your graph database,
              process queries, manage integrations, and deliver our applications
            </li>
            <li>
              <strong>Maintain Security:</strong> Protect against unauthorized
              access, fraud, and abuse of our Platform
            </li>
            <li>
              <strong>Improve Performance:</strong> Optimize query performance,
              enhance features, and develop new capabilities
            </li>
            <li>
              <strong>Manage Billing:</strong> Process payments, track credit
              usage, and manage subscriptions
            </li>
            <li>
              <strong>Provide Support:</strong> Respond to inquiries, provide
              technical assistance, and send service updates
            </li>
            <li>
              <strong>Ensure Compliance:</strong> Meet legal obligations and
              enforce our Terms of Service
            </li>
          </ul>

          <p>
            <strong>3. How We Share Your Information</strong>
          </p>

          <p>
            We do not sell, rent, or trade your personal information. We may
            share your information only in the following circumstances:
          </p>

          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Service Providers:</strong> We use trusted third-party
              services including AWS for infrastructure, Stripe for payment
              processing, and other providers necessary to deliver our Services
            </li>
            <li>
              <strong>Shared Repositories:</strong> When you access shared data
              repositories (like SEC data), your queries may be logged for
              performance and compliance purposes
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              if required by law, subpoena, or court order, or to protect our
              rights or the safety of others
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              acquisition, or sale of assets, your information may be
              transferred as part of the transaction
            </li>
            <li>
              <strong>Aggregated Data:</strong> We may share anonymized,
              aggregated data that cannot identify you personally for research
              or marketing purposes
            </li>
          </ul>

          <p>
            <strong>4. Data Security and Retention</strong>
          </p>

          <p>
            We implement industry-standard security measures to protect your
            information, including:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Encryption of data at rest and in transit</li>
            <li>Isolated database instances for each organization</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls and authentication mechanisms</li>
            <li>
              Regular backups with retention based on your subscription tier
            </li>
          </ul>

          <p>
            We retain your information for as long as necessary to provide our
            Services and comply with legal obligations. When you cancel your
            subscription, we provide a 30-day grace period for data export
            before permanent deletion.
          </p>

          <p>
            <strong>5. Your Rights and Choices</strong>
          </p>

          <p>You have the right to:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Access:</strong> Request a copy of the personal
              information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate
              information in your account
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and
              associated data
            </li>
            <li>
              <strong>Portability:</strong> Export your graph database content
              in standard formats
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing
              communications (service-related communications cannot be opted out
              of while using our Services)
            </li>
          </ul>

          <p>
            To exercise these rights, please{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-cyan-500 underline hover:text-cyan-400"
            >
              contact us
            </button>{' '}
            with your request.
          </p>

          <p>
            <strong>6. Cookies and Tracking Technologies</strong>
          </p>

          <p>
            We use cookies and similar technologies to enhance your experience,
            including:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Essential Cookies:</strong> Required for Platform
              functionality and security
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand usage
              patterns and improve our Services
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings and
              preferences
            </li>
          </ul>

          <p>
            You can control cookies through your browser settings, but disabling
            certain cookies may limit Platform functionality.
          </p>

          <p>
            <strong>7. International Data Transfers</strong>
          </p>

          <p>
            Our Services are primarily hosted in the United States. If you
            access our Platform from outside the United States, your information
            may be transferred to and processed in the United States or other
            countries. By using our Services, you consent to such transfers.
          </p>

          <p>
            <strong>8. Children&apos;s Privacy</strong>
          </p>

          <p>
            Our Services are not intended for users under 18 years of age. We do
            not knowingly collect personal information from children. If you
            believe we have inadvertently collected information from a minor,
            please{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-cyan-500 underline hover:text-cyan-400"
            >
              contact us
            </button>{' '}
            immediately.
          </p>

          <p>
            <strong>9. California Privacy Rights</strong>
          </p>

          <p>
            California residents have additional rights under the California
            Consumer Privacy Act (CCPA), including the right to know what
            personal information we collect, the right to delete personal
            information, and the right to opt-out of the sale of personal
            information (which we do not do). To exercise these rights, please{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-cyan-500 underline hover:text-cyan-400"
            >
              contact us
            </button>
            .
          </p>

          <p>
            <strong>10. Contact Information</strong>
          </p>

          <p>
            If you have questions about this Privacy Policy or our privacy
            practices, please{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-cyan-500 underline hover:text-cyan-400"
            >
              contact us
            </button>
            . We will respond to your inquiry within a reasonable timeframe.
          </p>

          <p>
            <strong>Data Protection Officer</strong>
            <br />
            RFS LLC
            <br />
            DBA RoboSystems
            <br />
            Wyoming, United States
          </p>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Privacy Inquiry"
        description="Have questions about our Privacy Policy or how we handle your data? Send us a message and we'll respond promptly."
        formType="privacy-inquiry"
      />
    </>
  )
}
