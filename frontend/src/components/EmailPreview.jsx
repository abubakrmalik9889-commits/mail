import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Spinner, Tag } from './UI';

function renderVars(text='', vars={}) {
  return text.replace(/\{\{(\w+)\}\}/g, (_,k) => vars[k]||('{{'+k+'}}'));
}

function buildHtml(subject, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#F5F5F0;padding:24px 16px}
.w{max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.h{background:#2563EB;padding:20px 28px;display:flex;align-items:center;gap:8px}
.ht{color:white;font-weight:700;font-size:15px}
.sb{padding:14px 28px;background:#F8F9FB;border-bottom:1px solid #E4E7EC}
.sl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9CA3AF;margin-bottom:3px}
.sv{font-size:14px;font-weight:600;color:#0F1117}
.b{padding:28px;font-size:14px;line-height:1.75;color:#1a1a1a;white-space:pre-wrap}
.f{padding:14px 28px;border-top:1px solid #f0f0f0;font-size:11px;color:#9CA3AF;display:flex;justify-content:space-between}
a{color:#2563EB}
</style></head><body>
<div class="w">
  <div class="h"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="ht">MailFlow</span></div>
  <div class="sb"><div class="sl">Subject</div><div class="sv">${subject}</div></div>
  <div class="b">${body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
  <div class="f"><span>Sent via MailFlow</span><a href="#">Unsubscribe</a></div>
</div></body></html>`;
}

export default function EmailPreview({ subject='', body='', variables={} }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('rendered');
  const vars = { name:'Sarah Chen', company:'Acme Corp', email:'sarah@acme.com', sender_name:'Alex', ...variables };

  useEffect(() => {
    if (!subject && !body) return;
    const t = setTimeout(refresh, 100);
    return () => clearTimeout(t);
  }, [subject, body, variables.name, variables.company]);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.previewRaw(subject, body, vars);
      setPreview(r.preview);
    } catch {
      setPreview({ subject: renderVars(subject, vars), body: renderVars(body, vars) });
    } finally { setLoading(false); }
  }

  const modeBtn = (m, label) => (
    <button onClick={()=>setMode(m)} style={{padding:'4px 10px',fontSize:11,fontWeight:500,borderRadius:6,cursor:'pointer',border:'1px solid var(--border)',fontFamily:'var(--font)',background:mode===m?'var(--brand)':'var(--surface)',color:mode===m?'white':'var(--text-2)',transition:'all .12s'}}>{label}</button>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Header bar */}
      <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:7,height:7,background:'#22C55E',borderRadius:'50%'}}/>
          <span style={{fontSize:13,fontWeight:600}}>Live Preview</span>
          {loading&&<Spinner size={13}/>}
        </div>
        <div style={{display:'flex',gap:5}}>{modeBtn('rendered','HTML')}{modeBtn('mobile','Mobile')}{modeBtn('plain','Plain')}</div>
      </div>
      {/* Variable strip */}
      <div style={{padding:'8px 16px',background:'var(--surface-2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:6,flexShrink:0,flexWrap:'wrap'}}>
        <span style={{fontSize:10,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>Preview as:</span>
        <Tag>name={vars.name}</Tag>
        <Tag>company={vars.company}</Tag>
        <button onClick={refresh} style={{marginLeft:'auto',fontSize:11,background:'none',border:'1px solid var(--border)',borderRadius:5,padding:'3px 8px',cursor:'pointer',color:'var(--text-2)',fontFamily:'var(--font)'}}>↻ Refresh</button>
      </div>
      {/* Content area */}
      <div style={{flex:1,overflow:'auto',background:'#F5F5F0',display:'flex',justifyContent:'center',alignItems:mode==='mobile'?'flex-start':'stretch'}}>
        {!preview?(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-3)',fontSize:13}}>
            {loading?<Spinner size={24}/>:'Start typing to see preview'}
          </div>
        ):mode==='rendered'?(
          <iframe srcDoc={buildHtml(preview.subject,preview.body)} style={{width:'100%',height:'100%',border:'none',display:'block'}} title="Email Preview" sandbox="allow-same-origin"/>
        ):mode==='mobile'?(
          <div style={{padding:20,width:'100%',display:'flex',justifyContent:'center'}}>
            <div style={{width:375,background:'white',borderRadius:20,overflow:'hidden',border:'8px solid #1a1a1a',boxShadow:'0 20px 50px rgba(0,0,0,.3)',flexShrink:0}}>
              <div style={{background:'#1a1a1a',padding:'8px 16px',display:'flex',justifyContent:'space-between'}}>
                <span style={{color:'white',fontSize:11,fontWeight:600}}>9:41</span>
                <span style={{color:'white',fontSize:11}}>●●●</span>
              </div>
              <div style={{background:'#F2F2F7',padding:12,minHeight:460}}>
                <div style={{background:'white',borderRadius:12,padding:14}}>
                  <div style={{fontSize:11,color:'#8E8E93',marginBottom:4}}>From: MailFlow</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{preview.subject}</div>
                  <div style={{fontSize:12,color:'#3C3C43',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{preview.body}</div>
                </div>
              </div>
            </div>
          </div>
        ):(
          <div style={{width:'100%',padding:24,fontFamily:'var(--mono)',fontSize:12,lineHeight:1.8,background:'var(--surface)',borderTop:'1px solid var(--border)'}}>
            <div style={{marginBottom:12}}><span style={{fontWeight:700,color:'var(--text-3)'}}>SUBJECT: </span><span style={{fontWeight:600}}>{preview.subject}</span></div>
            <hr style={{border:'none',borderTop:'1px dashed var(--border)',marginBottom:16}}/>
            <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{preview.body}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
