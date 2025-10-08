# README de desenvolvimento

Passos para rodar localmente (Windows PowerShell):

1. Copie `.env.example` para `.env` e preencha as variáveis:

- META_TOKEN=...
- PHONE_NUMBER_ID=...
- VERIFY_TOKEN=...
- OPENAI_API_KEY=...
- PORT=3000

2. Instale dependências:

```powershell
npm install
```

3. Rode em modo dev (recomendado instalar nodemon globalmente):

```powershell
npm run dev
```

4. Exponha com ngrok (se quiser webhook público):

```powershell
ngrok http 3000
```

5. Configure a URL do webhook no painel do Meta para o endpoint `https://<ngrok-id>.ngrok.io/webhook`.

6. Verifique logs no terminal ao receber mensagens.


Notas:
- Não commit `.env`.
- Revogue tokens vazados e gere novos se necessário.
