import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug log environment variables
console.log('Environment variables:', {
  hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
  hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN ? '***' : undefined
});

const app = express();
app.use(cors());
app.use(express.json());

// Handle Cloudflare Stream upload URL creation
app.post('/api/createStreamUploadUrl', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.error('Missing Cloudflare config:', {
        hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
        hasApiToken: !!CLOUDFLARE_API_TOKEN
      });
      return res.status(500).json({ error: 'Missing Cloudflare configuration' });
    }

    console.log('Requesting Cloudflare upload URL with:', {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      hasToken: !!CLOUDFLARE_API_TOKEN,
      userId
    });

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          maxDurationSeconds: 1800, // 30min limit per video
          creator: userId
        })
      }
    );

    const responseText = await response.text();
    console.log('Cloudflare response:', {
      status: response.status,
      body: responseText
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Cloudflare API error: ${response.status}`,
        details: responseText
      });
    }

    const payload = JSON.parse(responseText);

    if (!payload.success) {
      console.error('Cloudflare error:', payload);
      return res.status(response.status).json(payload);
    }

    return res.status(200).json({
      uploadURL: payload.result.uploadURL,
      cloudflareVideoId: payload.result.uid
    });
  } catch (err) {
    console.error('Error creating stream upload URL:', err);
    return res.status(500).json({ error: err.message });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 