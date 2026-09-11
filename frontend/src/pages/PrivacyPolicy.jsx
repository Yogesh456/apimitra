import React from 'react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = '11 September 2026';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="grad-brand px-5 pt-10 pb-6 text-white">
        <Link to="/login" className="text-white/80 text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-extrabold mt-2">Privacy Policy</h1>
        <p className="text-white/70 text-xs mt-1">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 text-sm leading-relaxed text-gray-700 space-y-6">

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs">
            ApiMitra ("we", "us", "the Platform") is a service-reseller platform that lets
            authorised business users query third-party verification APIs (PAN, vehicle
            registration and related records). Because these queries involve sensitive
            personal and financial identifiers, this policy explains exactly what we
            collect, how we use it, and the safeguards we apply.
          </div>

          <Section n="1" title="Who we are & scope">
            This policy applies to the ApiMitra web application and all services offered
            through it. By creating an account or using any service, you agree to this
            Privacy Policy and our Terms &amp; Conditions.
          </Section>

          <Section n="2" title="Information we collect">
            <p className="font-semibold text-gray-800 mt-2">a. Account &amp; KYC data</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Name, shop/business name, mobile number, email address</li>
              <li>Aadhaar number and PAN number (collected for account verification)</li>
              <li>Login credentials (passwords are stored only as one-way hashes)</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-3">b. Query data</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>The identifiers you submit to run a service (e.g. an Aadhaar number, PAN, or vehicle registration number)</li>
              <li>The response returned by the third-party provider for that query</li>
              <li>Timestamp, amount charged, and a transaction reference for each query</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-3">c. Payment data</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Wallet top-ups are processed by Razorpay. We do NOT store your card, UPI or bank credentials — those are handled entirely by Razorpay under their own PCI-DSS compliant systems.</li>
              <li>We store only the payment reference, amount and status.</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-3">d. Technical data</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>IP address, browser/device type and basic usage logs, used for security and fraud prevention.</li>
            </ul>
          </Section>

          <Section n="3" title="How we use your information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and verify your account and process approvals.</li>
              <li>To execute the verification services you request and return results to you.</li>
              <li>To operate the wallet, charge for services and maintain your transaction history.</li>
              <li>To detect, prevent and investigate fraud, misuse and unauthorised access.</li>
              <li>To comply with legal, regulatory and law-enforcement obligations.</li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> sell your personal data or use it for advertising.
            </p>
          </Section>

          <Section n="4" title="Third-party data you query">
            <p>
              Some services return personal data about <em>other individuals</em> (for
              example a vehicle owner's name and address). You confirm that you have a
              lawful purpose and, where required, the consent or legal authority to make
              each such query. You are solely responsible for how you use any result you
              retrieve. Misuse — including stalking, harassment, identity theft, or any
              unlawful profiling — is strictly prohibited and will result in immediate
              termination and, where appropriate, reporting to authorities.
            </p>
          </Section>

          <Section n="5" title="Data sharing & disclosure">
            <p>We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Verification API providers</strong> — the identifier you submit is forwarded to the relevant provider to fulfil your query.</li>
              <li><strong>Payment processor (Razorpay)</strong> — to process wallet top-ups.</li>
              <li><strong>Cloud/hosting &amp; database providers</strong> — who store data on our behalf under confidentiality obligations.</li>
              <li><strong>Legal authorities</strong> — when required by law, court order, or to protect our rights and users' safety.</li>
            </ul>
          </Section>

          <Section n="6" title="Data security">
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords are stored as salted one-way hashes, never in plain text.</li>
              <li>Data is transmitted over encrypted HTTPS connections.</li>
              <li>Access to admin functions and stored records is restricted to authorised administrators.</li>
              <li>API keys and secrets are held server-side and are never exposed to the browser.</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              No method of transmission or storage is 100% secure; while we use commercially
              reasonable safeguards, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section n="7" title="Data retention">
            <p>
              We retain account and transaction records for as long as your account is
              active and thereafter only as long as needed to meet legal, accounting or
              regulatory requirements, after which the data is deleted or anonymised.
              Query results are retained in your transaction history so you can view past
              results; you may request deletion as described below.
            </p>
          </Section>

          <Section n="8" title="Your rights">
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data, subject to legal retention rules.</li>
              <li>Withdraw consent, which may mean you can no longer use the services.</li>
            </ul>
            <p className="mt-2">To exercise any right, contact us using the details in section 11.</p>
          </Section>

          <Section n="9" title="Cookies & local storage">
            <p>
              We use browser storage only to keep you signed in (your session token) and
              for essential app functionality. We do not use third-party advertising or
              tracking cookies.
            </p>
          </Section>

          <Section n="10" title="Children">
            <p>
              The Platform is intended for business users aged 18 and over. We do not
              knowingly collect data from anyone under 18.
            </p>
          </Section>

          <Section n="11" title="Contact us">
            <p>
              For privacy questions, data requests or complaints, reach our support team
              through the in-app support button, or the contact details shown on your
              dashboard. We will respond within a reasonable time.
            </p>
          </Section>

          <Section n="12" title="Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes will be notified
              in-app or by email. Continued use after an update means you accept the revised
              policy.
            </p>
          </Section>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link to="/terms" className="text-indigo-600 font-semibold">Read our Terms &amp; Conditions &rarr;</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          This document is a general template and not legal advice. Have it reviewed by a
          qualified lawyer before going live, especially for Aadhaar/PAN handling compliance
          (DPDP Act, 2023 and related rules).
        </p>
      </div>
    </div>
  );
}

function Section({ n, title, children }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-1">{n}. {title}</h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
