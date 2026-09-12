import React from 'react';
import { Link } from 'react-router-dom';

// ⚠️ REPLACE these placeholders with your real registered business details
// before submitting to PhonePe / any payment gateway for KYC approval.
const CONTACT = {
  businessName: 'ApiMitra',
  email: 'support@apimitra.com',      // TODO: your real support email
  phone: '+91 62657 51150',           // TODO: your real business phone
  address: 'Near Shishu Mandir, Front of Tahsil Office, Rajnandgaon Road, S. Lohara, 491995', // Chhattisgarh
  hours: 'Monday – Saturday, 10:00 AM – 7:00 PM IST',
};

export default function Contact() {
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
          <h1 className="text-2xl font-bold text-slate-800">Contact Us</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Have a question about our services, your wallet, or a transaction? Reach out to the ApiMitra team —
            we’re happy to help.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Email</div>
              <a href={`mailto:${CONTACT.email}`} className="mt-1 block text-sm font-medium text-slate-800 hover:text-indigo-600">
                {CONTACT.email}
              </a>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Phone</div>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="mt-1 block text-sm font-medium text-slate-800 hover:text-indigo-600">
                {CONTACT.phone}
              </a>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Registered Address</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{CONTACT.address}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Business Hours</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{CONTACT.hours}</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
            For payment or wallet issues, please include your registered mobile number and the transaction time so we
            can locate it quickly.
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/terms" className="mx-2 hover:text-indigo-600">Terms</Link>·
          <Link to="/privacy" className="mx-2 hover:text-indigo-600">Privacy Policy</Link>·
          <Link to="/refund-policy" className="mx-2 hover:text-indigo-600">Refund Policy</Link>
        </div>
      </main>
    </div>
  );
}
