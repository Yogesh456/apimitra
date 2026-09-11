import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NOTICE_TYPES = ['info', 'warning', 'success', 'error'];
const TYPE_COLORS = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-600 border-red-200',
};
const TYPE_ICONS = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '🚨' };

const emptyNotice = { title: '', message: '', type: 'info', isActive: true, expiresAt: '' };
const emptyBanner = { imageUrl: '', title: '', subtitle: '', linkUrl: '', order: 0, isActive: true };

export default function AdminContent() {
  const [tab, setTab] = useState('notices');
  const [notices, setNotices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({ supportWhatsapp:'', supportPhone:'', supportEmail:'', supportMessage:'Hello! I need help with ApiMitra.', supportLabel:'Customer Support', showWhatsapp:true, showPhone:false, showEmail:false });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState(emptyNotice);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [editNoticeId, setEditNoticeId] = useState(null);
  const [editBannerId, setEditBannerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadNotices = () => axios.get('/api/content/admin/notices').then(r => setNotices(r.data));
  const loadBanners = () => axios.get('/api/content/admin/banners').then(r => setBanners(r.data));

  useEffect(() => {
    loadNotices(); loadBanners();
    axios.get('/api/content/admin/settings').then(r => { if (r.data && r.data._id) setSettings(r.data); }).catch(() => {});
  }, []);

  // ── Notice handlers ──
  const openNewNotice = () => { setNoticeForm(emptyNotice); setEditNoticeId(null); setShowNoticeForm(true); };
  const openEditNotice = (n) => { setNoticeForm({ ...n, expiresAt: n.expiresAt ? n.expiresAt.slice(0,10) : '' }); setEditNoticeId(n._id); setShowNoticeForm(true); };
  const saveNotice = async () => {
    setSaving(true);
    const payload = { ...noticeForm, expiresAt: noticeForm.expiresAt || null };
    if (editNoticeId) await axios.patch(`/api/content/admin/notices/${editNoticeId}`, payload);
    else await axios.post('/api/content/admin/notices', payload);
    setShowNoticeForm(false); loadNotices(); setSaving(false); setMsg('Saved ✅');
  };
  const deleteNotice = async (id) => { if (!confirm('Delete notice?')) return; await axios.delete(`/api/content/admin/notices/${id}`); loadNotices(); };
  const toggleNotice = async (n) => { await axios.patch(`/api/content/admin/notices/${n._id}`, { isActive: !n.isActive }); loadNotices(); };

  // ── Banner handlers ──
  const openNewBanner = () => { setBannerForm(emptyBanner); setEditBannerId(null); setShowBannerForm(true); };
  const openEditBanner = (b) => { setBannerForm({ ...b }); setEditBannerId(b._id); setShowBannerForm(true); };
  const saveBanner = async () => {
    setSaving(true);
    if (editBannerId) await axios.patch(`/api/content/admin/banners/${editBannerId}`, bannerForm);
    else await axios.post('/api/content/admin/banners', bannerForm);
    setShowBannerForm(false); loadBanners(); setSaving(false); setMsg('Saved ✅');
  };
  const deleteBanner = async (id) => { if (!confirm('Delete banner?')) return; await axios.delete(`/api/content/admin/banners/${id}`); loadBanners(); };
  const toggleBanner = async (b) => { await axios.patch(`/api/content/admin/banners/${b._id}`, { isActive: !b.isActive }); loadBanners(); };

  const sn = (k) => (e) => setNoticeForm({ ...noticeForm, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const sb = (k) => (e) => setBannerForm({ ...bannerForm, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const ss = (k) => (e) => setSettings({ ...settings, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const saveSettings = async () => {
    setSettingsSaving(true);
    await axios.patch('/api/content/admin/settings', settings);
    setSettingsSaving(false); setMsg('Support settings saved ✅');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Management</h2>
      {msg && <div className="bg-green-50 text-green-700 border border-green-200 rounded p-2 mb-4 text-sm">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['notices','📢 Notices'],['banners','🖼️ Banners'],['support','📞 Support']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===t ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── NOTICES TAB ── */}
      {tab === 'notices' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{notices.length} notice(s) — shown to all users on their home screen</p>
            <button onClick={openNewNotice} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Notice</button>
          </div>
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n._id} className={`border rounded-2xl p-4 ${TYPE_COLORS[n.type]} ${!n.isActive ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{TYPE_ICONS[n.type]}</span>
                    <div>
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-sm mt-0.5">{n.message}</p>
                      {n.expiresAt && <p className="text-xs mt-1 opacity-70">Expires: {new Date(n.expiresAt).toLocaleDateString('en-IN')}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => toggleNotice(n)} className="text-xs px-2 py-1 rounded bg-white/50 border">{n.isActive ? 'Hide' : 'Show'}</button>
                    <button onClick={() => openEditNotice(n)} className="text-xs px-2 py-1 rounded bg-white/50 border">Edit</button>
                    <button onClick={() => deleteNotice(n._id)} className="text-xs px-2 py-1 rounded bg-white/50 border text-red-600">Del</button>
                  </div>
                </div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-gray-400 text-sm">No notices yet.</p>}
          </div>
        </>
      )}

      {/* ── BANNERS TAB ── */}
      {tab === 'banners' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{banners.length} banner(s) — slideshow on user home screen</p>
            <button onClick={openNewBanner} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Banner</button>
          </div>
          <div className="space-y-3">
            {banners.map(b => (
              <div key={b._id} className={`bg-white border rounded-2xl overflow-hidden flex gap-4 p-4 ${!b.isActive ? 'opacity-50' : ''}`}>
                <img src={b.imageUrl} alt={b.title} className="w-24 h-16 object-cover rounded-xl shrink-0 bg-gray-100" onError={e => e.target.src='https://placehold.co/96x64?text=IMG'} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{b.subtitle}</p>
                  <p className="text-xs text-gray-300 mt-0.5 truncate">{b.imageUrl}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Order: {b.order}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => toggleBanner(b)} className="text-xs px-2 py-1 rounded bg-gray-50 border">{b.isActive ? 'Hide' : 'Show'}</button>
                  <button onClick={() => openEditBanner(b)} className="text-xs px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700">Edit</button>
                  <button onClick={() => deleteBanner(b._id)} className="text-xs px-2 py-1 rounded bg-red-50 border border-red-100 text-red-600">Del</button>
                </div>
              </div>
            ))}
            {banners.length === 0 && <p className="text-gray-400 text-sm">No banners yet. Add image URLs below.</p>}
          </div>
        </>
      )}

      {/* ── SUPPORT TAB ── */}
      {tab === 'support' && (
        <div className="bg-white border rounded-2xl p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Customer Care / Support Info</h3>
          <p className="text-xs text-gray-400 mb-4">This info appears as a floating button on every user page.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button Label</label>
              <input value={settings.supportLabel} onChange={ss('supportLabel')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Customer Support" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number (with country code, no +)</label>
              <input value={settings.supportWhatsapp} onChange={ss('supportWhatsapp')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="919876543210" />
              <p className="text-xs text-gray-400 mt-0.5">Example: 919876543210 (91 = India code)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pre-filled WhatsApp Message</label>
              <input value={settings.supportMessage} onChange={ss('supportMessage')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Hello! I need help with ApiMitra." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number (optional)</label>
              <input value={settings.supportPhone} onChange={ss('supportPhone')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Support Email (optional)</label>
              <input value={settings.supportEmail} onChange={ss('supportEmail')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="support@apimitra.com" />
            </div>
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-gray-600 mb-1">Show buttons</p>
              {[['showWhatsapp','WhatsApp Button'],['showPhone','Phone / Call Button'],['showEmail','Email Button']].map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={settings[k]} onChange={ss(k)} />
                  {l}
                </label>
              ))}
            </div>
            <button onClick={saveSettings} disabled={settingsSaving}
              className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 mt-2">
              {settingsSaving ? 'Saving…' : 'Save Support Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── NOTICE FORM MODAL ── */}
      {showNoticeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-4">{editNoticeId ? 'Edit Notice' : 'New Notice'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input value={noticeForm.title} onChange={sn('title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. System Maintenance" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea value={noticeForm.message} onChange={sn('message')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Notice details..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={noticeForm.type} onChange={sn('type')} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expires On (optional)</label>
                  <input type="date" value={noticeForm.expiresAt} onChange={sn('expiresAt')} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="nActive" checked={noticeForm.isActive} onChange={sn('isActive')} />
                <label htmlFor="nActive" className="text-sm text-gray-700">Active (visible to users)</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowNoticeForm(false)} className="px-4 py-1.5 text-sm border rounded-lg text-gray-600">Cancel</button>
              <button onClick={saveNotice} disabled={saving} className="px-4 py-1.5 text-sm bg-blue-700 text-white rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER FORM MODAL ── */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-4">{editBannerId ? 'Edit Banner' : 'New Banner'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL *</label>
                <input value={bannerForm.imageUrl} onChange={sb('imageUrl')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://example.com/banner.jpg" />
                {bannerForm.imageUrl && <img src={bannerForm.imageUrl} className="mt-2 h-20 w-full object-cover rounded-lg bg-gray-100" onError={e => e.target.style.display='none'} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                <input value={bannerForm.title} onChange={sb('title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Banner headline" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle (optional)</label>
                <input value={bannerForm.subtitle} onChange={sb('subtitle')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Short description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" value={bannerForm.order} onChange={sb('order')} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={bannerForm.isActive} onChange={sb('isActive')} /> Active
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowBannerForm(false)} className="px-4 py-1.5 text-sm border rounded-lg text-gray-600">Cancel</button>
              <button onClick={saveBanner} disabled={saving} className="px-4 py-1.5 text-sm bg-blue-700 text-white rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
