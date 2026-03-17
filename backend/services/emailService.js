const nodemailer = require('nodemailer');

function renderTemplate(text, variables) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || ('{{' + key + '}}'));
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmail({ to, toName, subject, body, variables = {} }) {
  const allVars = { name: toName || to, email: to, sender_name: process.env.FROM_NAME || 'Team', ...variables };
  const renderedSubject = renderTemplate(subject, allVars);
  const renderedBody = renderTemplate(body, allVars);

  const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f5f5f0;margin:0;padding:24px 16px}
    .w{max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .h{background:#2563EB;padding:20px 28px}.ht{color:white;font-weight:700;font-size:15px}
    .b{padding:28px;font-size:14px;line-height:1.7;white-space:pre-wrap}
    .f{padding:14px 28px;border-top:1px solid #f0f0f0;font-size:11px;color:#999;display:flex;justify-content:space-between}
    a{color:#2563EB}
  </style></head><body>
  <div class="w">
    <div class="h"><span class="ht">MailFlow</span></div>
    <div class="b">${renderedBody.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>
    <div class="f"><span>Sent via MailFlow</span><a href="#">Unsubscribe</a></div>
  </div></body></html>`;

  if (process.env.DEMO_MODE === 'true') {
    console.log('\n[DEMO EMAIL] To:', to, '| Subject:', renderedSubject);
    return { messageId: 'demo_' + Date.now(), preview: null };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: '"' + (process.env.FROM_NAME || 'MailFlow') + '" <' + process.env.FROM_EMAIL + '>',
    to: '"' + toName + '" <' + to + '>',
    subject: renderedSubject,
    text: renderedBody,
    html: htmlBody,
  });
  return { messageId: info.messageId };
}

function previewEmail({ subject, body, variables = {} }) {
  const allVars = { name: 'Sarah Chen', company: 'Acme Corp', email: 'sarah@acme.com', sender_name: process.env.FROM_NAME || 'Alex', ...variables };
  return { subject: renderTemplate(subject, allVars), body: renderTemplate(body, allVars) };
}

module.exports = { sendEmail, previewEmail, renderTemplate };
