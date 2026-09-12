import React from 'react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-6 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-xl font-extrabold">🔐 ApiMitra</Link>
          <Link to="/" className="text-sm text-white/80 hover:text-white">← Home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-2xl bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Refund &amp; Cancellation Policy</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service
            that you have purchased through the Platform. Under this policy:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
            <li>
              Cancellations will only be considered if the request is made within 1 day of placing the order. However,
              cancellation requests may not be entertained if the orders have been communicated to the sellers /
              merchant(s) listed on the Platform and they have initiated the process of fulfilling them.
            </li>
            <li>
              ApiMitra does not accept cancellation requests for instantly-delivered digital services once a query has
              been successfully processed and the result delivered.
            </li>
            <li>
              In case of a failed transaction where the amount was debited but the service was not delivered, please
              report to our customer service team within 1 day of the transaction. The request will be verified against
              our transaction logs and the payment gateway records.
            </li>
            <li>
              In case of any refunds approved by ApiMitra, it will take up to 7 days for the refund to be processed to
              you through the original payment method.
            </li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-slate-800">Return Policy</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            We offer a refund / exchange within the first 1 day from the date of your purchase. If 1 day has passed
            since your purchase, you will not be offered a return, exchange or refund of any kind.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            For any accepted refund request, once your request is received and inspected by us, we will send you an email
            to notify you. If the request is approved after verification at our end, it will be processed in accordance
            with our policies.
          </p>

          <div className="mt-8 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
            <strong>Questions?</strong> Contact our support team through the in-app support button or your registered
            email, and we will help you promptly.
          </div>

          <p className="mt-6 text-xs text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/terms" className="mx-2 hover:text-indigo-600">Terms</Link>·
          <Link to="/privacy" className="mx-2 hover:text-indigo-600">Privacy Policy</Link>
        </div>
      </main>
    </div>
  );
}
