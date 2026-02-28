'use client'

import ContactModal from '@/components/landing/ContactModal'
import Link from 'next/link'
import { useState } from 'react'

export default function TermsOfService() {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <section>
        <div className="terms-content mx-auto max-w-(--breakpoint-md) px-4 py-8 text-left lg:px-12 lg:py-16 dark:text-white [&>h1]:mb-8 [&>h1]:text-3xl [&>h1]:font-bold [&>p]:mb-6 [&>p>strong:only-child]:mt-8 [&>p>strong:only-child]:mb-4 [&>p>strong:only-child]:block [&>p>strong:only-child]:text-xl [&>p>strong:only-child]:font-bold [&>ul]:mb-6 [&>ul]:ml-6 [&>ul>li]:mb-2">
          <h1>
            <strong>TERMS OF SERVICE</strong>
          </h1>

          <p className="mb-12 text-gray-600 dark:text-gray-400">
            Last Revision: October 1, 2025
          </p>

          <p className="mt-8 text-2xl font-semibold">
            <strong>Introduction</strong>
          </p>
          <p>
            PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THE
            ROBOSYSTEMS PLATFORM, GRAPH DATABASE SERVICES, OR ACCESSING ANY DATA
            REPOSITORIES PROVIDED THROUGH OUR SERVICE.
          </p>

          <p>
            <strong>
              RFS LLC is a Wyoming Limited Liability Company, operating under
              the fictitious name RoboSystems (&quot;RoboSystems&quot;, the
              &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot;
              &quot;our&quot;). RoboSystems provides a managed graph database
              platform, data integration services, and access to shared data
              repositories through the <Link href="/">RoboSystems.ai</Link>{' '}
              website, APIs, and related applications including RoboLedger and
              RoboInvestor (collectively, the &quot;Platform&quot; or
              &quot;Services&quot;){' '}
            </strong>
            subject to Your{' '}
            <strong>(&quot;You&quot; or &quot;Your&quot;) </strong>
            acceptance of these Terms of Service{' '}
            <strong>(&quot;Terms&quot;)</strong>. By accessing, using, or
            subscribing to any part of our Platform, including graph databases,
            data repositories, or applications, You agree to be bound by these
            Terms. If You do not accept all of these Terms, You must not use our
            Services.
          </p>

          <p>
            The Company reserves the right to modify these Terms at any time.
            Each modification shall be effective upon its posting to the
            Platform. Your continued use of the Services following any such
            modification constitutes Your acceptance of the changes. It is
            therefore important that You review the Terms regularly.{' '}
            <strong>
              If You have any questions concerning these Terms, please{' '}
              <button
                onClick={() => setShowContactModal(true)}
                className="text-cyan-500 underline hover:text-cyan-400"
              >
                contact us.
              </button>
            </strong>
          </p>

          <p>
            <strong>1. Eligibility and Service Types</strong>
          </p>

          <p>
            The RoboSystems Platform is intended solely for business entities
            and individuals who are eighteen (18) years of age or older. By
            using the Platform and/or subscribing to any RoboSystems services,
            You confirm and represent that You are at least eighteen (18) years
            of age or older and have the legal capacity to enter into this
            agreement. If You are using the Platform on behalf of an
            organization, You represent and warrant that You have the authority
            to bind that organization to these Terms.
          </p>

          <p className="mb-6">Our Services include:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Graph Database Subscriptions:</strong> Managed graph
              database instances for storing and analyzing your company's
              financial and operational data. All database operations are
              included - you only pay for AI agent calls and analysis
              operations. Enterprise and Premium tiers include advanced subgraph
              capabilities for version control and isolated environments.
            </li>
            <li>
              <strong>Platform Access:</strong> When you purchase a graph
              database, you receive access to use your graph and all its
              subgraphs on the RoboLedger and RoboInvestor applications, as well
              as through our APIs and Model Context Protocol (MCP) tools.
            </li>
            <li>
              <strong>Subgraph Management:</strong> Enterprise and Premium
              subscriptions include the ability to create unlimited subgraphs -
              isolated database environments that share the parent graph's
              infrastructure and credit pool. Use subgraphs for
              development/staging environments, department-specific data
              isolation, AI memory layers, or version-controlled snapshots of
              your data.
            </li>
            <li>
              <strong>Shared Data Repository Subscriptions:</strong> Access to
              curated data products including the SEC XBRL filing repository,
              which provides semantically rich financial data for public
              companies for benchmarking and analysis.
            </li>
            <li>
              <strong>Integration Services:</strong> Connectors for QuickBooks,
              Plaid, and other financial systems to automatically sync data into
              your graph database.
            </li>
          </ul>

          <p>
            <strong>2. Platform Content and Graph Database Ownership</strong>
          </p>

          <p>
            <strong>Platform Content:</strong> All Platform infrastructure,
            software, documentation, APIs, and general content provided by
            RoboSystems (excluding Your Data as defined below) is the
            proprietary information of the Company, with all rights reserved.
            This includes our graph database technology, integration services,
            MCP tools, and application interfaces.
          </p>

          <p>
            <strong>Your Graph Database:</strong> When You subscribe to a graph
            database:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              You receive a managed instance of a graph database dedicated to
              your organization.
            </li>
            <li>
              All data You upload, import, or create within your graph database
              (&quot;Your Data&quot;) remains your property.
            </li>
            <li>You retain all intellectual property rights to Your Data.</li>
            <li>
              You are responsible for the accuracy, legality, and integrity of
              Your Data.
            </li>
            <li>
              You grant us a limited license to process, store, backup, and
              display Your Data solely for the purpose of providing the
              Services.
            </li>
          </ul>

          <p>
            <strong>Shared Data Repositories:</strong> Content in shared data
            repositories (such as the SEC XBRL repository) is either:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Public domain data that we have processed, structured, and
              enhanced for graph database use, or
            </li>
            <li>
              Licensed data from third parties that we make available under
              specific subscription terms.
            </li>
          </ul>
          <p>
            Your subscription to shared repositories grants You the right to
            query and analyze this data for your business purposes, but not to
            redistribute or resell the processed data.
          </p>

          <p>
            <strong>API and Usage Limits:</strong> Your use of our Platform's AI
            features is subject to the AI credit limits of your subscription
            tier. Database operations, queries, imports, and exports do not
            consume credits. You agree not to:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Circumvent credit or rate limiting mechanisms</li>
            <li>Use automated systems that exceed reasonable usage patterns</li>
            <li>
              Attempt to access data or features beyond your subscription level
            </li>
            <li>
              Reverse engineer our graph database technology or algorithms
            </li>
            <li>
              Share your API keys or credentials with unauthorized parties
            </li>
          </ul>

          <p>
            <strong>3. Service Level and Support</strong>
          </p>

          <p>
            <strong>Service Availability:</strong> We strive to maintain high
            availability of our Platform, with different service levels and
            support options based on your subscription tier. Higher tiers
            receive priority support and enhanced infrastructure isolation.
          </p>

          <p>
            <strong>Data Backup and Recovery:</strong> We maintain regular
            backups of your graph database with retention periods varying by
            subscription tier. However, You are responsible for maintaining your
            own backups of critical data.
          </p>

          <p>
            <strong>Limitations:</strong> While we make commercially reasonable
            efforts to provide reliable Services, we cannot guarantee that the
            Platform will be uninterrupted, error-free, or meet all your
            requirements. Shared data repositories are updated on a best-effort
            basis, and we do not guarantee real-time data availability.
          </p>
          <p>
            <strong>4. Third Parties</strong>
          </p>

          <p>
            The Website displays links to other websites and content,
            information and data obtained from other websites. You agree that we
            are not responsible or liable for any actions or inactions of other
            websites. You understand that we may use third-party vendors to
            provide necessary hardware, software, networking, storage, and
            related technology to run the Website. You agree and acknowledge
            that we are not responsible in any manner whatsoever for any actions
            or inactions of such third-parties.
          </p>

          <p>
            <strong>5. Privacy</strong>
          </p>

          <p>
            Your use of our site is subject to our{' '}
            <strong>
              <a href="/privacy">Privacy Policy</a>.{' '}
            </strong>
            You have read that privacy policy and it is reasonable and
            acceptable to You. Your acceptance of these Terms is also Your
            consent to the information practices in our privacy policy.
          </p>

          <p>
            <strong>6. Intellectual Property</strong>
          </p>

          <p>
            Using the Website does not give you ownership or license of any
            intellectual property rights in the Website or in any content,
            information or data accessed on or through the Website, including
            content, information and data obtained from a third-party service.
          </p>
          <p>
            It is your responsibility to comply with any copyright laws that
            govern the content, information or data accessed on or through the
            Website. Neither these Terms nor your use of the Website grant you
            any right to use any trademark or service-mark accessed on or
            through the Website. By making a query on the Website, you agree
            that we can store the query in log files, and use it to generate the
            results given back to you. You also agree that we may use your
            queries to evaluate and enhance performance of the Website and to
            study usage patterns.
          </p>
          <p>
            You will not have ownership rights to any type of data or
            information obtained through the RoboSystems website, application
            programming interface(s) (API), or any other services provided by
            RoboSystems. This includes any data or information collected or
            created by RoboSystems and/or provided by any outside publisher
            under a contract with RoboSystems (collectively, the &quot;Services
            Data&quot;). The Services Data, including but not limited to text,
            content, and data, is protected by copyrights, trademarks, service
            marks, international treaties, and/or other proprietary rights and
            laws of the U.S. and other countries. The Services Data is also
            protected as a collective work or compilation under U.S. copyright
            and other laws and treaties. You agree to abide by all additional
            copyright notices or restrictions contained in the Services Data.
            You may not use the Services Data for any illegal purpose or in any
            manner inconsistent with the terms. You acknowledge that the
            Services Data has been developed, compiled, prepared, revised,
            selected and arranged by RoboSystems and others (including
            Third-Party Data Providers) through the application of methods and
            standards of judgment developed and applied through the expenditure
            of substantial time, effort and money and constitutes valuable
            intellectual property and trade secrets of RoboSystems and such
            others. You agree to protect the proprietary rights of RoboSystems
            and all others having rights in the Services Data during and after
            the term of this agreement and to comply with all reasonable written
            requests made by RoboSystems to protect RoboSystems&apos;s and
            others&apos; contractual, statutory and common law rights in the
            Data. You agree to notify RoboSystems in writing promptly upon
            becoming aware of any unauthorized access or use of the Services
            Data by any party or of any claim that the Services Data infringes
            upon any copyright, trademark, or other contractual, statutory or
            common law rights. You acquire absolutely no rights or licenses in
            or to the Service and materials contained therein other than the
            limited right to utilize the Service in accordance with the terms.
            You may not offer this Data, or any part thereof, for sale, rent,
            license or commercial redistribution.
          </p>

          <p>
            <strong>7. Trademarks</strong>
          </p>

          <p>
            <strong>
              &quot;RoboSystems&quot;, &quot;
              <Link href="/">robosystems.ai</Link>
              &quot;, the RoboSystems logos and any other product or service
              name or slogan contained in the Site are marks of RoboSystems.
              RoboSystems has applied for federal trademark registration and
              these marks may not be copied, imitated or used, in whole or in
              part, without the prior written permission of RoboSystems.{' '}
            </strong>
            You may not use any metatags or any other &quot;hidden text&quot;
            utilizing &quot;RoboSystems&quot; or any other name, trademark or
            product or service name of RoboSystems without our prior written
            permission. In addition, the look and feel of the Site, including
            all page headers, custom graphics, button icons and scripts, is the
            service mark, trademark and/or trade dress of RoboSystems and may
            not be copied, imitated or used, in whole or in part, without our
            prior written permission. All other trademarks, registered
            trademarks, product names and RoboSystems names or logos mentioned
            in the Site are the property of their respective owners. Reference
            to any products, services, processes or other information, by trade
            name, trademark, supplier or otherwise does not constitute or imply
            endorsement, sponsorship or recommendation thereof by us.
          </p>

          <p>
            <strong>8. Your Data and Graph Content</strong>
          </p>

          <p>
            <strong>Data Ownership:</strong> You retain all rights, title, and
            interest in and to Your Data that You upload, import, or create
            within your graph database. RoboSystems does not claim ownership of
            Your Data.
          </p>

          <p>
            <strong>Data Processing:</strong> By using our Services, You grant
            RoboSystems a limited, non-exclusive license to:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Store, process, and backup Your Data to provide the Services
            </li>
            <li>
              Display Your Data within the authorized applications (RoboLedger,
              RoboInvestor)
            </li>
            <li>Process Your Data through our integration services and APIs</li>
            <li>
              Generate aggregated, anonymized metrics for service improvement
              (with no personally identifiable information)
            </li>
          </ul>

          <p>
            <strong>Data Security and Privacy:</strong> We implement
            industry-standard security measures to protect Your Data, including:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Encryption at rest and in transit</li>
            <li>Isolated graph database instances</li>
            <li>Role-based access controls</li>
            <li>Regular security audits</li>
          </ul>

          <p>
            <strong>Data Portability:</strong> You may export Your Data from
            your graph database at any time using our export tools and APIs.
            Upon termination of your subscription, You will have 30 days to
            export Your Data before it is permanently deleted.
          </p>

          <p>
            <strong>Compliance:</strong> You represent and warrant that:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              You have all necessary rights to upload and process Your Data
            </li>
            <li>
              Your Data does not violate any applicable laws or regulations
            </li>
            <li>
              Your Data does not infringe on any third-party intellectual
              property rights
            </li>
            <li>
              You will comply with all applicable data protection and privacy
              laws
            </li>
          </ul>

          <p>
            <strong>9. Multi-User Access and Collaboration</strong>
          </p>

          <p>
            <strong>Graph Database Access:</strong> Your graph database
            subscription allows multiple users from your organization to access
            the same graph database and its subgraphs. You are responsible for:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Managing user access and permissions within your organization
            </li>
            <li>
              Controlling access to specific subgraphs for different teams or
              use cases
            </li>
            <li>Ensuring users comply with these Terms</li>
            <li>Activities conducted by users under your subscription</li>
            <li>Maintaining the confidentiality of access credentials</li>
          </ul>

          <p>
            <strong>Subgraph Access Control:</strong> For Enterprise and Premium
            tiers, you can create subgraphs with granular access permissions:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Subgraphs inherit the parent graph's infrastructure and credit
              pool
            </li>
            <li>
              Each subgraph maintains its own isolated database while sharing
              resources
            </li>
            <li>
              You can grant users read, write, or admin access to specific
              subgraphs
            </li>
            <li>
              All subgraph operations count against the parent graph's credit
              allocation
            </li>
          </ul>

          <p>
            <strong>Shared Repository Access:</strong> Subscriptions to shared
            data repositories (like SEC data) are per-user subscriptions and
            cannot be shared across multiple users without appropriate licenses.
          </p>

          <p>
            <strong>10. Warranty Disclaimer</strong>
          </p>

          <p>
            MAKE NO WARRANTY OF ANY KIND REGARDING OUR SITE CONTENT AND/OR ANY
            USERS CONTENT POSTED TO THE SITE, DATA, MATERIALS, INFORMATION,
            PRODUCTS OR SERVICES PROVIDED ON OUR SITE, ALL OF WHICH ARE PROVIDED
            ON AN &quot;AS IS&quot; BASIS. WE EXPRESSLY DISCLAIM ANY
            REPRESENTATION OR WARRANTY THAT OUR SITE WILL BE ERROR-FREE, SECURE
            OR UNINTERRUPTED. WE FURTHER DISCLAIM ANY WARRANTY AS TO THE
            ACCURACY, COMPLETENESS AND TIMELINESS OF ANY CONTENT OR INFORMATION
            FOUND ON OUR SITE.
          </p>

          <p>
            <strong>11. Liability Disclaimer</strong>
          </p>

          <p>
            To the maximum extent permitted under law, you agree that we are not
            liable for any loss or damage of any kind resulting from the use,
            inability to use, performance or nonperformance of the Website or
            any content, information or data accessed on or through the Website.
          </p>
          <p>
            This disclaimer of liability applies to any damages or injury caused
            by any failure of performance, error, omission, interruption,
            deletion, defect, delay in operation or transmission, computer
            virus, communication line failure, theft or destruction or
            unauthorized access to, alteration of, or use of record, whether for
            breach of contract, tortuous behavior, negligence, or under any
            other cause of action.
          </p>

          <p>
            <strong>12. Indemnification</strong>
          </p>

          <p>
            You will defend and indemnify us and any of our officers and
            employees from and against any claim, cause of action or demand,
            including without limitation reasonable legal and accounting fees,
            brought by You or on Your behalf in excess of the liability
            described above or by third parties as a result of Your breach of
            these terms and conditions or the documents made part of these terms
            and conditions by reference, Your violation of any law or the rights
            of a third party or Your use of our site.
          </p>

          <p>
            <strong>13. No Unlawful or Prohibited Use</strong>
          </p>

          <p>
            The Site is based in the United States. We make no claims concerning
            whether the Site or User Content may be downloaded, viewed, or be
            appropriate for use outside of the United States. If you access the
            Site and/or the Site or User Content from outside of the United
            States, you do so at your own risk. Whether inside or outside of the
            United States, you are solely responsible for ensuring compliance
            with the laws of your specific jurisdiction.
          </p>
          <p>
            The United States controls the export of products and information.
            You expressly agree to comply with such restrictions and not to
            export or re-export any of the Site or User Content to countries or
            persons prohibited under the export control laws. By downloading the
            Site or User Content, you are expressly agreeing that you are not in
            a country where such export is prohibited or are a person or entity
            for which such export is prohibited. You are solely responsible for
            compliance with the laws of your specific jurisdiction regarding the
            import, export, or re-export of the Site or User Content.
          </p>

          <p>
            <strong>14. Account Creation and Management</strong>
          </p>

          <p>
            <strong>Account Registration:</strong> To use our Services, You must
            create an account with accurate and complete information. You are
            responsible for:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Immediately notifying us of any unauthorized use</li>
            <li>
              Ensuring all account information remains current and accurate
            </li>
          </ul>

          <p>
            <strong>Organization Accounts:</strong> If You are creating an
            account for an organization:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              You warrant that you have authority to bind the organization
            </li>
            <li>The organization is responsible for all user activities</li>
            <li>You must designate appropriate administrators</li>
            <li>
              You are responsible for managing user access and permissions
            </li>
          </ul>

          <p>
            <strong>Graph Database Provisioning:</strong> Upon subscription to a
            graph database:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>We will provision a dedicated graph database instance</li>
            <li>You will receive API credentials and access endpoints</li>
            <li>Initial setup may take up to 24 hours</li>
            <li>You can immediately begin using the allocated credits</li>
          </ul>

          <p>
            <strong>15. User Password</strong>
          </p>

          <p>
            Your password is for Your personal use only, and You agree to keep
            it secret and not to share it with anyone (except as expressly
            allowed under this Service agreement). You ARE RESPONSIBLE FOR ALL
            USE, ACTIVITIES, AND CHARGES ASSOCIATED WITH OR ARISING FROM ANY USE
            OF YOUR PASSWORD, REGARDLESS OF WHETHER You AUTHORIZED SUCH USE. You
            MUST PROMPTLY NOTIFY RoboSystems OF ANY UNAUTHORIZED USE OF YOUR
            PASSWORD. You acknowledge and agree that RoboSystems will not be
            liable for any loss or damage arising from your failure to comply
            with these requirements.
          </p>

          <p>
            <strong>16. Pricing and Payment Terms</strong>
          </p>

          <p>
            <strong>Subscription Tiers:</strong> We offer multiple subscription
            tiers with varying AI credit allocations, base storage amounts, and
            support levels. Current pricing and tier details are available on
            our pricing page and may be updated from time to time.
          </p>

          <p>
            <strong>Subscription Types:</strong>
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              <strong>Graph Database Subscriptions:</strong> Monthly
              subscriptions for managed graph database instances with
              credit-based usage pricing
            </li>
            <li>
              <strong>Shared Repository Subscriptions:</strong> Per-user monthly
              subscriptions for access to curated data repositories
            </li>
            <li>
              <strong>AI Credit System:</strong> Only AI operations (agent
              calls, natural language analysis, AI-powered features) consume
              credits. All database operations, queries, imports, and exports
              are free and unlimited within your storage allocation.
            </li>
          </ul>

          <p>
            <strong>Payment Processing:</strong> We use Stripe as our payment
            processor. By subscribing, You agree to:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Provide accurate payment information</li>
            <li>Authorize recurring monthly charges</li>
            <li>Pay all applicable taxes and fees</li>
            <li>Maintain valid payment methods on file</li>
          </ul>

          <p>
            <strong>Billing Cycle:</strong> Subscriptions are billed monthly in
            advance. AI credits are allocated at the beginning of each billing
            cycle and do not roll over. Database operations remain included
            throughout your subscription.
          </p>

          <p>
            <strong>Overage Charges:</strong> If You exceed your monthly AI
            credit allocation, You may purchase additional credits at your
            tier's overage rate or upgrade your subscription. Database
            operations continue to work even if AI credits are exhausted.
            Storage overages beyond your base allocation are billed separately.
          </p>

          <p>
            <strong>17. Subscription Terms and Auto-Renewal</strong>
          </p>

          <p>
            <strong>Subscription Requirements:</strong> Access to RoboSystems
            Services requires an active subscription. Subscriptions include:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Graph database instances with specified AI credit allocations
            </li>
            <li>Unlimited database operations (queries, imports, exports)</li>
            <li>Base storage allocation (100GB, 500GB, or 2TB by tier)</li>
            <li>Access to RoboLedger and RoboInvestor applications</li>
            <li>API access and MCP tools</li>
            <li>Technical support based on tier</li>
          </ul>

          <p>
            <strong>Auto-Renewal:</strong> All subscriptions automatically renew
            monthly unless cancelled before the renewal date. You may cancel
            auto-renewal at any time through your account settings. Cancellation
            takes effect at the end of the current billing period.
          </p>

          <p>
            <strong>Subscription Changes:</strong> You may:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Upgrade your subscription tier at any time (prorated billing
              applies)
            </li>
            <li>Downgrade at the end of your current billing period</li>
            <li>Add or remove shared repository subscriptions</li>
            <li>Purchase additional AI credits as needed</li>
            <li>Add storage beyond your base allocation</li>
          </ul>

          <p>
            <strong>Multiple Subscriptions:</strong> Organizations may maintain
            multiple graph database subscriptions for different departments or
            use cases. Each graph database is billed separately with its own
            credit allocation.
          </p>

          <p>
            <strong>18. Cancellation, Refunds, and Data Retention</strong>
          </p>

          <p>
            <strong>Cancellation Process:</strong>
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Cancel anytime through your account settings</li>
            <li>
              Cancellation takes effect at the end of the current billing period
            </li>
            <li>
              You retain access to Services until the end of the paid period
            </li>
            <li>Unused AI credits expire at the end of the billing period</li>
            <li>
              Database operations remain accessible until subscription ends
            </li>
          </ul>

          <p>
            <strong>Refund Policy:</strong> All sales are final. We do not offer
            refunds for:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Unused AI credits or partial months</li>
            <li>Downgrading subscription tiers</li>
            <li>Dissatisfaction with Services</li>
            <li>Changes in your business requirements</li>
            <li>Unused base storage allocation</li>
          </ul>

          <p>
            <strong>Data Retention After Cancellation:</strong>
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>
              Your graph database remains accessible for 30 days after
              cancellation
            </li>
            <li>You may export Your Data during this grace period</li>
            <li>After 30 days, Your Data will be permanently deleted</li>
            <li>
              We may retain anonymized, aggregated metrics for service
              improvement
            </li>
          </ul>

          <p>
            <strong>Suspension and Termination:</strong> We may suspend or
            terminate your account for:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li>Non-payment or payment failures</li>
            <li>Violation of these Terms</li>
            <li>Abusive or fraudulent activity</li>
            <li>Excessive resource consumption beyond reasonable use</li>
          </ul>

          <p>
            <strong>19. Modifications of these Terms and Conditions </strong>
          </p>

          <p>
            RoboSystems reserves the right to change the terms, conditions, and
            notices under which this Web site is offered and You agree to accept
            and be bound by those terms, conditions, and notices that are in
            effect at the time of Your use of RoboSystems.
          </p>

          <p>
            <strong>20. Compliance and Regulatory Inquiries</strong>
          </p>

          <p>
            You are solely responsible for compliance with laws, regulations and
            policies of your employer in connection with your use of the Site.
            In the event that You or your employer receive non-routine notice or
            inquiry or investigation or request for information from any
            governmental authority or agency or any self-regulatory organization
            relating to the Site, Site Content or any User Content, You shall
            immediately notify the Company in writing except to the extent
            prohibited by law, regulation or legal process. Further, you shall
            keep the Company informed of any material developments concerning
            the matter except to the extent prohibited by law, regulation or
            legal process.
          </p>

          <p>
            <strong>21. Contact Us</strong>
          </p>

          <p>
            If You have questions or comments about these Terms of Service,
            please{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-cyan-500 underline hover:text-cyan-400"
            >
              contact us
            </button>
          </p>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Us"
        description="Have questions about our Terms of Service or need assistance? Send us a message and we'll get back to you promptly."
        formType="terms-inquiry"
      />
    </>
  )
}
