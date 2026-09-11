import React from 'react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = '11 September 2026';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="grad-brand px-5 pt-10 pb-6 text-white">
        <Link to="/login" className="text-white/80 text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-extrabold mt-2">Terms &amp; Conditions</h1>
        <p className="text-white/70 text-xs mt-1">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 text-sm leading-relaxed text-gray-700 space-y-6">

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs">
            Please read these Terms carefully. By registering for or using ApiMitra ("the
            Platform"), you ("the User") agree to be bound by these Terms &amp; Conditions
            and our Privacy Policy. If you do not agree, do not use the Platform.
          </div>

          <Section n="1" title="The service">
            <p>
              ApiMitra is a reseller platform that provides access to third-party
              verification services (such as PAN, vehicle registration and related lookups)
              on a prepaid, pay-per-query basis. We act as an intermediary; the underlying
              data is supplied by external API providers and government-linked sources.
            </p>
          </Section>

          <Section n="2" title="Eligibility & account">
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old and legally able to enter a contract.</li>
              <li>You must provide accurate registration and KYC details (name, business, mobile, email, Aadhaar, PAN).</li>
              <li>New accounts require admin approval before services can be used.</li>
              <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
              <li>We may reject, suspend or block any account at our discretion, including for suspected fraud or misuse.</li>
            </ul>
          </Section>

          <Section n="3" title="Acceptable use — lawful purpose only">
            <p>You agree that you will:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Only run queries for a legitimate, lawful business purpose.</li>
              <li>Have the necessary consent or legal authority before querying any individual's data.</li>
              <li>Not use any result to harass, stalk, defraud, impersonate, discriminate against, or otherwise harm any person.</li>
              <li>Not resell, scrape, bulk-harvest, or build a competing database from the results.</li>
              <li>Comply with all applicable laws, including data-protection and privacy laws.</li>
            </ul>
            <p className="mt-2 font-semibold text-gray-800">
              You are solely responsible for how you use the data you retrieve. Any unlawful
              use is a material breach and may result in immediate termination and reporting
              to authorities.
            </p>
          </Section>

          <Section n="4" title="Wallet, pricing & payments">
            <ul className="list-disc pl-5 space-y-1">
              <li>Services are prepaid. You add funds to your wallet (via Razorpay) and each query deducts the displayed per-query charge.</li>
              <li>Prices are shown before you run a query and may change with notice.</li>
              <li>A query that returns a valid provider response is chargeable even if the result is "not found", because the provider has been billed.</li>
              <li>Wallet balances are for platform use only and are not transferable or withdrawable as cash unless required by law.</li>
            </ul>
          </Section>

          <Section n="5" title="Refunds">
            <ul className="list-disc pl-5 space-y-1">
              <li>Charges for successfully executed queries are generally non-refundable.</li>
              <li>If a query fails due to a verified fault on our side (not the provider's data), we may credit the amount back to your wallet.</li>
              <li>Refund requests must be raised through support with the transaction reference.</li>
            </ul>
          </Section>

          <Section n="6" title="Accuracy & no warranty on data">
            <p>
              Results are provided by third-party sources on an "as-is" basis. We do not
              generate, verify or guarantee the accuracy, completeness or timeliness of any
              result. You must not treat a result as conclusive proof and should
              independently verify before relying on it for any decision.
            </p>
          </Section>

          <Section n="7" title="Service availability">
            <p>
              We aim for high availability but do not guarantee uninterrupted service.
              Third-party APIs may be slow, unavailable or discontinued, which is outside
              our control. We may modify, suspend or discontinue any service at any time.
            </p>
          </Section>

          <Section n="8" title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, ApiMitra and its operators are not
              liable for any indirect, incidental or consequential damages, loss of profits,
              or losses arising from (a) inaccurate third-party data, (b) your use or misuse
              of results, (c) service interruptions, or (d) unauthorised access to your
              account caused by your failure to protect your credentials. Our total
              liability for any claim is limited to the amount you paid for the specific
              query giving rise to the claim.
            </p>
          </Section>

          <Section n="9" title="Indemnity">
            <p>
              You agree to indemnify and hold harmless ApiMitra, its operators and providers
              from any claim, loss, liability or expense (including legal fees) arising from
              your breach of these Terms, your misuse of the Platform, or your unlawful use
              of any data retrieved.
            </p>
          </Section>

          <Section n="10" title="Suspension & termination">
            <p>
              We may suspend or terminate your account immediately for breach of these Terms,
              suspected fraud, non-payment, or unlawful use. On termination, your right to
              use the Platform ends; retention and deletion of your data follow our Privacy
              Policy.
            </p>
          </Section>

          <Section n="11" title="Governing law & disputes">
            <p>
              These Terms are governed by the laws of India. Any dispute is subject to the
              exclusive jurisdiction of the competent courts at the operator's registered
              place of business.
            </p>
          </Section>

          <Section n="12" title="Changes to these Terms">
            <p>
              We may update these Terms from time to time. Continued use after an update
              means you accept the revised Terms.
            </p>
          </Section>

          <Section n="13" title="Contact">
            <p>
              Questions about these Terms? Reach us through the in-app support button or the
              contact details on your dashboard.
            </p>
          </Section>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link to="/privacy" className="text-indigo-600 font-semibold">Read our Privacy Policy &rarr;</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          This document is a general template and not legal advice. Have it reviewed by a
          qualified lawyer before going live.
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
