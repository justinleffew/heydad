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
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
    setup: (server) => {
      // Handle Stripe checkout session creation
      server.middlewares.use('/api/create-checkout-session', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              const stripe = new (await import('stripe')).default(process.env.VITE_STRIPE_SECRET_KEY);
              const { priceId, interval, isGuest, guestEmail } = JSON.parse(body);

              // Create a checkout session
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price: priceId,
                    quantity: 1,
                  },
                ],
                mode: 'subscription',
                success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.VITE_APP_URL}/pricing`,
                customer_email: isGuest ? guestEmail : undefined,
                metadata: {
                  isGuest: isGuest ? 'true' : 'false',
                  interval,
                },
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ id: session.id }));
            } catch (err) {
              console.error('Error creating checkout session:', err.message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });

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