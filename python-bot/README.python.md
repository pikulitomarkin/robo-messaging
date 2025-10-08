# Bot Python (Flask) — README

Requisitos:
- Python 3.10+
- virtualenv (opcional)

Instalação:
```powershell
cd python-bot
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configurar variáveis de ambiente:
```powershell
copy .env.example .env
notepad .env
# edite e cole seus tokens (META_TOKEN, PHONE_NUMBER_ID, VERIFY_TOKEN, OPENAI_API_KEY)
```

Rodar localmente:
```powershell
python app.py
```

Expor com ngrok (porta 5000):
```powershell
ngrok http 5000
```

Configurar callback no Meta:
- Callback URL: https://<ngrok-id>.ngrok.io/webhook
- Verify token: valor de VERIFY_TOKEN no .env

Notas:
- O bot usa OpenAI para gerar respostas. Se não tiver OPENAI_API_KEY, ele envia fallback.
- Em produção, use um servidor WSGI (gunicorn) e domínio com TLS.
