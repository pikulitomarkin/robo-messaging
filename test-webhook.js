import fs from 'fs';
import fetch from 'node-fetch';

const payload = JSON.parse(fs.readFileSync('./payload.json', 'utf8'));

(async () => {
  try {
    const res = await fetch('http://localhost:3000/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error posting webhook:', err);
    process.exit(1);
  }
})();
