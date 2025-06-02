import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);
const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Create or update user subscription in Supabase
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.client_reference_id,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: 'active',
            price_id: session.line_items.data[0].price.id,
            interval: session.metadata.interval,
            is_guest: session.metadata.isGuest === 'true',
            guest_email: session.customer_email,
            current_period_end: new Date(session.expires_at * 1000).toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating subscription:', error);
          throw error;
        }

        // If it's a guest checkout, create a new user account
        if (session.metadata.isGuest === 'true') {
          const { data: user, error: userError } = await supabase.auth.signUp({
            email: session.customer_email,
            password: Math.random().toString(36).slice(-8), // Generate random password
            options: {
              data: {
                is_guest_account: true,
                subscription_id: subscription.id,
              },
            },
          });

          if (userError) {
            console.error('Error creating guest user:', userError);
            throw userError;
          }

          // Send welcome email with login instructions
          // You can implement this using your preferred email service
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
          throw error;
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 