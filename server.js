import express from 'express';
import dotenv from 'dotenv';
import { handleWebhookVerification, handleWebhookEvent } from './lib/whatsapp.js';

dotenv.config();

const app = express();
// Twilio posts urlencoded forms; support both JSON and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/webhook', handleWebhookVerification);
app.post('/webhook', handleWebhookEvent);

// Health endpoint for deployments
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

// export for testing and deployment platforms
export default server;
