const express = require('express');
const router = express.Router();
const store = require('../store');
const { previewEmail } = require('../services/emailService');

router.get('/', async (req, res) => res.json({ templates: await store.getTemplates() }));

router.post('/', async (req, res) => {
  const { name, subject, body, followUpDays } = req.body;
  if (!name || !subject || !body) return res.status(400).json({ error: 'name, subject, body required' });
  res.json({ template: await store.createTemplate({ name, subject, body, followUpDays: followUpDays || null }) });
});

router.put('/:id', async (req, res) => {
  const template = await store.updateTemplate(req.params.id, req.body);
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json({ template });
});

router.post('/preview-raw', (req, res) => {
  const { subject, body, variables } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'subject and body required' });
  res.json({ preview: previewEmail({ subject, body, variables: variables || {} }) });
});

router.post('/:id/preview', async (req, res) => {
  const template = await store.getTemplate(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json({ preview: previewEmail({ subject: template.subject, body: template.body, variables: req.body.variables || {} }), template });
});

module.exports = router;
