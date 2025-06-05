import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if we have a guest email in the URL
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email) {
      setIsGuest(true);
      setGuestEmail(email);
    }
  }, [location]);

  const handleSubscription = async (priceId, interval) => {
    try {
      setIsLoading(true);
      const stripe = await stripePromise;
      
      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          interval,
          isGuest,
          guestEmail: isGuest ? guestEmail : null,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-dad-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-dad-dark sm:text-5xl">
              Secure Your Stories for Your Kids
            </h2>
            <p className="mt-4 text-xl text-dad-olive">
              Your kids will thank you — Start recording today.
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8 lg:max-w-4xl lg:mx-auto">
            {/* Monthly Plan */}
            <div 
              className={`bg-dad-white rounded-xl shadow-lg transition-all duration-300 border border-dad-blue-gray ${
                hoveredPlan === 'monthly' ? 'shadow-xl transform scale-[1.02] border-dad-olive' : ''
              }`}
              onMouseEnter={() => setHoveredPlan('monthly')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-dad-dark">Monthly</h3>
                <p className="mt-4 text-lg text-dad-olive">Perfect for first-time dads or trying it out!</p>
                <div className="flex-grow"></div>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-dad-dark">$4.99</span>
                  <span className="text-lg font-medium text-dad-blue-gray">/month</span>
                </p>
                <button
                  onClick={() => handleSubscription('prod_SQn9T0TLrtlUC2', 'month')}
                  disabled={isLoading}
                  className="mt-8 block w-full bg-dad-accent text-dad-white rounded-xl py-3 px-4 text-lg font-semibold hover:bg-opacity-90 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-dad-accent focus:ring-offset-2"
                >
                  {isLoading ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              </div>
            </div>

            {/* Annual Plan */}
            <div 
              className={`bg-dad-white rounded-xl shadow-lg transition-all duration-300 relative border border-dad-blue-gray ${
                hoveredPlan === 'annual' ? 'shadow-xl transform scale-[1.02] border-dad-olive' : ''
              }`}
              onMouseEnter={() => setHoveredPlan('annual')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-dad-accent text-dad-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </span>
              </div>
              <div className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-dad-dark">Annual</h3>
                <p className="mt-4 text-lg text-dad-olive">Save over 30%! Best value for dads who want to build a lasting memory bank.</p>
                <div className="flex-grow"></div>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-dad-dark">$39.99</span>
                  <span className="text-lg font-medium text-dad-blue-gray">/year</span>
                </p>
                <button
                  onClick={() => handleSubscription('prod_SQn8QkbgCMHjPe', 'year')}
                  disabled={isLoading}
                  className="mt-8 block w-full bg-dad-accent text-dad-white rounded-xl py-3 px-4 text-lg font-semibold hover:bg-opacity-90 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-dad-accent focus:ring-offset-2"
                >
                  {isLoading ? 'Loading...' : 'Subscribe Annually'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage; 