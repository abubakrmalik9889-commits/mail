import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, Badge, Button, Spinner, EmptyState } from '../components/UI';

const statusColor = { active: 'blue', done: 'green', paused: 'gray', sending: 'amber' };

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const { campaigns: c } = await api.getCampaigns(); setCampaigns(c); }
    catch (err) { console.error('Failed to load campaigns:', err); }
    finally { setLoading(false); }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 3 }}>Campaigns</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{campaigns.length} total campaigns</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/upload')}>+ New Campaign</Button>
      </div>
      {!campaigns.length
        ? <EmptyState icon="📭" title="No campaigns yet" description="Upload a CSV and launch your first campaign" action={<Button variant="primary" onClick={() => navigate('/upload')}>Create campaign</Button>} />
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {campaigns.map(c => {
            const pct = c.totalLeads ? Math.round((c.sent / c.totalLeads) * 100) : 0;
            const rr = c.sent ? ((c.replies / c.sent) * 100).toFixed(1) : 0;
            return <Card key={c.id} style={{ transition: 'box-shadow .2s,transform .2s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.2px' }}>{c.name}</span>
                    <Badge color={statusColor[c.status] || 'gray'}>{c.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>Started {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {c.followUps > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                      {c.followUps} follow-ups
                    </span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {c.status === 'active' && <Button size="sm" variant="ghost" onClick={async () => { try { await api.pauseCampaign(c.id); } catch { } setCampaigns(p => p.map(x => x.id === c.id ? { ...x, status: 'paused' } : x)); }}>Pause</Button>}
                  <Button size="sm" onClick={() => navigate(`/leads?campaignId=${c.id}`)}>View Leads</Button>
                </div>
              </div>
              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
                {[{ l: 'Total Leads', v: c.totalLeads }, { l: 'Sent', v: c.sent, color: 'var(--brand)' }, { l: 'Replies', v: c.replies, color: 'var(--green)' }, { l: 'Reply Rate', v: `${rr}%`, color: 'var(--green)' }, { l: 'Follow-ups', v: c.followUps || 0 }].map(s => (
                  <div key={s.l} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{s.l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color || 'var(--text-1)', letterSpacing: '-.3px' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontWeight: 600 }}>
                  <span>Progress</span>
                  <span>{c.sent}/{c.totalLeads} ({pct}%)</span>
                </div>
                <div style={{ height: 7, background: 'var(--surface-3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'linear-gradient(90deg,var(--green),#34D399)' : 'linear-gradient(90deg,#4F46E5,#8B5CF6)', borderRadius: 10, transition: 'width .8s ease' }} />
                </div>
              </div>
            </Card>;
          })}
        </div>
      }
    </div>
  );
}
