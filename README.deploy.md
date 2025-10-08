# Deploy no Railway

Este repositório contém um protótipo Node.js (`server.js`) que expõe `/webhook` para integração com Meta WhatsApp e um bot Python opcional em `python-bot/`.

A seguir estão os passos mínimos para fazer deploy no Railway.

1) Criar conta no Railway: https://railway.app/
2) Conectar repositório GitHub (ou fazer deploy via CLI)

Configurações de build/start (Railway detecta automaticamente para Node.js):
- Build command: `npm install`
- Start command: `node server.js`
- Procfile: fornecido (`web: node server.js`)

Variáveis de ambiente necessárias (configure no Railway → Settings → Variables):
- META_TOKEN
- PHONE_NUMBER_ID
- VERIFY_TOKEN
- OPENAI_API_KEY (opcional)
- PORT (opcional; Railway fornece automaticamente)

Testes locais antes do deploy:
- `npm install`
- `node server.js`
- Abra `http://localhost:3000/health` — deve retornar `{status: 'ok'}`

Webhook URL:
- Após deploy você terá uma URL pública, por exemplo `https://your-app.up.railway.app`.
- Configure no painel do Meta: `https://your-app.up.railway.app/webhook` e o `VERIFY_TOKEN` usado no `.env`.

Observações de produção:
- Use um domínio com TLS para produção se desejar (Railway fornece TLS automático para o domínio padrão).
- Monitore logs e mensagens com Railway logs.


Deploy do bot Python (opcional):
- Se quiser deployar o `python-bot/`, crie um serviço separado no Railway apontando para essa pasta e use `python -m pip install -r requirements.txt` como build e `gunicorn app:app` como start command.

Se quiser, eu posso gerar a configuração do GitHub Actions ou um template `railway.json` para automação.
