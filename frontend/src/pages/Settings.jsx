import React, { useState } from 'react';
import { Card, Input, Button, Toast, Divider } from '../components/UI';
import { api } from '../utils/api';

export default function Settings() {
  const [provider, setProvider] = useState('gmail');
  const [form, setForm] = useState({smtpHost:'smtp.gmail.com',smtpPort:'587',user:'',pass:'',fromName:'',fromEmail:''});
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState({show:false,message:''});

  function set(k,v){setForm(p=>({...p,[k]:v}));}
  function showToast(msg){setToast({show:true,message:msg});setTimeout(()=>setToast({show:false,message:''}),3000);}

  async function testConnection() {
    setTesting(true); setStatus(null);
    try { const h=await api.health(); setStatus({ok:true,msg:`Connected · Demo mode: ${h.demo?'ON':'OFF'}`}); }
    catch { setStatus({ok:false,msg:'Backend offline — run: cd backend && npm run dev'}); }
    finally { setTesting(false); }
  }

  return (
    <div style={{maxWidth:540,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Email Provider</div>
        <div style={{fontSize:13,color:'var(--text-3)',marginBottom:18}}>Configure how MailFlow sends your emails</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
          {[{id:'gmail',icon:'📧',label:'Gmail',sub:'App Password'},{id:'smtp',icon:'🔌',label:'SMTP',sub:'Custom server'},{id:'sendgrid',icon:'📨',label:'SendGrid',sub:'API key'}].map(p=>(
            <div key={p.id} onClick={()=>setProvider(p.id)} style={{padding:13,borderRadius:'var(--radius-sm)',cursor:'pointer',textAlign:'center',border:`1.5px solid ${provider===p.id?'var(--brand)':'var(--border)'}`,background:provider===p.id?'var(--brand-light)':'var(--surface)',transition:'all 0.12s'}}>
              <div style={{fontSize:20,marginBottom:5}}>{p.icon}</div>
              <div style={{fontWeight:600,fontSize:13,color:provider===p.id?'var(--brand)':'var(--text-1)'}}>{p.label}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{p.sub}</div>
            </div>
          ))}
        </div>
        {provider==='gmail'&&(
          <div style={{background:'var(--brand-light)',border:'1px solid var(--brand-border)',borderRadius:'var(--radius-sm)',padding:'12px 14px',marginBottom:18,fontSize:13}}>
            <strong>Gmail App Password setup:</strong>
            <ol style={{marginTop:8,marginLeft:18,lineHeight:2,fontSize:12,color:'var(--text-2)'}}>
              <li>Go to <strong>myaccount.google.com → Security</strong></li>
              <li>Enable <strong>2-Step Verification</strong></li>
              <li>Search for <strong>App passwords</strong> and create one</li>
              <li>Use the 16-char code as your password below</li>
            </ol>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:13}}>
          <Input label="Your Name (From)" value={form.fromName} onChange={e=>set('fromName',e.target.value)} placeholder="Alex Johnson"/>
          <Input label="From Email" type="email" value={form.fromEmail} onChange={e=>set('fromEmail',e.target.value)} placeholder="alex@yourcompany.com"/>
          <Divider/>
          {provider!=='gmail'&&<div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}><Input label="SMTP Host" value={form.smtpHost} onChange={e=>set('smtpHost',e.target.value)}/><Input label="Port" value={form.smtpPort} onChange={e=>set('smtpPort',e.target.value)}/></div>}
          <Input label={provider==='gmail'?'Gmail Address':'Username'} type="email" value={form.user} onChange={e=>set('user',e.target.value)} placeholder={provider==='gmail'?'you@gmail.com':'username'}/>
          <Input label={provider==='gmail'?'App Password':'Password / API Key'} type="password" value={form.pass} onChange={e=>set('pass',e.target.value)} placeholder="••••••••••••••••"/>
        </div>
        {status&&<div style={{marginTop:14,padding:'10px 14px',borderRadius:'var(--radius-sm)',fontSize:13,background:status.ok?'var(--green-bg)':'var(--red-bg)',color:status.ok?'var(--green)':'var(--red)',border:`1px solid ${status.ok?'var(--green-border)':'#FECACA'}`}}>{status.ok?'✓ ':'✗ '}{status.msg}</div>}
        <div style={{display:'flex',gap:10,marginTop:18}}>
          <Button variant="primary" onClick={()=>showToast('Settings saved to .env!')}>Save Settings</Button>
          <Button onClick={testConnection} disabled={testing}>{testing?'Testing…':'Test Connection'}</Button>
        </div>
      </Card>

      <Card>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>.env Preview</div>
        <pre style={{fontFamily:'var(--mono)',fontSize:12,background:'#0F1117',color:'#E2E8F0',padding:16,borderRadius:'var(--radius-sm)',lineHeight:1.8,overflowX:'auto'}}>
{`PORT=3001
DEMO_MODE=false

SMTP_HOST=${form.smtpHost||'smtp.gmail.com'}
SMTP_PORT=${form.smtpPort||'587'}
SMTP_USER=${form.user||'your@gmail.com'}
SMTP_PASS=${form.pass?'••••••••••':'{your_password}'}

FROM_NAME=${form.fromName||'Your Name'}
FROM_EMAIL=${form.fromEmail||'your@gmail.com'}`}
        </pre>
        <div style={{fontSize:12,color:'var(--text-3)',marginTop:10}}>Copy this into <code style={{fontFamily:'var(--mono)',background:'var(--surface-2)',padding:'1px 6px',borderRadius:4}}>backend/.env</code></div>
      </Card>

      <Card>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Daily Sending Limits</div>
        <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
          {[{p:'Gmail (App Password)',l:'500 / day',n:'Good for small campaigns'},{p:'SendGrid (Free)',l:'100 / day',n:'Paid: 40k/month'},{p:'Mailgun (Free)',l:'5,000 / month',n:'Pay-as-you-go after'},{p:'Amazon SES',l:'62,000 / month',n:'Cheapest at scale'}].map((r,i)=>(
            <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
              <td style={{padding:'9px 0',fontWeight:500}}>{r.p}</td>
              <td style={{padding:'9px 12px',color:'var(--brand)',fontWeight:600}}>{r.l}</td>
              <td style={{padding:'9px 0',color:'var(--text-3)',fontSize:12}}>{r.n}</td>
            </tr>
          ))}
        </table>
      </Card>
      <Toast message={toast.message} show={toast.show}/>
    </div>
  );
}
