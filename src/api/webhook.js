import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.VITE_STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { customer, subscription, metadata } = session;

        // Update user's subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.client_reference_id,
            stripe_customer_id: customer,
            stripe_subscription_id: subscription,
            status: 'active',
            interval: metadata.interval,
            is_guest: metadata.isGuest === 'true',
          });

        if (error) {
          console.error('Error updating subscription:', error);
          return res.status(500).json({ error: 'Error updating subscription' });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: subscription.status })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription status:', error);
          return res.status(500).json({ error: 'Error updating subscription status' });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription status:', error);
          return res.status(500).json({ error: 'Error updating subscription status' });
        }

        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
} 