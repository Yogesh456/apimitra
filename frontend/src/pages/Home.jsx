import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const services = [
  {
    icon: '🆔',
    title: 'PAN by Aadhaar',
    desc: 'Instantly fetch the PAN number linked to any Aadhaar number.',
  },
  {
    icon: '📄',
    title: 'PAN Details',
    desc: 'Get full verified PAN card details from a PAN number.',
  },
  {
    icon: '🚗',
    title: 'Vehicle RC Details',
    desc: 'Look up complete registration & owner details from a vehicle number.',
  },
];

const steps = [
  { n: '1', title: 'Create your account', desc: 'Sign up with your shop details and verify your mobile via OTP.' },
  { n: '2', title: 'Add money to wallet', desc: 'Top up securely — pay only for the queries you use.' },
  { n: '3', title: 'Start verifying', desc: 'Run PAN, Aadhaar & vehicle lookups and get instant results.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 text-white overflow-x-hidden">
      {/* Decorative glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">🔐</span>
          ApiMitra
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-indigo-700 shadow-lg transition hover:scale-105"
            >
              Go to {user.role === 'admin' ? 'Admin' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:text-white">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-indigo-700 shadow-lg transition hover:scale-105"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-10 pb-16 text-center md:pt-16">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
          ⚡ Instant KYC & Verification APIs
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Verify PAN, Aadhaar & Vehicle details in{' '}
          <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">seconds</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
          ApiMitra gives shopkeepers and businesses a simple, prepaid portal to run trusted government-data lookups —
          no paperwork, no waiting. Pay only for what you use.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'}
            className="rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-xl transition hover:scale-105"
          >
            {user ? 'Open Dashboard' : 'Get Started — It’s Free'}
          </Link>
          <Link
            to="/login"
            className="rounded-2xl border border-white/40 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Our Services</h2>
        <p className="mt-2 text-center text-white/70">Everything you need to verify your customers, in one place.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-white/15 bg-white/10 p-7 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-3xl">{s.icon}</div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/75">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-extrabold text-indigo-700">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/75">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-10 text-center backdrop-blur-md">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Create your ApiMitra account in under a minute and run your first verification today.
          </p>
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'}
            className="mt-6 inline-block rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-xl transition hover:scale-105"
          >
            {user ? 'Open Dashboard' : 'Create Free Account'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-white/70 md:flex-row">
          <div className="font-bold text-white">ApiMitra © {new Date().getFullYear()}</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/terms" className="transition hover:text-white">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link to="/refund-policy" className="transition hover:text-white">Refund &amp; Return Policy</Link>
            <Link to="/contact" className="transition hover:text-white">Contact Us</Link>
            <Link to="/login" className="transition hover:text-white">Login</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
