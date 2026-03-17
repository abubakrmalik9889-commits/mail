// store.js — Persistent data store (persists to db.json)
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

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
  getCampaigns: () => state.campaigns,
  getCampaign: (id) => state.campaigns.find(c => c.id === id),
  createCampaign: (data) => {
    const c = { id: uuidv4(), ...data, status: 'active', createdAt: new Date().toISOString() };
    state.campaigns.push(c);
    saveDB(state);
    return c;
  },
  updateCampaign: (id, data) => {
    const i = state.campaigns.findIndex(c => c.id === id);
    if (i === -1) return null;
    state.campaigns[i] = { ...state.campaigns[i], ...data };
    saveDB(state);
    return state.campaigns[i];
  },
  getLeads: (campaignId) => campaignId ? state.leads.filter(l => l.campaignId === campaignId) : state.leads,
  getLead: (id) => state.leads.find(l => l.id === id),
  bulkCreateLeads: (leads, campaignId) => {
    const created = leads.map(l => ({ id: uuidv4(), ...l, campaignId, status: 'pending', createdAt: new Date().toISOString() }));
    state.leads.push(...created);
    saveDB(state);
    return created;
  },
  updateLead: (id, data) => {
    const i = state.leads.findIndex(l => l.id === id);
    if (i === -1) return null;
    state.leads[i] = { ...state.leads[i], ...data };
    saveDB(state);
    return state.leads[i];
  },
  getEmails: (campaignId) => campaignId ? state.emails.filter(e => e.campaignId === campaignId) : state.emails,
  createEmail: (data) => {
    const e = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    state.emails.push(e);
    saveDB(state);
    return e;
  },
  updateEmail: (id, data) => {
    const i = state.emails.findIndex(e => e.id === id);
    if (i === -1) return null;
    state.emails[i] = { ...state.emails[i], ...data };
    saveDB(state);
    return state.emails[i];
  },
  getTemplates: () => state.templates,
  getTemplate: (id) => state.templates.find(t => t.id === id),
  createTemplate: (data) => {
    const t = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    state.templates.push(t);
    saveDB(state);
    return t;
  },
  updateTemplate: (id, data) => {
    const i = state.templates.findIndex(t => t.id === id);
    if (i === -1) return null;
    state.templates[i] = { ...state.templates[i], ...data };
    saveDB(state);
    return state.templates[i];
  },
  getAnalytics: () => {
    const totalSent = state.emails.filter(e => ['sent','replied','follow_up'].includes(e.status)).length;
    const replies = state.emails.filter(e => e.status === 'replied').length;
    const leadsContacted = new Set(state.emails.map(e => e.leadId)).size;
    const followUps = state.emails.filter(e => e.type === 'followup').length;
    const replyRate = totalSent > 0 ? ((replies / totalSent) * 100).toFixed(1) : 0;
    return { 
      totalSent, 
      replies, 
      leadsContacted, 
      followUps, 
      replyRate, 
      totalLeads: state.leads.length, 
      totalCampaigns: state.campaigns.length 
    };
  },
  getLeadsNeedingFollowUp: () => {
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return state.leads.filter(lead => {
      if (lead.status !== 'sent') return false;
      const emails = state.emails.filter(e => e.leadId === lead.id).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      if (!emails.length) return false;
      const alreadyFollowed = state.emails.some(e => e.leadId === lead.id && e.type === 'followup');
      return !alreadyFollowed && new Date(emails[0].sentAt) < cutoff;
    });
  },
};
