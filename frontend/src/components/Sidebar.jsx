import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const nav = [
  {
    label: 'Dashboard', path: '/',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  },
  {
    label: 'Campaigns', path: '/campaigns',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 9.95 19.79 19.79 0 0 1 1.18 1.4 2 2 0 0 1 3.17 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z" /></svg>
  },
  {
    label: 'Leads', path: '/leads',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  },
  {
    label: 'Templates', path: '/templates',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  },
  {
    label: 'Upload Leads', path: '/upload',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
  },
  {
    label: 'SMTP / Gmail', path: '/settings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--sidebar-surface)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflow: 'hidden' }}>
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(165deg,rgba(99,102,241,.12) 0%,transparent 60%)', pointerEvents: 'none' }} />
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,.5)', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-.3px', lineHeight: 1.2 }}>MailFlow</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 500, marginTop: 1 }}>Email Automation</div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto', position: 'relative' }}>
        {[['Main', nav.slice(0, 5)], ['Config', nav.slice(5)]].map(([section, items]) => (
          <div key={section}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.25)', padding: '14px 12px 7px' }}>{section}</div>
            {items.map(item => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500, background: active ? 'var(--sidebar-active-bg)' : 'transparent', color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)', marginBottom: 2, transition: 'all .15s', fontFamily: 'var(--font)', position: 'relative', borderLeft: active ? '2px solid var(--sidebar-active-border)' : '2px solid transparent' }}>
                  <span style={{ opacity: active ? 1 : .75 }}>{item.icon}</span>
                  {item.label}
                  {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--sidebar-active-border)', boxShadow: '0 0 6px var(--sidebar-active-border)' }} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {/* User footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,.4)' }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>Abubakar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Free plan</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 7, height: 7, background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 6px #22C55E' }} title="Connected" />
        </div>
      </div>
    </aside>
  );
}
