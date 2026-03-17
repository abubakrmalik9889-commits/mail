require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => { console.log(new Date().toISOString().slice(11, 19), req.method, req.path); next(); });

const campaignsRouter = require('./routes/campaigns');
const templatesRouter = require('./routes/templates');
const { leadsRouter, analyticsRouter } = require('./routes/leads');

app.use('/api/campaigns', campaignsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/analytics', analyticsRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', demo: process.env.DEMO_MODE === 'true', timestamp: new Date().toISOString() }));

const store = require('./store');
const { sendEmail } = require('./services/emailService');

cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Checking follow-ups...');
  const leads = await store.getLeadsNeedingFollowUp();
  const templates = await store.getTemplates();
  const followupTpl = templates.find(t => t.name === 'Follow-up #1');
  if (!followupTpl) return;
  for (const lead of leads) {
    const campaign = await store.getCampaign(lead.campaignId);
    if (!campaign || campaign.status !== 'active') continue;
    try {
      const result = await sendEmail({ to: lead.email, toName: lead.name, subject: followupTpl.subject, body: followupTpl.body, variables: { name: lead.name, company: lead.company || '' } });
      await store.createEmail({ leadId: lead.id, campaignId: lead.campaignId, type: 'followup', subject: followupTpl.subject, status: 'sent', messageId: result.messageId, sentAt: new Date().toISOString() });
      await store.updateLead(lead.id, { status: 'follow_up' });
      console.log('[Cron] Follow-up sent to', lead.email);
    } catch (err) { console.error('[Cron] Failed:', lead.email, err.message); }
  }
});

app.listen(PORT, () => {
  console.log('\nMailFlow backend running on http://localhost:' + PORT);
  console.log('Demo mode:', process.env.DEMO_MODE === 'true' ? 'ON (emails logged)' : 'OFF (real emails)');
  console.log('API: /api/health | /api/analytics | /api/campaigns | /api/leads | /api/templates\n');
});
