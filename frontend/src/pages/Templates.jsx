import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button, Card, Input, Textarea, Select, Tag, Toast, Spinner, Badge } from '../components/UI';
import EmailPreview from '../components/EmailPreview';

const DEMO_TEMPLATES = [
  { id:'tpl-cold', name:'Cold Intro', subject:'Quick question for {{name}}', body:'Hi {{name}},\n\nI came across {{company}} and was really impressed by what you\'re building.\n\nWould you be open to a quick 15-min call this week?\n\nBest,\n{{sender_name}}', followUpDays:2 },
  { id:'tpl-followup', name:'Follow-up #1', subject:'Following up — {{name}}', body:'Hi {{name}},\n\nJust circling back in case my last email got buried.\n\nStill think there\'s a great fit here for {{company}}.\n\nBest,\n{{sender_name}}', followUpDays:null },
  { id:'tpl-newsletter', name:'Newsletter', subject:"What's new — {{name}}", body:'Hey {{name}},\n\nHope you\'re doing well! Quick update on what we\'ve been building:\n\n- Feature 1\n- Feature 2\n- Feature 3\n\nCheers,\n{{sender_name}}', followUpDays:null },
  { id:'tpl-launch', name:'Launch Invite', subject:"You're invited — {{name}}", body:'Hi {{name}},\n\nWe\'re launching something big and wanted {{company}} to be first to know.\n\nJoin the waitlist: [LINK]\n\nExcited to have you along!\n{{sender_name}}', followUpDays:null },
];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState({name:'',subject:'',body:'',followUpDays:''});
  const [livePreview, setLivePreview] = useState({subject:'',body:''});
  const [previewVars, setPreviewVars] = useState({name:'Sarah Chen',company:'Acme Corp'});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({show:false,message:''});

  useEffect(() => {
    api.getTemplates().then(r => { setTemplates(r.templates); selectTpl(r.templates[0]); }).catch(() => { setTemplates(DEMO_TEMPLATES); selectTpl(DEMO_TEMPLATES[0]); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLivePreview({subject:editing.subject,body:editing.body}), 350);
    return () => clearTimeout(t);
  }, [editing.subject, editing.body]);

  function selectTpl(t) { setSelected(t.id); setEditing({name:t.name,subject:t.subject,body:t.body,followUpDays:t.followUpDays||''}); setLivePreview({subject:t.subject,body:t.body}); }

  function showToast(msg) { setToast({show:true,message:msg}); setTimeout(() => setToast({show:false,message:''}), 2500); }

  async function save() {
    setSaving(true);
    try {
      if (selected && !selected.startsWith('new-')) { await api.updateTemplate(selected, editing); }
      else { const {template} = await api.createTemplate(editing); setSelected(template.id); }
      setTemplates(prev => prev.map(t => t.id===selected?{...t,...editing}:t));
      showToast('Template saved!');
    } catch { setTemplates(prev => prev.map(t => t.id===selected?{...t,...editing}:t)); showToast('Saved (demo mode)'); }
    finally { setSaving(false); }
  }

  function newTpl() {
    const id='new-'+Date.now();
    const blank={id,name:'New Template',subject:'Hello {{name}}',body:'Hi {{name}},\n\n',followUpDays:''};
    setTemplates(p => [...p, blank]); selectTpl(blank);
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={28}/></div>;

  return (
    <div style={{display:'grid',gridTemplateColumns:'210px 1fr 1fr',gap:16,height:'calc(100vh - 120px)',minHeight:500}}>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <span style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Templates</span>
          <button onClick={newTpl} style={{fontSize:11,padding:'3px 8px',background:'var(--brand)',color:'white',border:'none',borderRadius:5,cursor:'pointer',fontFamily:'var(--font)',fontWeight:600}}>+ New</button>
        </div>
        {templates.map(t => (
          <div key={t.id} onClick={() => selectTpl(t)} style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',border:`1px solid ${selected===t.id?'var(--brand-border)':'var(--border)'}`,background:selected===t.id?'var(--brand-light)':'var(--surface)',transition:'all 0.12s'}}>
            <div style={{fontSize:13,fontWeight:600,color:selected===t.id?'var(--brand)':'var(--text-1)',marginBottom:3}}>{t.name}</div>
            <div style={{fontSize:11,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.subject}</div>
            {t.followUpDays&&<div style={{marginTop:4}}><Badge color="amber">↻ {t.followUpDays}d</Badge></div>}
          </div>
        ))}
      </div>

      <Card style={{display:'flex',flexDirection:'column',overflow:'hidden'}} padding="0">
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:700}}>Edit Template</span>
          <Button size="sm" variant="primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</Button>
        </div>
        <div style={{padding:18,display:'flex',flexDirection:'column',gap:13,flex:1,overflowY:'auto'}}>
          <Input label="Template Name" value={editing.name} onChange={e => setEditing(p=>({...p,name:e.target.value}))}/>
          <Input label="Subject Line" value={editing.subject} onChange={e => setEditing(p=>({...p,subject:e.target.value}))} hint="Supports {{name}}, {{company}}, {{sender_name}}"/>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:6}}>Insert Variable</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['{{name}}','{{company}}','{{email}}','{{sender_name}}'].map(v => (
                <button key={v} onClick={() => { const el=document.getElementById('body-ta'); const p=el?.selectionStart??editing.body.length; setEditing(prev=>({...prev,body:prev.body.slice(0,p)+v+prev.body.slice(p)})); }} style={{background:'#EDE9FE',color:'#5B21B6',fontSize:11,padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',fontFamily:'var(--mono)',fontWeight:500}}>{v}</button>
              ))}
            </div>
          </div>
          <Textarea id="body-ta" label="Email Body" value={editing.body} onChange={e => setEditing(p=>({...p,body:e.target.value}))} style={{minHeight:180,fontFamily:'var(--mono)',fontSize:12}} hint="Plain text — variables are replaced at send time"/>
          <Select label="Auto Follow-up" value={editing.followUpDays} onChange={e => setEditing(p=>({...p,followUpDays:e.target.value}))}>
            <option value="">Disabled</option>
            <option value="2">2 days (recommended)</option>
            <option value="3">3 days</option>
            <option value="5">5 days</option>
            <option value="7">1 week</option>
          </Select>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:13}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:9}}>Preview Variables</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
              <Input label="name" value={previewVars.name} onChange={e => setPreviewVars(p=>({...p,name:e.target.value}))}/>
              <Input label="company" value={previewVars.company} onChange={e => setPreviewVars(p=>({...p,company:e.target.value}))}/>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{overflow:'hidden',display:'flex',flexDirection:'column'}} padding="0">
        <EmailPreview subject={livePreview.subject} body={livePreview.body} variables={previewVars}/>
      </Card>
      <Toast message={toast.message} show={toast.show}/>
    </div>
  );
}
