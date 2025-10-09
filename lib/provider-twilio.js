import dotenv from 'dotenv';
dotenv.config();

// Parse incoming Twilio webhook (x-www-form-urlencoded)
export function parseIncomingTwilio(req) {
  // Twilio passes From, To, Body, MessageSid
  const from = req.body.From || req.body.from;
  const to = req.body.To || req.body.to;
  const body = req.body.Body || req.body.body;
  const id = req.body.MessageSid || req.body.messageSid;
  return { from, to, body, id };
}

export async function sendTextTwilio(to, text) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio credentials not set; skipping send');
    return null;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams();
  body.append('To', to);
  body.append('From', from);
  body.append('Body', text);

  const basic = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
  // Use globalThis.fetch which is safe to access; if not available, fail with clear message
  const _fetch = globalThis.fetch;
  if (!_fetch) throw new Error('fetch is not available in this runtime. Use Node 18+ or provide a fetch polyfill.');
  const res = await _fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const data = await res.json();
    console.log('Twilio send response', data);
    return data;
  } catch (err) {
    console.error('Twilio send error', err);
    throw err;
  }
}
import fetch from 'node-fetch';

// Twilio adapter: send via Twilio REST API and parse incoming Twilio webhook
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const DEFAULT_FROM = process.env.TWILIO_FROM || ''; // e.g. whatsapp:+14155238886 (sandbox)

export function parseIncomingTwilio(req) {
  // Twilio sends application/x-www-form-urlencoded
  const from = req.body.From || req.body.from;
  const body = req.body.Body || req.body.body || '';
  const mid = req.body.MessageSid || req.body.messageSid || null;
  return { from, body, id: mid };
}

export async function sendTextTwilio(to, text) {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.warn('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set; skipping send');
    return null;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams();
  // Twilio WhatsApp: From must be the Twilio sandbox/number in format whatsapp:+1415...
  form.append('From', DEFAULT_FROM);
  form.append('To', to);
  form.append('Body', text);

  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

  const res = await fetch(url, {
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
