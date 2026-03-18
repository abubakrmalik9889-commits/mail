const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: res.statusText })); throw new Error(err.error || 'Request failed'); }
  return res.json();
}

export const api = {
  getAnalytics: () => request('/analytics'),
  getActivity: () => request('/analytics/activity'),
  getCampaigns: () => request('/campaigns'),
  getCampaign: (id) => request(`/campaigns/${id}`),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  pauseCampaign: (id) => request(`/campaigns/${id}/pause`, { method: 'PATCH' }),
  getTemplates: () => request('/templates'),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  previewTemplate: (id, variables) => request(`/templates/${id}/preview`, { method: 'POST', body: JSON.stringify({ variables }) }),
  previewRaw: (subject, body, variables) => request('/templates/preview-raw', { method: 'POST', body: JSON.stringify({ subject, body, variables }) }),
  getLeads: (campaignId) => request(`/leads${campaignId ? `?campaignId=${campaignId}` : ''}`),
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
