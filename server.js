import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createDevServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Handle Cloudflare Stream upload URL creation
  app.post('/api/createStreamUploadUrl', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const CLOUDFLARE_ACCOUNT_ID = process.env.VITE_CLOUDFLARE_ACCOUNT_ID;
      const CLOUDFLARE_API_TOKEN = process.env.VITE_CLOUDFLARE_API_TOKEN;

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

  // Handle all other routes with Vite
  app.use('*', (req, res) => {
    res.status(404).send('Not found');
  });

  return app;
}

createDevServer().then(app => {
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}); 