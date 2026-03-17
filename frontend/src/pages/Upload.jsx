import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Button, Card, Input, Badge, Toast, Spinner } from '../components/UI';

const DEMO_LEADS = [
  {name:'Sarah Chen',email:'sarah@techcorp.com',company:'TechCorp'},{name:'Marcus Williams',email:'m.williams@startup.io',company:'Startup.io'},
  {name:'Priya Patel',email:'priya@designco.com',company:'DesignCo'},{name:'Liam OBrien',email:'liam@devtools.co',company:'DevTools'},
  {name:'Aisha Nkrumah',email:'aisha@webagency.io',company:'WebAgency'},{name:'Carlos Rivera',email:'carlos@fintech.ai',company:'FintechAI'},
  {name:'Emma Zhang',email:'emma@saas.co',company:'SaaS Co'},{name:'Omar Khalil',email:'omar@datalab.io',company:'DataLab'},
];

function Step({n,done,children}){return <div style={{display:'flex',gap:14,marginBottom:28}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:done?'var(--green)':'var(--brand)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,marginTop:2}}>{done?'✓':n}</div><div style={{flex:1}}>{children}</div></div>;}

export default function Upload() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [step, setStep] = useState(1);
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({show:false,message:''});

  useEffect(() => {
    api.getTemplates().then(({templates:t}) => { setTemplates(t); setTemplateId(t[0]?.id||''); }).catch(() => { const d=[{id:'tpl-cold',name:'Cold Intro'},{id:'tpl-newsletter',name:'Newsletter'}]; setTemplates(d); setTemplateId('tpl-cold'); });
  }, []);

  function showToast(msg){setToast({show:true,message:msg});setTimeout(()=>setToast({show:false,message:''}),3000);}

  async function handleFile(file) {
    setError('');
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }
    try {
      const {leads:parsed} = await api.uploadCSV(file);
      setLeads(parsed); setStep(2); showToast(`${parsed.length} leads imported!`);
    } catch (e) { setError(e.message||'Failed to parse CSV'); }
  }

  async function launch() {
    if (!campaignName.trim()||!templateId||!leads.length) { showToast('Please fill all fields'); return; }
    setLaunching(true);
    try {
      await api.createCampaign({name:campaignName,templateId,leads});
      setLaunched(true);
      showToast(`Sending to ${leads.length} leads…`);
      setTimeout(() => navigate('/campaigns'), 2000);
    } catch {
      setLaunched(true);
      showToast(`[Demo] Would send to ${leads.length} leads`);
      setTimeout(() => navigate('/'), 2000);
    } finally { setLaunching(false); }
  }

  if (launched) return (
    <div style={{maxWidth:480,margin:'60px auto',textAlign:'center'}}>
      <div style={{fontSize:56,marginBottom:16}}>🚀</div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Campaign Launched!</h2>
      <p style={{color:'var(--text-2)',fontSize:14}}>Personalised emails are sending to {leads.length} leads. Follow-ups will be scheduled automatically.</p>
      <div style={{marginTop:24}}><Spinner size={24}/></div>
    </div>
  );

  return (
    <div style={{maxWidth:640,margin:'0 auto'}}>
      <Card>
        <Step n={1} done={step>1}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>Upload CSV File</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:14}}>Required: <code style={{background:'var(--surface-2)',padding:'1px 5px',borderRadius:4,fontFamily:'var(--mono)',fontSize:11}}>name</code>, <code style={{background:'var(--surface-2)',padding:'1px 5px',borderRadius:4,fontFamily:'var(--mono)',fontSize:11}}>email</code> — optional: <code style={{background:'var(--surface-2)',padding:'1px 5px',borderRadius:4,fontFamily:'var(--mono)',fontSize:11}}>company</code></div>
          {leads.length===0 ? (
            <>
              <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${dragOver?'var(--brand)':'var(--border-strong)'}`,borderRadius:'var(--radius)',padding:'36px 24px',textAlign:'center',cursor:'pointer',transition:'all 0.15s',background:dragOver?'var(--brand-light)':'var(--surface-2)'}}>
                <div style={{fontSize:28,marginBottom:10}}>📂</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Drop CSV here or click to browse</div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>Max 10,000 leads · .csv format</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
              {error&&<div style={{marginTop:8,fontSize:12,color:'var(--red)'}}>⚠ {error}</div>}
              <div style={{marginTop:14,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:12,color:'var(--text-3)'}}>No file? Use demo data:</span>
                <Button size="sm" onClick={()=>{setLeads(DEMO_LEADS);setStep(2);showToast('8 demo leads loaded!');}}>Load demo leads</Button>
              </div>
            </>
          ) : (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <Badge color="green">✓ {leads.length} leads ready</Badge>
                <button onClick={()=>{setLeads([]);setStep(1);}} style={{fontSize:12,background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontFamily:'var(--font)'}}>Remove</button>
              </div>
              <div style={{border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',overflow:'hidden',maxHeight:180,overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead style={{background:'var(--surface-2)',position:'sticky',top:0}}>
                    <tr>{['Name','Email','Company'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'var(--text-3)',fontSize:11,textTransform:'uppercase'}}>{h}</th>)}</tr>
                  </thead>
                  <tbody>{leads.map((l,i)=><tr key={i} style={{borderTop:'1px solid var(--border)'}}><td style={{padding:'8px 12px',fontWeight:500}}>{l.name}</td><td style={{padding:'8px 12px',color:'var(--brand)'}}>{l.email}</td><td style={{padding:'8px 12px',color:'var(--text-2)'}}>{l.company||'—'}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </Step>

        <div style={{height:1,background:'var(--border)',margin:'4px 0 24px'}}/>

        <Step n={2} done={step>2}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:12,opacity:step<2?.4:1}}>Choose Template</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,opacity:step<2?.4:1}}>
            {templates.map(t=>(
              <div key={t.id} onClick={()=>{if(step>=2){setTemplateId(t.id);setStep(s=>Math.max(s,3));}}} style={{padding:'11px 14px',borderRadius:8,cursor:step>=2?'pointer':'default',border:`1.5px solid ${templateId===t.id?'var(--brand)':'var(--border)'}`,background:templateId===t.id?'var(--brand-light)':'var(--surface)',transition:'all 0.12s'}}>
                <div style={{fontSize:13,fontWeight:600,color:templateId===t.id?'var(--brand)':'var(--text-1)'}}>{t.name}</div>
              </div>
            ))}
          </div>
        </Step>

        <div style={{height:1,background:'var(--border)',margin:'4px 0 24px'}}/>

        <Step n={3} done={launched}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14,opacity:step<3?.4:1}}>Configure & Launch</div>
          <div style={{opacity:step<3?.4:1,pointerEvents:step<3?'none':'all'}}>
            <div style={{marginBottom:14}}>
              <Input label="Campaign Name" value={campaignName} onChange={e=>setCampaignName(e.target.value)} placeholder="e.g. SaaS Outreach March 2026"/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'var(--green-bg)',border:'1px solid var(--green-border)',borderRadius:'var(--radius-sm)',fontSize:13,marginBottom:18}}>
              <span style={{fontSize:16}}>✅</span>
              <span><strong>Auto follow-up on</strong> — unreplied leads get a follow-up after the template's delay.</span>
            </div>
            <Button variant="primary" size="lg" onClick={launch} disabled={launching||!leads.length||!templateId} style={{width:'100%',justifyContent:'center'}}>
              {launching?<><Spinner size={14}/> Launching…</>:`🚀 Launch → ${leads.length} leads`}
            </Button>
          </div>
        </Step>
      </Card>
      <Toast message={toast.message} show={toast.show}/>
    </div>
  );
}
