const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', (req, res) => res.json(store.getAnalytics()));

router.get('/activity', (req, res) => {
  const emails = store.getEmails();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const label = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = day.toISOString().split('T')[0];
    days.push({ label, sent: emails.filter(e => e.sentAt && e.sentAt.startsWith(dateStr)).length });
  }
  res.json({ activity: days });
});

module.exports = router;
