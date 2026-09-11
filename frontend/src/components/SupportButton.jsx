import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupportButton() {
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/content/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  if (!settings) return null;
  const hasAny = (settings.showWhatsapp && settings.supportWhatsapp) ||
                 (settings.showPhone && settings.supportPhone) ||
                 (settings.showEmail && settings.supportEmail);
  if (!hasAny) return null;

  const waUrl = settings.supportWhatsapp
    ? `https://wa.me/${settings.supportWhatsapp}?text=${encodeURIComponent(settings.supportMessage || '')}`
    : null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
        aria-label="Support"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Contact options popup */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-56">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {settings.supportLabel || 'Customer Support'}
          </p>
          <div className="space-y-2">
            {settings.showWhatsapp && settings.supportWhatsapp && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-3 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                <span className="text-xl">📲</span>
                <span>WhatsApp Us</span>
              </a>
            )}
            {settings.showPhone && settings.supportPhone && (
              <a href={`tel:${settings.supportPhone}`}
                className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                <span className="text-xl">📞</span>
                <span>Call Us</span>
              </a>
            )}
            {settings.showEmail && settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`}
                className="flex items-center gap-3 bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                <span className="text-xl">✉️</span>
                <span>Email Us</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </>
  );
}
