import React from 'react';

export function Button({ children, variant = 'default', size = 'md', onClick, disabled, type = 'button', icon, style = {} }) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font)', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', transition: 'all .15s', whiteSpace: 'nowrap', opacity: disabled ? .5 : 1, letterSpacing: '-.01em' };
  const sz = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 } };
  const v = {
    default: { background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-xs)' },
    primary: { background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', boxShadow: 'var(--shadow-brand)' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: '1px solid transparent' },
    danger: { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sz[size], ...v[variant], ...style }}>{icon && <span style={{ width: 15, height: 15, display: 'flex' }}>{icon}</span>}{children}</button>;
}

export function Card({ children, style = {}, padding = '20px', hover = false }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding, transition: 'box-shadow .2s,transform .2s', ...style }}>{children}</div>;
}

export function Badge({ children, color = 'gray' }) {
  const c = {
    gray: { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
    blue: { bg: 'var(--brand-light)', color: 'var(--brand)', border: 'var(--brand-border)' },
    green: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'var(--green-border)' },
    amber: { bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'var(--amber-border)' },
    red: { bg: 'var(--red-bg)', color: 'var(--red)', border: 'var(--red-border)' },
    purple: { bg: 'var(--purple-bg)', color: 'var(--purple)', border: 'var(--purple-border)' },
  };
  const cl = c[color] || c.gray;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: cl.bg, color: cl.color, border: `1px solid ${cl.border}`, letterSpacing: '.01em', gap: 4 }}>{children}</span>;
}

export function Input({ label, hint, error, style = {}, ...props }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>}
    <input style={{ width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', border: `1px solid ${error ? 'var(--red)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-1)', outline: 'none', transition: 'border-color .15s,box-shadow .15s', ...style }} onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,.1)'; }} onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }} {...props} />
    {hint && !error && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</span>}
    {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
  </div>;
}

export function Textarea({ label, hint, ...props }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>}
    <textarea style={{ width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-1)', outline: 'none', resize: 'vertical', lineHeight: 1.7, minHeight: 120, transition: 'border-color .15s,box-shadow .15s' }} onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }} {...props} />
    {hint && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</span>}
  </div>;
}

export function Select({ label, children, ...props }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>}
    <select style={{ width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-1)', outline: 'none', cursor: 'pointer' }} {...props}>{children}</select>
  </div>;
}

const statAccent = {
  default: { top: 'var(--border)', icon: '#94A3B8', glow: 'none' },
  blue: { top: 'var(--brand)', icon: 'var(--brand)', glow: 'rgba(79,70,229,.08)' },
  green: { top: 'var(--green)', icon: 'var(--green)', glow: 'rgba(5,150,105,.08)' },
  amber: { top: 'var(--amber)', icon: 'var(--amber)', glow: 'rgba(217,119,6,.08)' },
};

export function StatCard({ label, value, sub, color = 'default', icon }) {
  const a = statAccent[color] || statAccent.default;
  const valColor = { default: 'var(--text-1)', blue: 'var(--brand)', green: 'var(--green)', amber: 'var(--amber)' }[color];
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', borderTop: `3px solid ${a.top}`, position: 'relative', overflow: 'hidden' }}>
    {a.glow !== 'none' && <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: a.glow, borderRadius: '50%', transform: 'translate(30%,-30%)', pointerEvents: 'none' }} />}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</span>
      {icon && <span style={{ color: a.icon, opacity: .7 }}>{icon}</span>}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.6px', color: valColor, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, fontWeight: 500 }}>{sub}</div>}
  </div>;
}

export function Spinner({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .7s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="var(--border-strong)" strokeWidth="2.5" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}

export function Divider({ style = {} }) { return <div style={{ height: 1, background: 'var(--border)', margin: '18px 0', ...style }} />; }

export function Tag({ children }) {
  return <code style={{ background: 'var(--purple-bg)', color: 'var(--purple)', fontSize: 12, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--mono)', fontWeight: 500, border: '1px solid var(--purple-border)' }}>{children}</code>;
}

export function EmptyState({ icon, title, description, action }) {
  return <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
    <div style={{ fontSize: 42, marginBottom: 14, filter: 'grayscale(.2)' }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>{description}</div>
    {action}
  </div>;
}

export function Toast({ message, show }) {
  return <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#0F172A', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 12px 40px rgba(0,0,0,.25)', zIndex: 9999, transform: show ? 'translateY(0)' : 'translateY(100px)', opacity: show ? 1 : 0, transition: 'all .3s cubic-bezier(.34,1.56,.64,1)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.08)' }}>
    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 }}>✓</span>{message}
  </div>;
}
