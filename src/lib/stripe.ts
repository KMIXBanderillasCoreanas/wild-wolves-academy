import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const STRIPE_PLANS = {
  BASIC: {
    priceId: process.env.STRIPE_PRICE_BASIC || 'price_basic_academy',
    name: 'Basic Academy',
    amount: 4900, // $49.00
    currency: 'usd',
  },
  VARSITY: {
    priceId: process.env.STRIPE_PRICE_VARSITY || 'price_varsity_dev',
    name: 'Varsity Development',
    amount: 8900, // $89.00
    currency: 'usd',
  },
  ELITE: {
    priceId: process.env.STRIPE_PRICE_ELITE || 'price_elite_pack',
    name: 'Elite Wolf Pack',
    amount: 12900, // $129.00
    currency: 'usd',
  },
};
