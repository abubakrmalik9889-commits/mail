import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, Badge, Button, Spinner, Input, Toast, EmptyState } from '../components/UI';

const sc = { sent: 'blue', replied: 'green', pending: 'gray', follow_up: 'purple', error: 'red' };
const sl = { sent: 'Sent', replied: 'Replied', pending: 'Pending', follow_up: 'Follow-up', error: 'Error' };

export default function Leads() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => { load(); }, [campaignId]);
  async function load() {
    setLoading(true);
    try { const { leads: l } = await api.getLeads(campaignId); setLeads(l); }
    catch (err) { console.error('Failed to load leads:', err); }
    finally { setLoading(false); }
  }
  async function markReplied(id) {
    try { await api.markReplied(id); } catch { }
    setLeads(p => p.map(l => l.id === id ? { ...l, status: 'replied' } : l));
    setToast({ show: true, message: 'Lead marked as replied' });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  }
  const filtered = leads.filter(l => {
    const ms = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || l.status === filter;
    return ms && mf;
  });
  const counts = leads.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});

  const initials = name => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
  const avatarColor = name => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 3 }}>Leads</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{leads.length} contacts{campaignId ? ' in this campaign' : ''}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'sent', 'replied', 'follow_up', 'pending'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 13px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1px solid ${filter === s ? 'var(--brand)' : 'var(--border)'}`, background: filter === s ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'var(--surface)', color: filter === s ? 'white' : 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s', boxShadow: filter === s ? 'var(--shadow-brand)' : 'none' }}>
            {s === 'all' ? `All (${leads.length})` : `${sl[s] || s} (${counts[s] || 0})`}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', width: 230 }}><Input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
        : <Card padding="0">
          {!filtered.length
            ? <EmptyState icon="🔍" title="No leads found" description="Try adjusting your search or filter" />
            : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--surface-2)' }}>
                {['Contact', 'Email', 'Company', 'Status', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border)', transition: 'background .12s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '11px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(l.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials(l.name)}</div>
                      <span style={{ fontWeight: 600 }}>{l.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 18px', color: 'var(--brand)', fontWeight: 500 }}>{l.email}</td>
                  <td style={{ padding: '11px 18px', color: 'var(--text-2)' }}>{l.company || '—'}</td>
                  <td style={{ padding: '11px 18px' }}><Badge color={sc[l.status] || 'gray'}>{sl[l.status] || l.status}</Badge></td>
                  <td style={{ padding: '11px 18px' }}>{l.status !== 'replied' && <Button size="sm" variant="ghost" onClick={() => markReplied(l.id)}>Mark Replied</Button>}</td>
                </tr>
              ))}</tbody>
            </table>
          }
        </Card>
      }
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
