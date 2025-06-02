import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    },
    setup: (server) => {
      // Handle Stripe webhook
      server.middlewares.use('/api/webhook', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              const stripe = new (await import('stripe')).default(process.env.VITE_STRIPE_SECRET_KEY);
              const signature = req.headers['stripe-signature'];
              
              const event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.VITE_STRIPE_WEBHOOK_SECRET
              );

              // Handle the event
              switch (event.type) {
                case 'checkout.session.completed': {
                  const session = event.data.object;
                  // Handle successful checkout
                  console.log('Checkout completed:', session);
                  break;
                }
                case 'customer.subscription.updated': {
                  const subscription = event.data.object;
                  // Handle subscription update
                  console.log('Subscription updated:', subscription);
                  break;
                }
                case 'customer.subscription.deleted': {
                  const subscription = event.data.object;
                  // Handle subscription deletion
                  console.log('Subscription deleted:', subscription);
                  break;
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ received: true }));
            } catch (err) {
              console.error('Webhook error:', err.message);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    }
  }
}) 