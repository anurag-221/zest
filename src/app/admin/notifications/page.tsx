'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Bell, Users, Send, Clock, CheckCircle, AlertCircle,
  Megaphone, Gift, Laugh, Zap, ChevronDown, RefreshCw, Search
} from 'lucide-react';
import { getSubscribers, getCampaigns, sendCampaignNow, saveCampaign, type PushCampaign } from '@/actions/notification-actions';

const CAMPAIGN_TYPES = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'bg-blue-100 text-blue-700' },
  { value: 'offer',        label: 'Offer / Deal',  icon: Gift,     color: 'bg-green-100 text-green-700' },
  { value: 'alert',        label: 'Alert',          icon: Zap,      color: 'bg-red-100 text-red-700' },
  { value: 'joke',         label: 'Fun / Joke',     icon: Laugh,    color: 'bg-yellow-100 text-yellow-700' },
];

const STATUS_BADGES: Record<string, string> = {
  sent:      'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft:     'bg-gray-100 text-gray-600',
  failed:    'bg-red-100 text-red-700',
};

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [tab, setTab] = useState<'compose' | 'subscribers' | 'history'>('compose');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Composer state
  const [form, setForm] = useState({
    title: '',
    body: '',
    url: '/',
    icon: '/icon-192.png',
    type: 'announcement',
    target_type: 'all',
    target_ids: [] as string[],
    scheduled_at: '',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [subSearch, setSubSearch] = useState('');

  const loadData = () => {
    startTransition(async () => {
      const [subs, camps] = await Promise.all([getSubscribers(), getCampaigns()]);
      setSubscribers(subs);
      setCampaigns(camps);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSendNow = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setResult({ type: 'error', msg: 'Title and message are required.' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await sendCampaignNow({ ...form, id: `camp-${Date.now()}` });
      setResult({ type: 'success', msg: `✅ Sent to ${res.sent} subscribers!` });
      setForm(prev => ({ ...prev, title: '', body: '' }));
      loadData();
    } catch (e: any) {
      setResult({ type: 'error', msg: e.message });
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.scheduled_at) {
      setResult({ type: 'error', msg: 'Title, message and schedule time are required.' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      await saveCampaign({
        ...form,
        type: form.type as 'offer' | 'alert' | 'joke' | 'announcement',
        target_type: form.target_type as 'all' | 'city' | 'users',
        status: 'scheduled',
      });

      setResult({ type: 'success', msg: '✅ Campaign scheduled!' });
      setForm(prev => ({ ...prev, title: '', body: '', scheduled_at: '' }));
      loadData();
    } catch (e: any) {
      setResult({ type: 'error', msg: e.message });
    } finally {
      setSending(false);
    }
  };

  const filteredSubs = subscribers.filter(s => {
    const u = (s.users || {}) as any;
    return !subSearch || u?.name?.toLowerCase().includes(subSearch.toLowerCase()) || u?.phone?.includes(subSearch);
  });

  const selectedType = CAMPAIGN_TYPES.find(t => t.value === form.type) || CAMPAIGN_TYPES[0];

  if (!mounted) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{subscribers.length} active subscribers</p>
        </div>
        <button onClick={loadData} disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={15} className={isPending ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'compose',     label: 'Compose',     icon: Send },
          { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: Users },
          { id: 'history',     label: 'History',     icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── COMPOSE TAB ── */}
      {tab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Compose Campaign</h2>

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {result.msg}
              </div>
            )}

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button key={value} type="button" onClick={() => setForm(p => ({ ...p, type: value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.type === value ? `${color} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. ⚡ Flash Sale — 50% off electronics!"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/64 characters recommended</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4}
                placeholder="Write your message here…"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.body.length}/140 characters recommended</p>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tap Action URL</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="/products or https://..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none" />
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '🌐 All Subscribers' },
                  { value: 'users', label: '👤 Specific Users' },
                ].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setForm(p => ({ ...p, target_type: value }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${form.target_type === value ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
              <input type="datetime-local" value={form.scheduled_at}
                onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none" />
              <p className="text-xs text-gray-400 mt-1">Leave blank to send immediately</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSendNow} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={17} />}
                Send Now
              </button>
              <button onClick={handleSchedule} disabled={sending || !form.scheduled_at}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-60">
                <Clock size={17} /> Schedule
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Preview</p>
              <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
                {/* Mock phone notification */}
                <div className="bg-gray-800 rounded-xl p-3 flex gap-3 items-start">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{form.title || 'Your notification title'}</p>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{form.body || 'Your message will appear here on the user\'s device.'}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-[10px] text-center">Zest · now</p>
              </div>

              <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${selectedType.color}`}>
                <selectedType.icon size={12} />
                {selectedType.label}
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Audience Stats</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total subscribers</p>
                  <p className="text-sm font-bold text-gray-900">{subscribers.length}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Target reach</p>
                  <p className="text-sm font-bold text-indigo-600">
                    {form.target_type === 'all' ? `~${subscribers.length}` : `${form.target_ids.length} users`}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Campaigns sent</p>
                  <p className="text-sm font-bold text-gray-900">{campaigns.filter(c => c.status === 'sent').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIBERS TAB ── */}
      {tab === 'subscribers' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={subSearch} onChange={e => setSubSearch(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <span className="text-sm text-gray-500">{filteredSubs.length} results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Phone', 'Subscribed At'].map(h => (
                    <th key={h} className="p-4 text-xs font-bold text-gray-500 uppercase text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSubs.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-sm text-gray-400">No subscribers yet</td></tr>
                ) : filteredSubs.map((s, i) => {
                  const u = s.users as any;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                            {u?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{u?.name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{u?.phone || '—'}</td>
                      <td className="p-4 text-sm text-gray-400">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Campaign', 'Type', 'Target', 'Status', 'Sent At', 'Recipients'].map(h => (
                  <th key={h} className="p-4 text-xs font-bold text-gray-500 uppercase text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-400">No campaigns yet</td></tr>
              ) : campaigns.map(c => {
                const typeInfo = CAMPAIGN_TYPES.find(t => t.value === c.type);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{c.title}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.body}</p>
                    </td>
                    <td className="p-4">
                      {typeInfo && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          <typeInfo.icon size={11} /> {typeInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500">{c.target_type === 'all' ? '🌐 All' : `👤 ${c.target_ids?.length || 0} users`}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_BADGES[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{c.sent_at ? new Date(c.sent_at).toLocaleString() : (c.scheduled_at ? `⏰ ${new Date(c.scheduled_at).toLocaleString()}` : '—')}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">{c.recipient_count ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
