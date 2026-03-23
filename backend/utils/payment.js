const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: 'usd')
 * @returns {object} PaymentIntent
 */
const createPaymentIntent = async (amount, currency = 'usd') => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency,
    payment_method_types: ['card'],
  });
  return paymentIntent;
};

/**
 * Handle Stripe webhook event
 * @param {object} event - Stripe event object
 * @returns {object} { type, data }
 */
const handleWebhookEvent = (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return { type: 'success', data: event.data.object };
    case 'payment_intent.payment_failed':
      return { type: 'failed', data: event.data.object };
    default:
      return { type: 'unhandled', data: null };
  }
};

module.exports = { createPaymentIntent, handleWebhookEvent };
