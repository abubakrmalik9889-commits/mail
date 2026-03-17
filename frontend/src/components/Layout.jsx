import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const meta = {
  '/': { title: 'Dashboard', sub: 'Overview of your campaigns and activity' },
  '/campaigns': { title: 'Campaigns', sub: 'Manage and monitor email campaigns' },
  '/leads': { title: 'Leads', sub: 'Browse and manage your contacts' },
  '/templates': { title: 'Templates', sub: 'Create and edit email templates' },
  '/upload': { title: 'Upload Leads', sub: 'Import a CSV and launch a campaign' },
  '/settings': { title: 'Settings', sub: 'Configure your email provider' },
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const m = meta[location.pathname] || { title: 'MailFlow', sub: '' };
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '0 28px', height: 60, borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.3px', color: 'var(--text-1)', lineHeight: 1.2 }}>{m.title}</h1>
              {m.sub && <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400, marginTop: 1 }}>{m.sub}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, background: 'var(--amber-bg)', color: 'var(--amber)', padding: '4px 11px', borderRadius: 20, fontWeight: 600, border: '1px solid var(--amber-border)', letterSpacing: '.01em' }}>Demo Mode</span>
            <button onClick={() => navigate('/upload')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--shadow-brand)', transition: 'all .15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Campaign
            </button>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
