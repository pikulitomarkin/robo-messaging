import dotenv from 'dotenv';
dotenv.config();

// Single, consolidated Twilio adapter
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM || '';

export function parseIncomingTwilio(req) {
  // Twilio sends application/x-www-form-urlencoded
  const from = req.body.From || req.body.from || '';
  const to = req.body.To || req.body.to || '';
  const body = req.body.Body || req.body.body || '';
  const mid = req.body.MessageSid || req.body.messageSid || null;
  return { from, to, body, id: mid };
}

export async function sendTextTwilio(to, text) {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn('Twilio credentials or from number not set; skipping send');
    return null;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams();
  form.append('From', TWILIO_WHATSAPP_FROM);
  form.append('To', to);
  form.append('Body', text || '');

  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

  const _fetch = globalThis.fetch;
  if (!_fetch) throw new Error('fetch is not available in this runtime. Use Node 18+ or provide a fetch polyfill.');

  const res = await _fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  const data = await res.json();
  console.log('Twilio send response', data);
  return data;
}
