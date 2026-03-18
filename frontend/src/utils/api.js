const BASE = '/api';

const DEMO_ANALYTICS = {
  totalSent: 12543,
  replies: 486,
  replyRate: 3.9,
  leadsContacted: 3120,
  followUps: 1240,
};

const DEMO_ACTIVITY = {
  activity: [
    { label: 'Sun', sent: 320 },
    { label: 'Mon', sent: 845 },
    { label: 'Tue', sent: 1200 },
    { label: 'Wed', sent: 2100 },
    { label: 'Thu', sent: 1890 },
    { label: 'Fri', sent: 2340 },
    { label: 'Sat', sent: 1548 },
  ],
};

const DEMO_CAMPAIGNS = {
  campaigns: [
    { id: '1', name: 'SaaS Cold Outreach', templateId: 'tmpl-1', status: 'active', totalLeads: 250, sent: 187, replies: 12, followUps: 45, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', name: 'Enterprise Sales - Q1', templateId: 'tmpl-2', status: 'active', totalLeads: 120, sent: 98, replies: 8, followUps: 22, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', name: 'Startup Investor Outreach', templateId: 'tmpl-3', status: 'paused', totalLeads: 85, sent: 85, replies: 5, followUps: 18, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '4', name: 'Agency Partnership Program', templateId: 'tmpl-4', status: 'done', totalLeads: 156, sent: 156, replies: 18, followUps: 32, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

const DEMO_TEMPLATES = {
  templates: [
    { id: 'tmpl-1', name: 'Quick Demo Request', subject: 'Quick question about {{company}}', body: 'Hi {{name}},\n\nI was impressed by {{company}}\'s recent growth. Would you be open to a quick 15-min call to discuss how we can help?\n\nBest, Team', followUpDays: 3, createdAt: new Date().toISOString() },
    { id: 'tmpl-2', name: 'Value Prop Cold Email', subject: 'New feature for {{company}}', body: 'Hi {{name}},\n\nWe help companies like {{company}} increase revenue by 30% on average.\n\nWould you be interested in a quick chat?\n\nBest, Team', followUpDays: 5, createdAt: new Date().toISOString() },
    { id: 'tmpl-3', name: 'Follow-up #1', subject: 'Checking in on {{company}}', body: 'Hi {{name}},\n\nJust wanted to check if we can help {{company}} with anything.\n\nBest, Team', followUpDays: null, createdAt: new Date().toISOString() },
    { id: 'tmpl-4', name: 'Partnership Proposal', subject: 'Partnership opportunity for {{company}}', body: 'Hi {{name}},\n\nWe\'re building an exclusive partner program for {{company}}. Are you interested?\n\nBest, Team', followUpDays: 7, createdAt: new Date().toISOString() },
  ],
};

const DEMO_LEADS = {
  leads: [
    { id: 'lead-1', name: 'Sarah Chen', email: 'sarah.chen@techcorp.com', company: 'TechCorp', source: 'linkedin', status: 'sent', campaignId: '1', createdAt: new Date().toISOString() },
    { id: 'lead-2', name: 'Michael Rodriguez', email: 'michael@innovate.io', company: 'Innovate.io', source: 'sales-nav', status: 'replied', campaignId: '1', createdAt: new Date().toISOString() },
    { id: 'lead-3', name: 'Emily Watson', email: 'emily.watson@future.ai', company: 'Future AI', source: 'linkedin', status: 'follow_up', campaignId: '2', createdAt: new Date().toISOString() },
    { id: 'lead-4', name: 'David Park', email: 'david.park@startup.co', company: 'Startup Co', source: 'google', status: 'sent', campaignId: '3', createdAt: new Date().toISOString() },
    { id: 'lead-5', name: 'Jessica Lee', email: 'jessica@agency.net', company: 'Agency Inc', source: 'inbound', status: 'replied', campaignId: '4', createdAt: new Date().toISOString() },
  ],
};

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
    if (!res.ok) { const err = await res.json().catch(() => ({ error: res.statusText })); throw new Error(err.error || 'Request failed'); }
    return res.json();
  } catch (err) {
    // Return demo data on network error
    if (path === '/analytics') return DEMO_ANALYTICS;
    if (path === '/analytics/activity') return DEMO_ACTIVITY;
    if (path === '/campaigns') return DEMO_CAMPAIGNS;
    if (path === '/templates') return DEMO_TEMPLATES;
    throw err;
  }
}

export const api = {
  getAnalytics: () => request('/analytics').catch(() => DEMO_ANALYTICS),
  getActivity: () => request('/analytics/activity').catch(() => DEMO_ACTIVITY),
  getCampaigns: () => request('/campaigns').catch(() => DEMO_CAMPAIGNS),
  getCampaign: (id) => request(`/campaigns/${id}`),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  pauseCampaign: (id) => request(`/campaigns/${id}/pause`, { method: 'PATCH' }),
  getTemplates: () => request('/templates').catch(() => DEMO_TEMPLATES),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  previewTemplate: (id, variables) => request(`/templates/${id}/preview`, { method: 'POST', body: JSON.stringify({ variables }) }),
  previewRaw: (subject, body, variables) => request('/templates/preview-raw', { method: 'POST', body: JSON.stringify({ subject, body, variables }) }),
  getLeads: (campaignId) => request(`/leads${campaignId ? `?campaignId=${campaignId}` : ''}`).catch(() => DEMO_LEADS),
  uploadCSV: async (file) => {
    const form = new FormData(); form.append('csv', file);
    const res = await fetch(`${BASE}/leads/upload`, { method: 'POST', body: form });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    return res.json();
  },
  markReplied: (id) => request(`/leads/${id}/reply`, { method: 'PATCH' }),
  health: () => request('/health'),
  generateAITemplate: (prompt) => request('/ai/generate-template', { method: 'POST', body: JSON.stringify({ prompt }) }),
};
