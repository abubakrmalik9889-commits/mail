const express = require('express');
const router = express.Router();
const store = require('../store');
const { sendEmail } = require('../services/emailService');

router.get('/', async (req, res) => {
  const campaigns = await store.getCampaigns();
  const emails = await store.getEmails();
  const leads = await store.getLeads();
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
  const template = await store.getTemplate(templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  const campaign = await store.createCampaign({ name, templateId });
  const leads = await store.bulkCreateLeads(rawLeads, campaign.id);
  let sent = 0;
  for (const lead of leads) {
    try {
      const result = await sendEmail({ to: lead.email, toName: lead.name, subject: template.subject, body: template.body, variables: { name: lead.name, company: lead.company || '' } });
      await store.createEmail({ leadId: lead.id, campaignId: campaign.id, type: 'initial', subject: template.subject, status: 'sent', messageId: result.messageId, sentAt: new Date().toISOString() });
      await store.updateLead(lead.id, { status: 'sent' });
      sent++;
    } catch (err) {
      console.error('Failed to send to', lead.email, ':', err.message);
      await store.updateLead(lead.id, { status: 'error' });
    }
  }
  res.json({ campaign, totalLeads: leads.length, sent });
});

router.get('/:id', async (req, res) => {
  const campaign = await store.getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json({ campaign, leads: await store.getLeads(campaign.id), emails: await store.getEmails(campaign.id) });
});

router.patch('/:id/pause', async (req, res) => {
  const campaign = await store.updateCampaign(req.params.id, { status: 'paused' });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json({ campaign });
});

module.exports = router;
