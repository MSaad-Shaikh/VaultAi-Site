let recentSendAt = 0;

function json(data, status, origin) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function datePartsInIndia(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function addOneMonthInIndia(date) {
  const parts = datePartsInIndia(date);
  const target = new Date(Date.UTC(parts.year, parts.month, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(parts.day, lastDay));
  return target;
}

function displayDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
  }).format(date);
}

function createKey() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'VAI-DEMO-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12);
}

function emailHtml(order, downloadUrl) {
  const delivery = order.plan === 'custom'
    ? '<div style="margin:20px 0;padding:16px 18px;border:1px solid #ecd8c8;border-radius:10px;background:#fff7f1;color:#704c3e;line-height:1.6"><strong>Custom software delivery</strong><br>We will provide your customised VaultAI software in 2–3 working days.</div>'
    : '';
  const buttonLabel = order.plan === 'custom' ? 'Download sample Windows package' : 'Download VaultAI for Windows';

  return '<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#292d2a">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#fffefa;border:1px solid #e8e2d7;border-radius:12px;overflow:hidden">' +
    '<tr><td style="padding:22px 28px;border-bottom:1px solid #eee9df;font-size:20px;font-weight:bold;color:#252a26"><span style="display:inline-block;margin-right:9px;color:#bd674e">◆</span>VaultAI</td></tr>' +
    '<tr><td style="padding:30px 28px"><p style="margin:0 0 8px;color:#76806f;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Demo subscription confirmation</p>' +
    '<h1 style="margin:0 0 14px;font-size:25px;line-height:1.3;color:#252a26">Your demo access is ready</h1>' +
    '<p style="margin:0 0 18px;color:#62675f;font-size:15px;line-height:1.6">Hello ' + escapeHtml(order.name) + ', your sample VaultAI plan is active for this presentation.</p>' +
    '<div style="padding:16px 18px;border:1px solid #dce8dc;border-radius:9px;background:#f4f8f1;color:#385b43;font-size:15px;line-height:1.6"><strong>Active through ' + escapeHtml(order.expiryDate) + '</strong><br><span style="font-size:13px;color:#62675f">Demo access period: one month</span></div>' +
    delivery +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:17px 0 22px;border-collapse:collapse;font-size:14px"><tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Plan</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right;font-weight:bold">' + escapeHtml(order.planName) + '</td></tr>' +
    '<tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Started</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right">' + escapeHtml(order.startDate) + '</td></tr>' +
    '<tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#77796f">Illustrative monthly price</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right">₹' + escapeHtml(order.amount) + '</td></tr></table>' +
    '<p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#3c413a">Demo product key <span style="font-weight:normal;color:#85877f">(not an app activation code)</span></p>' +
    '<div style="padding:14px;border:1px dashed #d7cfc1;border-radius:8px;background:#faf8f2;font-family:Consolas,monospace;font-size:16px;font-weight:bold;letter-spacing:1px;overflow-wrap:anywhere">' + escapeHtml(order.productKey) + '</div>' +
    '<p style="margin:20px 0 8px;color:#62675f;font-size:14px;line-height:1.6">Extract the Windows ZIP and run <strong>VaultAI.exe</strong> from the extracted folder.</p>' +
    '<a href="' + escapeHtml(downloadUrl) + '" style="display:inline-block;margin:12px 0 8px;padding:13px 18px;border-radius:7px;background:#bd674e;color:#fff;text-decoration:none;font-size:14px;font-weight:bold">' + buttonLabel + '</a>' +
    '<p style="margin:14px 0 0;color:#85877f;font-size:12px;line-height:1.6">Presentation demo only. No payment was collected, no actual subscription was created, and the demo key cannot activate the app.</p></td></tr>' +
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

async function handlePost(request, env, origin) {
  if (!env.RESEND_API_KEY || !env.PUBLIC_BASE_URL) {
    return json({ success: false, message: 'The demo email service is not fully configured.' }, 503, origin);
  }

  if (Date.now() - recentSendAt < 5000) {
    return json({ success: false, message: 'Please wait a few seconds before sending another demo email.' }, 429, origin);
  }

  let input;
  try {
    const raw = await request.text();
    if (raw.length > 10000) return json({ success: false, message: 'Request is too large.' }, 413, origin);
    input = JSON.parse(raw || '{}');
  } catch {
    return json({ success: false, message: 'Request body must be valid JSON.' }, 400, origin);
  }

  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 80) : '';
  const email = typeof input.email === 'string' ? input.email.trim().slice(0, 254).toLowerCase() : '';
  const plan = input.plan === 'custom' ? 'custom' : input.plan === 'basic' ? 'basic' : '';

  if (!name || !email || !plan || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, message: 'Enter your name, a valid email address, and choose a plan.' }, 400, origin);
  }

  const now = new Date();
  const expiry = addOneMonthInIndia(now);
  const order = {
    name,
    email,
    plan,
    planName: plan === 'custom' ? 'Custom Workspace' : 'Basic Workspace',
    amount: plan === 'custom' ? '3,999' : '2,699',
    productKey: createKey(),
    startDate: displayDate(now),
    expiryDate: displayDate(expiry)
  };
  const baseUrl = env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const downloadUrl = baseUrl + '/downloads/VaultAI-Windows.zip';

  let apiResponse;
  try {
    recentSendAt = Date.now();
    apiResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'vaultai-demo-' + order.productKey
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM_ADDRESS || 'VaultAI <onboarding@resend.dev>',
        to: [order.email],
        subject: 'Your VaultAI ' + order.planName + ' demo is active',
        html: emailHtml(order, downloadUrl),
        text: emailText(order, downloadUrl)
      })
    });
  } catch {
    return json({ success: false, message: 'Resend could not be reached. Please try again.' }, 502, origin);
  }

  const result = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    return json({ success: false, message: 'Email was not sent. Check the Resend key, sender, and recipient settings.' }, 502, origin);
  }

  return json({
    success: true,
    emailSent: true,
    emailMessage: 'Confirmation email accepted for delivery to ' + order.email + '.',
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
  }, 200, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) {
      return new Response('Origin not allowed.', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin'
        }
      });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/demo-subscription' || request.method !== 'POST') {
      return json({ success: false, message: 'Not found.' }, 404, origin);
    }
    return handlePost(request, env, origin);
  }
};
