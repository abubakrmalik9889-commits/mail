const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const router = express.Router();
const store = require('../store');
const analyticsRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (req, res) => {
  res.json({ leads: store.getLeads(req.query.campaignId) });
});

router.post('/upload', upload.single('csv'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const records = parse(req.file.buffer.toString('utf-8'), { columns: true, skip_empty_lines: true, trim: true });
    if (!records.length) return res.status(400).json({ error: 'CSV is empty' });
    const normalized = records.map(row => {
      const lower = {};
      Object.keys(row).forEach(k => { lower[k.toLowerCase().trim()] = row[k]; });
      return { name: lower.name || lower.full_name || lower.firstname || '', email: lower.email || lower.email_address || '', company: lower.company || lower.organization || '' };
    }).filter(r => r.email && r.name);
    if (!normalized.length) return res.status(400).json({ error: 'CSV must have "name" and "email" columns' });
    res.json({ leads: normalized, count: normalized.length });
  } catch (err) {
    res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

router.patch('/:id/reply', (req, res) => {
  const lead = store.updateLead(req.params.id, { status: 'replied' });
  if (!lead) return res.status(404).json({ error: 'Not found' });
  const emails = store.getEmails().filter(e => e.leadId === lead.id);
  if (emails.length) store.updateEmail(emails[emails.length - 1].id, { status: 'replied' });
  res.json({ lead });
});

analyticsRouter.get('/', (req, res) => res.json(store.getAnalytics()));
analyticsRouter.get('/activity', (req, res) => {
  const emails = store.getEmails();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(); day.setDate(day.getDate() - i);
    const label = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = day.toISOString().split('T')[0];
    days.push({ label, sent: emails.filter(e => e.sentAt && e.sentAt.startsWith(dateStr)).length });
  }
  res.json({ activity: days });
});

module.exports = { leadsRouter: router, analyticsRouter };
