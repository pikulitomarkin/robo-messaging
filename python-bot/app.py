from flask import Flask, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

META_TOKEN = os.getenv('META_TOKEN')
PHONE_NUMBER_ID = os.getenv('PHONE_NUMBER_ID')
VERIFY_TOKEN = os.getenv('VERIFY_TOKEN')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

@app.route('/webhook', methods=['GET'])
def verify():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    if mode == 'subscribe' and token == VERIFY_TOKEN:
        return challenge, 200
    return 'Forbidden', 403

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    app.logger.info('Webhook received: %s', data)
    # Process only message events
    try:
        if data.get('object') and data.get('entry'):
            for entry in data['entry']:
                changes = entry.get('changes', [])
                for change in changes:
                    value = change.get('value', {})
                    messages = value.get('messages', [])
                    for message in messages:
                        from_number = message.get('from')
                        text = message.get('text', {}).get('body', '')
                        # generate reply
                        reply = generate_reply(text)
                        send_whatsapp_message(from_number, reply)
        return 'EVENT_RECEIVED', 200
    except Exception as e:
        app.logger.exception('Error processing webhook')
        return 'ERROR', 500


def generate_reply(user_text):
    if not OPENAI_API_KEY:
        return 'Desculpe, IA não configurada.'
    try:
        import openai
        openai.api_key = OPENAI_API_KEY
        prompt = f"Você é um atendente que responde como uma pessoa real em português. Responda de forma curta e educada. Usuário: {user_text}"
        resp = openai.ChatCompletion.create(model='gpt-3.5-turbo', messages=[{'role':'user','content':prompt}], max_tokens=150)
        return resp.choices[0].message.content.strip()
    except Exception as e:
        app.logger.exception('OpenAI error')
        return 'Desculpe, erro na IA.'


def send_whatsapp_message(to, text):
    if not META_TOKEN or not PHONE_NUMBER_ID:
        app.logger.warning('META_TOKEN or PHONE_NUMBER_ID missing, skipping send')
        return
    url = f'https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages'
    headers = {'Authorization': f'Bearer {META_TOKEN}', 'Content-Type': 'application/json'}
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'text',
        'text': {'body': text}
    }
    r = requests.post(url, headers=headers, json=payload)
    app.logger.info('Sent message: %s', r.text)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
