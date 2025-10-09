let openaiClient = null;
async function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  const { OpenAI } = await import('openai');
  if (!process.env.OPENAI_API_KEY) return null;
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

export function handleWebhookVerification(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
}

export async function handleWebhookEvent(req, res) {
  try {
    const body = req.body;
    console.log('Webhook event received:', JSON.stringify(body, null, 2));
    // If provider is twilio, parse Twilio format
    if (process.env.PROVIDER === 'twilio') {
      const { parseIncomingTwilio, sendTextTwilio } = await import('./provider-twilio.js');
      const msg = parseIncomingTwilio(req);
      console.log('Parsed Twilio message', msg);
      const aiReply = await getAIReply(msg.body || '');
      await sendTextTwilio(msg.from, aiReply);
    } else {
      // Default: assume Meta Webhook format
      if (body.object && body.entry) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              const value = change.value;
              if (value && value.messages) {
                for (const message of value.messages) {
                  const from = message.from;
                  const text = message.text && message.text.body;
                  console.log('Message from', from, ':', text);

                  // Get AI response
                  const aiReply = await getAIReply(text || '');

                  await sendTextMessage(from, aiReply);
                }
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error handling webhook event', err);
    res.sendStatus(500);
  }
}

async function getAIReply(userText) {
  if (!process.env.OPENAI_API_KEY) {
    return 'Desculpe — AI não configurada. Por favor configure OPENAI_API_KEY.';
  }

  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente útil respondendo mensagens do WhatsApp em português.' },
        { role: 'user', content: userText }
      ],
      max_tokens: 300
    });

    const text = resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content;
    return text || 'Desculpe, não consegui gerar uma resposta.';
  } catch (err) {
    console.error('OpenAI error', err);
    return 'Desculpe, ocorreu um erro ao consultar a IA.';
  }
}

async function sendTextMessage(to, text) {
  if (process.env.PROVIDER === 'twilio') {
    // Delegate to Twilio adapter
    try {
      const { sendTextTwilio } = await import('./provider-twilio.js');
      return await sendTextTwilio(to, text);
    } catch (err) {
      console.error('Twilio send error', err);
      return null;
    }
  }

  const TOKEN = process.env.META_TOKEN;
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.warn('META_TOKEN or PHONE_NUMBER_ID not set; skipping send');
    return;
  }

  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log('Send response', data);
}
