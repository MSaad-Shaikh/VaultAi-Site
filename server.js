const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;

function loadEnvFile() {
  const filename = path.join(ROOT, '.env');
  if (!fs.existsSync(filename)) return;
  for (const line of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (name && process.env[name] === undefined) process.env[name] = value;
  }
}
loadEnvFile();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.zip': 'application/zip'
};

const rateLimit = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const recent = (rateLimit.get(ip) || []).filter(time => now - time < 60 * 60 * 1000);
  if (recent.length >= 10) {
    rateLimit.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

function json(res, status, payload) {
  const output = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(output);
}

function readJson(req, maxBytes = 12000) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request is too large.'));
        req.destroy();
        return;
      }
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function addOneMonth(date) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function displayDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
  }).format(date);
}

function createKey() {
  const raw = crypto.randomBytes(6).toString('hex').toUpperCase();
  return 'VAI-DEMO-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12);
}

function emailMarkup(order, downloadUrl) {
  const name = escapeHtml(order.name);
  const plan = escapeHtml(order.planName);
  const start = escapeHtml(order.startDate);
  const expiry = escapeHtml(order.expiryDate);
  const key = escapeHtml(order.productKey);
  const amount = escapeHtml(order.amount);
  const delivery = order.plan === 'custom'
    ? '<div style="margin:20px 0;padding:16px 18px;border:1px solid #ecd8c8;border-radius:10px;background:#fff7f1;color:#704c3e;line-height:1.6"><strong>Custom software delivery</strong><br>We will provide your customised VaultAI software in 2–3 working days.</div>'
    : '';
  const buttonLabel = order.plan === 'custom' ? 'Download sample Windows package' : 'Download VaultAI for Windows';

  return '<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#292d2a">' +
    '<div style="max-width:640px;margin:0 auto 14px;padding:11px 14px;border:1px solid #e5d3a8;border-radius:8px;background:#fff8e7;color:#725b21;font-size:12px"><strong>VaultAI presentation demo.</strong> No payment was collected.</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#fffefa;border:1px solid #e8e2d7;border-radius:12px;overflow:hidden"><tr><td style="padding:22px 28px;border-bottom:1px solid #eee9df;font-size:20px;font-weight:bold;color:#252a26"><span style="display:inline-block;margin-right:9px;color:#bd674e">◆</span>VaultAI</td></tr>' +
    '<tr><td style="padding:30px 28px"><p style="margin:0 0 8px;color:#76806f;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Demo subscription confirmation</p>' +
    '<h1 style="margin:0 0 14px;font-size:25px;line-height:1.3;color:#252a26">Your demo access is ready</h1>' +
    '<p style="margin:0 0 18px;color:#62675f;font-size:15px;line-height:1.6">Hello ' + name + ', your sample VaultAI plan is active for this presentation.</p>' +
    '<div style="padding:16px 18px;border:1px solid #dce8dc;border-radius:9px;background:#f4f8f1;color:#385b43;font-size:15px;line-height:1.6"><strong>Active through ' + expiry + '</strong><br><span style="font-size:13px;color:#62675f">Demo access period: one month</span></div>' +
    delivery +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:17px 0 22px;border-collapse:collapse;font-size:14px"><tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Plan</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right;font-weight:bold">' + plan + '</td></tr>' +
    '<tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Started</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right">' + start + '</td></tr>' +
    '<tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Illustrative monthly price</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right">₹' + amount + '</td></tr></table>' +
    '<p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#3c413a">Demo product key <span style="font-weight:normal;color:#85877f">(not an app activation code)</span></p>' +
    '<div style="padding:14px;border:1px dashed #d7cfc1;border-radius:8px;background:#faf8f2;font-family:Consolas,monospace;font-size:16px;font-weight:bold;letter-spacing:1px;overflow-wrap:anywhere">' + key + '</div>' +
    '<p style="margin:20px 0 8px;color:#62675f;font-size:14px;line-height:1.6">Extract the Windows ZIP and run <strong>VaultAI.exe</strong> from the extracted folder.</p>' +
    '<a href="' + escapeHtml(downloadUrl) + '" style="display:inline-block;margin:12px 0 8px;padding:13px 18px;border-radius:7px;background:#bd674e;color:#fff;text-decoration:none;font-size:14px;font-weight:bold">' + buttonLabel + '</a>' +
    '<p style="margin:14px 0 0;color:#85877f;font-size:12px;line-height:1.6">This is a demo only. No payment was collected, no actual subscription was created, and the demo key cannot activate the app.</p></td></tr>' +
    '<tr><td style="padding:18px 28px;border-top:1px solid #eee9df;background:#faf8f2;color:#85877f;font-size:12px">VaultAI · Presentation demo</td></tr></table></body></html>';
}

function emailText(order, downloadUrl) {
  const lines = [
    'VaultAI demo subscription confirmation',
    '',
    'Hello ' + order.name + ',',
    'Your sample ' + order.planName + ' plan is active through ' + order.expiryDate + '.',
    'Illustrative monthly price: ₹' + order.amount,
    'Demo product key (not an app activation code): ' + order.productKey,
    order.plan === 'custom' ? 'We will provide your customised VaultAI software in 2–3 working days.' : '',
    'Download: ' + downloadUrl,
    '',
    'Presentation demo only. No payment was collected or actual subscription created.'
  ];
  return lines.filter(Boolean).join('\n');
}

async function sendResendEmail(order, downloadUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS || 'VaultAI <onboarding@resend.dev>';
  if (!apiKey || apiKey === 're_your_api_key') {
    return { sent: false, message: 'Email not sent yet: add your real RESEND_API_KEY to the local .env file.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'vaultai-demo-' + order.productKey
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: 'Your VaultAI ' + order.planName + ' demo is active',
      html: emailMarkup(order, downloadUrl),
      text: emailText(order, downloadUrl)
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Resend rejected the demo email:', response.status, result.message || result.name || 'Unknown error');
    return { sent: false, message: 'Email not sent. Check the Resend API key, sender address, and recipient permissions.' };
  }
  return { sent: true, message: 'Confirmation email sent to ' + order.email + '.' };
}

async function handleActivation(req, res) {
  if (isRateLimited(req.socket.remoteAddress || 'local')) {
    return json(res, 429, { success: false, message: 'Too many demo activations. Please wait a little and try again.' });
  }

  let input;
  try {
    input = await readJson(req);
  } catch (error) {
    return json(res, 400, { success: false, message: error.message });
  }

  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 80) : '';
  const email = typeof input.email === 'string' ? input.email.trim().slice(0, 254).toLowerCase() : '';
  const plan = input.plan === 'custom' ? 'custom' : input.plan === 'basic' ? 'basic' : '';

  if (!name || !email || !plan || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { success: false, message: 'Enter your name, a valid email address, and choose a plan.' });
  }

  const started = new Date();
  const expires = addOneMonth(started);
  const order = {
    name,
    email,
    plan,
    planName: plan === 'custom' ? 'Custom Workspace' : 'Basic Workspace',
    amount: plan === 'custom' ? '3,999' : '2,699',
    productKey: createKey(),
    startDate: displayDate(started),
    expiryDate: displayDate(expires)
  };
  const requestUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const publicBase = (process.env.PUBLIC_BASE_URL || (requestUrl.protocol + '//' + requestUrl.host)).replace(/\/$/, '');
  const downloadUrl = publicBase + '/downloads/VaultAI-Windows.zip';

  let emailResult;
  try {
    emailResult = await sendResendEmail(order, downloadUrl);
  } catch (error) {
    console.error('Resend request failed:', error.message);
    emailResult = { sent: false, message: 'Email not sent. Check the server connection and Resend configuration.' };
  }

  return json(res, 200, {
    success: true,
    emailSent: emailResult.sent,
    emailMessage: emailResult.message,
    name: order.name,
    email: order.email,
    plan: order.plan,
    planName: order.planName,
    amount: order.amount,
    productKey: order.productKey,
    startDate: order.startDate,
    expiryDate: order.expiryDate,
    customDelivery: order.plan === 'custom' ? '2–3 working days' : null,
    downloadUrl
  });
}

function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (decoded === '/') decoded = '/index.html';
  if (decoded.split('/').some(part => part.startsWith('.') || part.toLowerCase() === 'node_modules')) {
    res.writeHead(404).end('Not found');
    return;
  }

  const file = path.resolve(ROOT, '.' + decoded);
  const relative = path.relative(ROOT, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || ['server.js', 'package.json', 'package-lock.json'].includes(path.basename(file))) {
    res.writeHead(404).end('Not found');
    return;
  }
  const type = MIME[path.extname(file).toLowerCase()];
  if (!type) {
    res.writeHead(404).end('Not found');
    return;
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': path.extname(file).toLowerCase() === '.zip' ? 'public, max-age=3600' : 'no-cache',
      ...(path.extname(file).toLowerCase() === '.zip' ? { 'Content-Disposition': 'attachment; filename="VaultAI-Windows.zip"' } : {})
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  if (requestUrl.pathname === '/api/demo-subscription' && req.method === 'POST') {
    handleActivation(req, res).catch(error => {
      console.error('Demo activation failed:', error.message);
      json(res, 500, { success: false, message: 'Could not complete demo activation. Please try again.' });
    });
    return;
  }
  if (requestUrl.pathname.startsWith('/api/')) {
    json(res, 404, { success: false, message: 'API route not found.' });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  serveStatic(req, res, requestUrl.pathname);
});

const port = Number(process.env.PORT || 4187);
server.listen(port, '127.0.0.1', () => {
  console.log('VaultAI demo running at http://127.0.0.1:' + port);
  console.log('Email sending: ' + (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key' ? 'Resend configured' : 'preview mode; add RESEND_API_KEY to .env to send'));
});

