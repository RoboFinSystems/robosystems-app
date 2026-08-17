export default function MasterServiceAgreement() {
  return (
    <section>
      <div className="terms-content mx-auto max-w-(--breakpoint-md) px-4 py-8 text-left lg:px-12 lg:py-16 dark:text-white [&>h1]:mb-8 [&>h1]:text-3xl [&>h1]:font-bold [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:ml-6 [&>ul>li]:mb-2">
        <h1>
          <strong>MASTER SERVICE AGREEMENT</strong>
        </h1>

        <p className="mb-12 text-gray-600 dark:text-gray-400">
          Version 2.1 · Last Revision: August 17, 2026
        </p>

        <p>
          This Master Service Agreement (&quot;Agreement&quot;) is entered into
          between <strong>RFS LLC</strong>, a Wyoming limited liability company
          doing business as <strong>RoboSystems </strong>(&quot;Provider&quot;),
          and the customer identified on an Order Form that incorporates this
          Agreement (&quot;Customer&quot;), and is effective as of the Effective
          Date of that Order Form. If Customer and Provider have executed a
          written master service agreement covering the Services, that executed
          agreement governs in place of this one.
        </p>

        <p>
          Provider may post updated versions of this Agreement from time to
          time; the version in effect on the Effective Date of an Order Form
          continues to govern that Order Form for its term. Self-serve use of
          the platform without an Order Form is governed by the publicly
          available Terms of Service, not by this Agreement.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">
          1. Services and Structure
        </h2>

        <p>
          1.1 Provider will make available the RoboSystems platform services
          described in one or more mutually executed order forms (each an
          &quot;Order Form&quot;), together with related support
          (&quot;Services&quot;). Each Order Form incorporates this Agreement
          and exactly one Service Schedule, which states the delivery mode and
          its specific terms.
        </p>

        <p>
          1.2 Order of precedence, highest first: the Order Form; the applicable
          Service Schedule; this Agreement; any incorporated addendum.
        </p>

        <p>
          1.3 Provider contracts as the sole counterparty. Provider may perform
          its obligations through affiliates or subcontractors under a
          management or services agreement and remains responsible for their
          performance.
        </p>

        <p>
          1.4 <strong>Affiliate professional services. </strong>Provider&apos;s
          affiliate, Harbinger Consultants LLC (doing business as Harbinger
          FinLab), separately offers professional services — including
          integration development, forward-deployed engineering, and advisory
          services — under its own agreement with Customer. Those services are
          not Services under this Agreement, Provider is not responsible for
          their performance, and they are outside the scope of the examination
          described in Section 7.3, which covers only environments Provider
          operates. This Section 1.4 addresses services sold by the affiliate in
          its own name; Section 1.3 addresses the different case in which
          Provider performs its own obligations through affiliates.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">2. Access and Use</h2>

        <p>
          Customer may access and use the Services during the subscription term
          for its internal business purposes, subject to this Agreement and
          usage parameters in the Order Form. Customer is responsible for its
          users&apos; compliance, for maintaining the confidentiality of
          credentials and API keys issued to it, and for the accuracy and
          lawfulness of data it submits. Customer will not reverse engineer the
          Services (except as permitted by law or by open-source licenses
          applicable to Provider&apos;s published code), resell access or
          provide access to third parties except as expressly agreed in an Order
          Form, use the Services to violate law or third-party rights, or
          attempt to circumvent security controls or access another
          tenant&apos;s data.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">3. Fees and Payment</h2>

        <p>
          Customer will pay the fees stated in the Order Form. Fees are invoiced
          in advance at the billing frequency stated in the Order Form (monthly,
          where the Order Form does not state one), are due within thirty (30)
          days of invoice, and are non-refundable except as expressly provided
          in this Agreement. Late amounts may accrue interest at the lesser of
          1.5% per month or the maximum lawful rate. Fees exclude taxes;
          Customer is responsible for applicable taxes other than
          Provider&apos;s income taxes. Where a Service Schedule provides for
          pass-through of third-party infrastructure costs, those amounts are
          invoiced at Provider&apos;s actual cost without markup, with
          supporting detail available on request.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">4. Term and Termination</h2>

        <p>
          This Agreement runs from the Effective Date until all Order Forms
          expire or terminate. Either party may terminate this Agreement or an
          Order Form for material breach uncured within thirty (30) days of
          written notice, or immediately if the other party becomes insolvent.
          Upon termination, Customer&apos;s access ends and unpaid fees for the
          remainder of a committed term become due, except where Customer
          terminates for Provider&apos;s uncured material breach, in which case
          Provider refunds prepaid fees for the unused portion of the term.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">5. Customer Data</h2>

        <p>
          Customer retains all right, title, and interest in data submitted to
          the Services by or for Customer (&quot;Customer Data&quot;). Customer
          grants Provider a limited license to host, process, transmit, and
          display Customer Data solely to provide and support the Services.
          Provider will not sell Customer Data or use it for purposes other than
          providing the Services, improving the Services in
          aggregate/de-identified form, and complying with law. Upon termination
          Provider will capture a final export of Customer Data in a standard
          format and make it available for Customer to retrieve for ninety (90)
          days. Provider will delete Customer Data from active systems within
          sixty (60) days after termination per its Data Management Policy,
          running concurrently with that retrieval period; residual copies in
          encrypted backups expire on the backup retention schedule, not to
          exceed ninety (90) days.
        </p>

        <p>
          5.1 <strong>Export completeness. </strong>During the term, Provider
          maintains programmatic read access to Customer Data through its
          published APIs sufficient for Customer to extract its own records
          without Provider assistance. After termination, retrieval is by the
          final export described in Section 5. Credentials that Provider holds
          in encrypted form for Customer&apos;s connected third-party systems
          are not extractable by design; re-authorization of those connections
          is Customer&apos;s responsibility on any migration.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">6. Confidentiality</h2>

        <p>
          Each party will protect the other&apos;s Confidential Information with
          no less than reasonable care, use it only to perform under this
          Agreement, and not disclose it except to personnel and advisors bound
          by confidentiality obligations at least as protective, or as required
          by law with prompt notice where lawful. Confidential Information
          excludes information that is public without breach, independently
          developed, rightfully received from a third party, or already known.
          These obligations survive termination for five (5) years, and
          indefinitely for trade secrets.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">
          7. Security and Compliance
        </h2>

        <p>
          7.1 <strong>Security program. </strong>Provider will maintain a
          written information security program with administrative, technical,
          and physical safeguards appropriate to the nature of Customer Data,
          including encryption of data in transit and at rest, least-privilege
          access controls, continuous vulnerability monitoring, and logging.
          Provider&apos;s current practices are described at its public security
          page.
        </p>

        <p>
          7.2 <strong>Incident notification. </strong>Provider will notify
          Customer without undue delay, and in any event within seventy-two (72)
          hours, after confirming a security incident involving unauthorized
          access to Customer Data, and will provide information reasonably
          required for Customer&apos;s own notification obligations. Where the
          parties execute a Data Processing Addendum, it is incorporated into
          this Agreement.
        </p>

        <p>
          7.3 <strong>Attestation scope. </strong>Provider has engaged an
          independent CPA firm to perform a SOC 2 Type II examination covering
          the environments Provider operates, and on issuance will make the
          report available to Customer under confidentiality obligations, no
          more than once annually and upon reasonable request. The report covers
          only environments operated by Provider. It does not cover, and
          Customer may not represent that it covers, any environment operated by
          Customer or a third party, including any deployment of Provider&apos;s
          open-source software in infrastructure Customer controls. Where an
          environment is transferred to Customer under a Service Schedule,
          Provider&apos;s attestation coverage of that environment ends on the
          transfer date.
        </p>

        <p>
          7.4 <strong>Complementary customer controls. </strong>Provider&apos;s
          attestation assumes Customer performs the controls set out in Exhibit
          1, which correspond to the complementary user entity controls stated
          in Provider&apos;s system description. Customer&apos;s failure to
          perform them may prevent Provider&apos;s control objectives from being
          met as to Customer.
        </p>

        <p>
          7.5 <strong>Security releases. </strong>Provider may apply
          security-related updates to environments it operates at any time,
          without prior notice where delay would increase risk, and will notify
          Customer promptly thereafter. Where a Service Schedule provides for
          Customer-scheduled upgrades, that provision does not apply to security
          releases.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">
          8. Warranties and Disclaimers
        </h2>

        <p>
          Each party warrants it has authority to enter this Agreement. Provider
          warrants the Services will perform materially as described in the
          applicable documentation and that support will be provided in a
          professional manner. EXCEPT AS EXPRESSLY STATED, THE SERVICES ARE
          PROVIDED &quot;AS IS&quot; AND PROVIDER DISCLAIMS ALL OTHER
          WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR
          A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE SERVICES DO NOT
          CONSTITUTE ACCOUNTING, TAX, LEGAL, OR INVESTMENT ADVICE; PROFESSIONAL
          JUDGMENT REMAINS THE RESPONSIBILITY OF CUSTOMER AND ITS ADVISORS.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">9. Indemnification</h2>

        <p>
          Provider will defend Customer against third-party claims that the
          Services, as provided, infringe a U.S. patent, copyright, or
          trademark, and will pay resulting damages finally awarded, provided
          Customer gives prompt notice, control of the defense, and reasonable
          cooperation; Provider may modify or replace the Services or terminate
          the affected Order Form with a pro-rata refund if infringement is
          claimed. Customer will defend Provider against third-party claims
          arising from Customer Data or Customer&apos;s use of the Services in
          violation of this Agreement or law, on the same conditions.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">
          10. Limitation of Liability
        </h2>

        <p>
          EXCEPT FOR BREACH OF SECTION 6, INDEMNIFICATION OBLIGATIONS, OR A
          PARTY&apos;S WILLFUL MISCONDUCT: (A) NEITHER PARTY IS LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          LOST PROFITS, REVENUE, OR DATA; AND (B) EACH PARTY&apos;S AGGREGATE
          LIABILITY UNDER THIS AGREEMENT IS CAPPED AT THE FEES PAID OR PAYABLE
          BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE
          TO LIABILITY.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">11. Publicity</h2>

        <p>
          Neither party will use the other&apos;s name or marks in publicity
          without prior written consent, except that Provider may identify
          Customer in a customer list following Customer&apos;s written
          approval. Neither party will characterize the other&apos;s compliance
          posture inaccurately; Section 7.3 governs statements about attestation
          scope.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">
          12. Open-Source Software
        </h2>

        <p>
          Provider publishes core platform software under the Apache License
          2.0. Nothing in this Agreement limits rights Customer holds under that
          license, and nothing in that license creates obligations for Provider
          beyond its terms — in particular, software obtained under it is
          provided without warranty or support except as separately agreed.
          Services provided under this Agreement are distinct from, and
          additional to, the rights granted by that license. Customer&apos;s
          operation of the software in its own infrastructure is not governed by
          this Agreement; support of such deployments is available from
          Provider&apos;s affiliate under a separate professional services
          agreement per Section 1.4.
        </p>

        <h2 className="mt-8 mb-4 text-xl font-bold">13. General</h2>

        <p>
          Neither party may assign this Agreement without the other&apos;s
          consent, except to a successor in a merger, reorganization, or sale of
          substantially all assets. Notices must be in writing to the addresses
          on the Order Form. Neither party is liable for delay caused by events
          beyond its reasonable control. This Agreement is governed by the laws
          of the State of Wyoming, excluding conflict-of-law rules; exclusive
          venue lies in the state or federal courts located in Laramie County,
          Wyoming. Order Forms incorporating this Agreement may be executed in
          counterparts, including by electronic signature, each of which is
          deemed an original. This Agreement, with its Order Forms, Service
          Schedules, Exhibits, and incorporated addenda, is the entire agreement
          and supersedes prior discussions; amendments must be in writing signed
          by both parties.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Schedule A — Managed Platform
        </h2>

        <p>
          Applies where the Order Form designates the{' '}
          <strong>Managed Platform </strong>delivery mode.
        </p>

        <p>
          A.1 <strong>Description. </strong>Provider operates the platform as a
          multi-tenant service in Provider&apos;s production environment.
          Customer accesses it over HTTPS and holds no infrastructure
          credentials. Customer Data is logically isolated from other
          customers&apos; data through dedicated per-customer graph databases
          and schema-level separation in relational stores.
        </p>

        <p>
          A.2 <strong>Fees. </strong>Subscription fees per the Order Form, based
          on the plan, tier, and usage parameters stated there.
        </p>

        <p>
          A.3 <strong>Availability and support. </strong>Support channels,
          coverage hours, and target response times are stated in the Order
          Form. Provider provides the Services with commercially reasonable
          efforts toward continuous availability; a quantified availability
          commitment and any associated service-credit remedy apply only if and
          as expressly stated in the Order Form.
        </p>

        <p>
          A.4 <strong>Changes. </strong>Provider may update the Services, and
          will not materially reduce core functionality during a paid term
          without notice. Provider notifies Customer of critical system changes
          that may affect Customer&apos;s processing.
        </p>

        <p>
          A.5 <strong>Attestation. </strong>The Managed Platform is within the
          scope of Provider&apos;s SOC 2 examination. Section 7.3 governs.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Schedule B — Customer-Dedicated Deployment Account
        </h2>

        <p>
          Applies where the Order Form designates the{' '}
          <strong>Customer-Dedicated Deployment Account </strong>delivery mode.
        </p>

        <p>
          B.1 <strong>Description. </strong>Provider provisions and operates a
          cloud account dedicated to Customer within Provider&apos;s cloud
          organization (&quot;Deployment Account&quot;), reachable at a
          Provider-managed subdomain or through private access as stated in the
          Order Form. The Deployment Account runs the same platform software,
          security baseline, detective controls, and change-management pipeline
          as Provider&apos;s production environment.
        </p>

        <p>
          B.2 <strong>Ownership and operation. </strong>Provider owns and
          operates the Deployment Account during the term. Customer does not
          hold root credentials, administrative credentials, or any write or
          execute access to the Deployment Account. This allocation is a
          condition of Provider&apos;s operation and attestation of the account,
          not a limitation of Customer&apos;s rights in Customer Data, which are
          governed by Section 5.
        </p>

        <p>
          B.3 <strong>Customer visibility. </strong>Provider will grant Customer
          read-only access as stated in the Order Form, which may include a
          scoped read-only cross-account role, monitoring and log access, and
          Customer&apos;s own cost and usage data. Access is federated from
          Customer&apos;s identity provider; Provider does not create standing
          individual credentials for Customer personnel. Requests for
          administrative action are served through Provider&apos;s documented,
          time-boxed, logged break-glass procedure.
        </p>

        <p>
          B.4 <strong>Fees. </strong>(a) Cloud infrastructure costs, passed
          through at Provider&apos;s actual cost per Section 3; (b) a support
          and operations fee as stated in the Order Form; (c) an annual platform
          fee as stated in the Order Form; and (d) any separately quoted
          integration development. Provider does not apply enterprise discount
          or savings-plan sharing to the Deployment Account, so pass-through
          amounts reflect Customer&apos;s own consumption.
        </p>

        <p>
          B.5 <strong>Releases and upgrades. </strong>Provider deploys pinned
          platform releases to the Deployment Account on a schedule agreed with
          Customer. Security releases are exempt from that schedule and are
          applied by Provider across all deployment accounts within thirty (30)
          days of publication, per Section 7.5, and sooner where the severity
          warrants. Customer will designate a technical contact able to receive
          and acknowledge such deployments.
        </p>

        <p>
          B.6 <strong>Change management. </strong>All changes to the Deployment
          Account are made through Provider&apos;s controlled pipeline. Customer
          will not deploy, modify, or operate infrastructure in the Deployment
          Account outside that pipeline. Customer-specific integrations are
          developed and operated outside the Deployment Account and interact
          with the platform through published APIs; they are governed by a
          separate statement of work where Provider builds or hosts them.
        </p>

        <p>
          B.7 <strong>Attestation. </strong>The Deployment Account is within the
          scope of Provider&apos;s SOC 2 examination for so long as Provider
          operates it and it remains within Provider&apos;s cloud organization.
          Sections 7.3 and 7.4 govern; Exhibit 1 Section 2 applies in addition
          to Section 1.
        </p>

        <p>
          B.8 <strong>Account Transfer. </strong>Customer may request transfer
          of the Deployment Account to Customer&apos;s ownership at any time on
          written notice.
        </p>

        <p>
          (a) <strong>Notice. </strong>Customer will give thirty (30) days&apos;
          written notice of a transfer request. Service continues and is
          invoiced normally throughout the notice period, during which the
          parties execute the transfer.
        </p>

        <p>
          (b) <strong>Engagement fee. </strong>Provider will execute the
          transfer as a fixed-price service engagement at a fee equal to one (1)
          month of the support and operations fee then in effect, invoiced on
          initiation and in addition to fees for the notice-period month of
          service. This fee compensates Provider for the work of executing the
          transfer, which is separate from and additional to operating the
          Services; it is not an early-termination charge, and Customer&apos;s
          right to transfer is not conditioned on renewal or continued purchase
          of any service.
        </p>

        <p>
          (c) <strong>Timing. </strong>Provider will initiate the transfer
          within five (5) business days of notice and complete it within fifteen
          (15) business days of Customer satisfying the prerequisites in (d)
          below. Where Customer supplies the prerequisites promptly, the
          transfer completes within the notice period; delay in supplying them
          extends completion correspondingly.
        </p>

        <p>
          (d) <strong>Customer prerequisites. </strong>Customer will provide a
          root email address it controls, a payment method and cloud support
          plan election, a source repository under Customer&apos;s control, a
          target domain with DNS control, and its own developer account for any
          third-party integrations in use.
        </p>

        <p>
          (e) <strong>Included scope. </strong>Provider&apos;s fee covers: final
          backups and snapshots; re-pointing deployment identity to
          Customer&apos;s repository; domain migration; revocation of all
          Provider access paths including rotation of all secrets in the
          account; removal of the account from Provider&apos;s cloud
          organization; and delivery of an evidence bundle documenting the
          foregoing.
        </p>

        <p>
          (f) <strong>Excluded scope. </strong>Customer-side work, including
          configuration of Customer&apos;s own source control and DNS, and
          re-authorization of end-client connections to third-party accounting
          systems (necessary because connection credentials are non-extractable
          by design per Section 5.1), is Customer&apos;s responsibility or
          separately quoted.
        </p>

        <p>
          (g) <strong>Effect. </strong>On the transfer date: Provider&apos;s
          attestation coverage of the account ends; Provider ceases all
          operation, monitoring, backup, and security responsibility for the
          account; and Customer assumes all such responsibility. Provider will
          deliver written confirmation of the coverage end date. Support may
          terminate or convert to support of a customer-operated deployment
          under a professional services agreement per Section 1.4.
        </p>

        <p>
          (h) <strong>Cloud-provider cooperation. </strong>Transfer of the
          Deployment Account is subject to the cloud provider&apos;s customer
          agreement and the account-transfer mechanisms it permits. The parties
          will cooperate in good faith to complete the transfer through those
          mechanisms, including changes to the account&apos;s root contact,
          billing, and support arrangements.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Exhibit 1 — Complementary Customer Controls
        </h2>

        <p>
          These correspond to the complementary user entity controls in
          Provider&apos;s system description. Section 7.4 governs their effect.
        </p>

        <p>
          1. <strong>All customers. </strong>Customer will: (a) safeguard
          account credentials and API keys and rotate them promptly on suspected
          compromise; (b) authorize and periodically review users it invites to
          its organization and graphs; (c) ensure the accuracy and lawful
          provenance of data it connects or uploads; (d) maintain the security
          of its own connected systems, including credentials for third-party
          accounting systems; and (e) promptly report suspected security issues
          through Provider&apos;s published channels.
        </p>

        <p>
          2. <strong>Customers with a Deployment Account (Schedule B).</strong>{' '}
          Customer will additionally: (f) operate the identity provider used for
          federated access, including multi-factor authentication and timely
          joiner, mover, and leaver processing; (g) notify Provider of personnel
          changes affecting access grants and participate in periodic access
          reviews covering its roles; (h) request administrative elevation
          solely through the documented break-glass procedure and neither seek
          nor retain standing write or execute access; (i) designate a technical
          contact able to receive and acknowledge security releases within the
          agreed timeframe; and (j) refrain from deploying, modifying, or
          operating infrastructure in the Deployment Account outside
          Provider&apos;s change-management pipeline.
        </p>
      </div>
    </section>
  )
}
