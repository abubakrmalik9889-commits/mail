// store.js — Persistent data store (Supports Supabase or Local JSON)
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DB_PATH = path.join(__dirname, 'db.json');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Connected to Supabase');
}

const initialState = {
  campaigns: [],
  leads: [],
  emails: [],
  templates: [
    { id: 'tpl-cold', name: 'Cold Intro', subject: 'Quick question for {{name}}', body: 'Hi {{name}},\n\nI came across {{company}} and was really impressed.\n\nWould you be open to a quick 15-min call this week?\n\nBest,\n{{sender_name}}', followUpDays: 2, createdAt: new Date().toISOString() },
    { id: 'tpl-followup', name: 'Follow-up #1', subject: 'Following up — {{name}}', body: 'Hi {{name}},\n\nJust following up on my last email in case it got buried.\n\nStill think there is a great fit here for {{company}}.\n\nBest,\n{{sender_name}}', followUpDays: null, createdAt: new Date().toISOString() },
  ],
};

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    saveDB(initialState);
    return initialState;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading DB, resetting to initial state:', err.message);
    return initialState;
  }
}

function saveDB(state) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Error saving DB:', err.message);
  }
}

let state = loadDB();

module.exports = {
  getCampaigns: async () => {
    if (supabase) {
      const { data } = await supabase.from('campaigns').select('*');
      return data || [];
    }
    return state.campaigns;
  },
  getCampaign: async (id) => {
    if (supabase) {
      const { data } = await supabase.from('campaigns').select('*').eq('id', id).single();
      return data;
    }
    return state.campaigns.find(c => c.id === id);
  },
  createCampaign: async (data) => {
    const c = { id: uuidv4(), ...data, status: 'active', createdAt: new Date().toISOString() };
    if (supabase) {
      await supabase.from('campaigns').insert([c]);
      return c;
    }
    state.campaigns.push(c);
    saveDB(state);
    return c;
  },
  updateCampaign: async (id, data) => {
    if (supabase) {
      const { data: updated } = await supabase.from('campaigns').update(data).eq('id', id).select().single();
      return updated;
    }
    const i = state.campaigns.findIndex(c => c.id === id);
    if (i === -1) return null;
    state.campaigns[i] = { ...state.campaigns[i], ...data };
    saveDB(state);
    return state.campaigns[i];
  },
  getLeads: async (campaignId) => {
    if (supabase) {
      let q = supabase.from('leads').select('*');
      if (campaignId) q = q.eq('campaignId', campaignId);
      const { data } = await q;
      return data || [];
    }
    return campaignId ? state.leads.filter(l => l.campaignId === campaignId) : state.leads;
  },
  getLead: async (id) => {
    if (supabase) {
      const { data } = await supabase.from('leads').select('*').eq('id', id).single();
      return data;
    }
    return state.leads.find(l => l.id === id);
  },
  bulkCreateLeads: async (leads, campaignId) => {
    const created = leads.map(l => ({ id: uuidv4(), ...l, campaignId, status: 'pending', createdAt: new Date().toISOString() }));
    if (supabase) {
      await supabase.from('leads').insert(created);
      return created;
    }
    state.leads.push(...created);
    saveDB(state);
    return created;
  },
  updateLead: async (id, data) => {
    if (supabase) {
      const { data: updated } = await supabase.from('leads').update(data).eq('id', id).select().single();
      return updated;
    }
    const i = state.leads.findIndex(l => l.id === id);
    if (i === -1) return null;
    state.leads[i] = { ...state.leads[i], ...data };
    saveDB(state);
    return state.leads[i];
  },
  getEmails: async (campaignId) => {
    if (supabase) {
      let q = supabase.from('emails').select('*');
      if (campaignId) q = q.eq('campaignId', campaignId);
      const { data } = await q;
      return data || [];
    }
    return campaignId ? state.emails.filter(e => e.campaignId === campaignId) : state.emails;
  },
  createEmail: async (data) => {
    const e = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    if (supabase) {
      await supabase.from('emails').insert([e]);
      return e;
    }
    state.emails.push(e);
    saveDB(state);
    return e;
  },
  updateEmail: async (id, data) => {
    if (supabase) {
      const { data: updated } = await supabase.from('emails').update(data).eq('id', id).select().single();
      return updated;
    }
    const i = state.emails.findIndex(e => e.id === id);
    if (i === -1) return null;
    state.emails[i] = { ...state.emails[i], ...data };
    saveDB(state);
    return state.emails[i];
  },
  getTemplates: async () => {
    if (supabase) {
      const { data } = await supabase.from('templates').select('*');
      return (data && data.length) ? data : state.templates;
    }
    return state.templates;
  },
  getTemplate: async (id) => {
    if (supabase) {
      const { data } = await supabase.from('templates').select('*').eq('id', id).single();
      return data;
    }
    return state.templates.find(t => t.id === id);
  },
  createTemplate: async (data) => {
    const t = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    if (supabase) {
      await supabase.from('templates').insert([t]);
      return t;
    }
    state.templates.push(t);
    saveDB(state);
    return t;
  },
  updateTemplate: async (id, data) => {
    if (supabase) {
      const { data: updated } = await supabase.from('templates').update(data).eq('id', id).select().single();
      return updated;
    }
    const i = state.templates.findIndex(t => t.id === id);
    if (i === -1) return null;
    state.templates[i] = { ...state.templates[i], ...data };
    saveDB(state);
    return state.templates[i];
  },
  getAnalytics: async () => {
    const emails = await module.exports.getEmails();
    const leads = await module.exports.getLeads();
    const campaigns = await module.exports.getCampaigns();

    const totalSent = emails.filter(e => ['sent', 'replied', 'follow_up'].includes(e.status)).length;
    const replies = emails.filter(e => e.status === 'replied').length;
    const leadsContacted = new Set(emails.map(e => e.leadId)).size;
    const followUps = emails.filter(e => e.type === 'followup').length;
    const replyRate = totalSent > 0 ? ((replies / totalSent) * 100).toFixed(1) : 0;
    return {
      totalSent,
      replies,
      leadsContacted,
      followUps,
      replyRate,
      totalLeads: leads.length,
      totalCampaigns: campaigns.length
    };
  },
  getLeadsNeedingFollowUp: async () => {
    const leads = await module.exports.getLeads();
    const emailsAll = await module.exports.getEmails();
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return leads.filter(lead => {
      if (lead.status !== 'sent') return false;
      const emails = emailsAll.filter(e => e.leadId === lead.id).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      if (!emails.length) return false;
      const alreadyFollowed = emailsAll.some(e => e.leadId === lead.id && e.type === 'followup');
      return !alreadyFollowed && new Date(emails[0].sentAt) < cutoff;
    });
  },
};
