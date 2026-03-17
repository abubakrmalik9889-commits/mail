import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { StatCard, Card, Badge, Button, Spinner } from '../components/UI';

const statusColor = { active: 'blue', done: 'green', paused: 'gray', sending: 'amber' };

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.sent), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = Math.max((d.sent / max) * 100, d.sent ? 3 : 0);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{d.sent || ''}</div>
            <div style={{ width: '100%', background: 'linear-gradient(180deg,#6366F1,#8B5CF6)', borderRadius: '4px 4px 0 0', height: `${h}%`, minHeight: d.sent ? 4 : 0, transition: 'height .6s cubic-bezier(.34,1.2,.64,1)', boxShadow: d.sent ? '0 2px 8px rgba(99,102,241,.35)' : 'none' }} />
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [a, act, c] = await Promise.all([api.getAnalytics(), api.getActivity(), api.getCampaigns()]);
      setAnalytics(a); setActivity(act.activity || []); setCampaigns(c.campaigns || []); setOffline(false);
    } catch (err) {
      setOffline(true);
      console.error('Failed to load dashboard data:', err);
    } finally { setLoading(false); }
  }

  const statIcons = [
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {offline && <div style={{ background: 'linear-gradient(135deg,var(--amber-bg),#FEFCE8)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 22, fontSize: 13, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>⚠</span>
        <span>Backend offline — showing demo data. Run <code style={{ fontFamily: 'var(--mono)', background: 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>cd backend && npm run dev</code></span>
      </div>}
      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
        : analytics && (<>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
            <StatCard label="Total Sent" value={analytics.totalSent?.toLocaleString()} sub="all campaigns" color="blue" icon={statIcons[0]} />
            <StatCard label="Replies" value={analytics.replies} sub={`${analytics.replyRate}% reply rate`} color="green" icon={statIcons[1]} />
            <StatCard label="Leads Contacted" value={analytics.leadsContacted?.toLocaleString()} sub="unique contacts" icon={statIcons[2]} />
            <StatCard label="Follow-ups Sent" value={analytics.followUps} sub="auto-scheduled" color="amber" icon={statIcons[3]} />
          </div>

          {/* Activity chart */}
          <Card style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-.2px' }}>Email Activity</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Emails sent over the last 7 days</div>
              </div>
              <button onClick={load} style={{ fontSize: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '5px 12px', cursor: 'pointer', color: 'var(--text-2)', fontFamily: 'var(--font)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, transition: 'all .13s' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                Refresh
              </button>
            </div>
            <BarChart data={activity} />
          </Card>

          {/* Campaigns table */}
          <Card padding="0">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-.2px' }}>Active Campaigns</div>
              <Button size="sm" onClick={() => navigate('/campaigns')}>View all →</Button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--surface-2)' }}>
                {['Campaign', 'Leads', 'Sent', 'Replies', 'Progress', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</th>)}
              </tr></thead>
              <tbody>{campaigns.map((c, ri) => {
                const pct = c.totalLeads ? Math.round((c.sent / c.totalLeads) * 100) : 0;
                return <tr key={c.id} style={{ cursor: 'pointer', borderTop: '1px solid var(--border)', transition: 'background .12s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = ''} onClick={() => navigate('/campaigns')}>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-.1px' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '13px 18px', color: 'var(--text-2)' }}>{c.totalLeads}</td>
                  <td style={{ padding: '13px 18px', color: 'var(--text-2)' }}>{c.sent}</td>
                  <td style={{ padding: '13px 18px', color: 'var(--green)', fontWeight: 700 }}>{c.replies}</td>
                  <td style={{ padding: '13px 18px', minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#4F46E5,#7C3AED)', borderRadius: 10, transition: 'width .8s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, minWidth: 30 }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 18px' }}><Badge color={statusColor[c.status] || 'gray'}>{c.status}</Badge></td>
                </tr>;
              })}</tbody>
            </table>
          </Card>
        </>)
      }
    </div>
  );
}
