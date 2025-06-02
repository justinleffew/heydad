import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the subscription that works best for you
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Monthly</h3>
              <p className="mt-4 text-gray-500">Perfect for trying out HeyDad</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$4.99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button
                onClick={() => handleSubscription('prod_SQUIG5baJRLmwt', 'month')}
                disabled={isLoading}
                className="mt-8 block w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? 'Loading...' : 'Subscribe Monthly'}
              </button>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Annual</h3>
              <p className="mt-4 text-gray-500">Best value for long-term use</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$39.99</span>
                <span className="text-base font-medium text-gray-500">/year</span>
              </p>
              <button
                onClick={() => handleSubscription('prod_SQUJU9oXZCu27O', 'year')}
                disabled={isLoading}
                className="mt-8 block w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? 'Loading...' : 'Subscribe Annually'}
              </button>
            </div>
          </div>
        </div>

        {/* Guest Checkout Option */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <input
              type="checkbox"
              id="guestCheckout"
              checked={isGuest}
              onChange={(e) => setIsGuest(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="guestCheckout" className="text-sm text-gray-600">
              I'm a mom and want to purchase for my husband
            </label>
          </div>
          
          {isGuest && (
            <div className="mt-4">
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mt-2 block w-full max-w-xs mx-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 