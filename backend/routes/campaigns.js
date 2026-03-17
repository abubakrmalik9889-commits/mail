const express = require('express');
const router = express.Router();
const store = require('../store');
const { sendEmail } = require('../services/emailService');

router.get('/', (req, res) => {
  const campaigns = store.getCampaigns();
  const emails = store.getEmails();
  const leads = store.getLeads();
  const enriched = campaigns.map(c => {
    const cLeads = leads.filter(l => l.campaignId === c.id);
    const cEmails = emails.filter(e => e.campaignId === c.id);
    return { ...c, totalLeads: cLeads.length, sent: cEmails.filter(e => e.status !== 'pending').length, replies: cEmails.filter(e => e.status === 'replied').length, followUps: cEmails.filter(e => e.type === 'followup').length };
  });
  res.json({ campaigns: enriched });
});

router.post('/', async (req, res) => {
  const { name, templateId, leads: rawLeads } = req.body;
  if (!name || !templateId || !rawLeads?.length) return res.status(400).json({ error: 'name, templateId, and leads are required' });
  const template = store.getTemplate(templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  const campaign = store.createCampaign({ name, templateId });
  const leads = store.bulkCreateLeads(rawLeads, campaign.id);
  let sent = 0;
  for (const lead of leads) {
    try {
      const result = await sendEmail({ to: lead.email, toName: lead.name, subject: template.subject, body: template.body, variables: { name: lead.name, company: lead.company || '' } });
      store.createEmail({ leadId: lead.id, campaignId: campaign.id, type: 'initial', subject: template.subject, status: 'sent', messageId: result.messageId, sentAt: new Date().toISOString() });
      store.updateLead(lead.id, { status: 'sent' });
      sent++;
    } catch (err) {
      console.error('Failed to send to', lead.email, ':', err.message);
      store.updateLead(lead.id, { status: 'error' });
    }
  }
  res.json({ campaign, totalLeads: leads.length, sent });
});

router.get('/:id', (req, res) => {
  const campaign = store.getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json({ campaign, leads: store.getLeads(campaign.id), emails: store.getEmails(campaign.id) });
});

router.patch('/:id/pause', (req, res) => {
  const campaign = store.updateCampaign(req.params.id, { status: 'paused' });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json({ campaign });
});

module.exports = router;
