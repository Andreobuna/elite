import axios from 'axios';
import Stripe from 'stripe';
import { env } from '../config/env';
import { logger } from './logger';

const stripe = env.stripe.secretKey ? new Stripe(env.stripe.secretKey) : null;

export interface PaymentSession { reference: string; clientSecret?: string; redirectUrl?: string; provider: string; mocked: boolean; }
export interface CreatePaymentIntentOptions { customerEmail?: string; callbackUrl?: string; metadata?: Record<string, unknown>; }

function buildDefaultCallbackUrl() { return new URL('/checkout/paystack/return', env.clientUrl).toString(); }
export async function createPaymentIntent(provider: 'STRIPE' | 'PAYPAL' | 'PAYSTACK' | 'FLUTTERWAVE', amount: number, orderNumber: string, options: CreatePaymentIntentOptions = {}): Promise<PaymentSession> {
  switch (provider) {
    case 'STRIPE': {
      if (!stripe) { logger.warn('[payments] STRIPE_SECRET_KEY not set - returning mock payment session'); return { reference: 'mock_stripe_' + orderNumber, provider, mocked: true }; }
      const intent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: 'usd', metadata: { orderNumber, ...options.metadata } });
      return { reference: intent.id, clientSecret: intent.client_secret ?? undefined, provider, mocked: false };
    }
    case 'PAYPAL': {
      if (!env.paypal.clientId) { logger.warn('[payments] PAYPAL_CLIENT_ID not set - returning mock payment session'); return { reference: 'mock_paypal_' + orderNumber, provider, mocked: true }; }
      return { reference: 'paypal_' + orderNumber, provider, mocked: false };
    }
    case 'PAYSTACK': {
      if (!env.paystack.secretKey) { logger.warn('[payments] PAYSTACK_SECRET_KEY not set - returning mock payment session'); return { reference: 'mock_paystack_' + orderNumber, provider, mocked: true }; }
      if (!options.customerEmail) throw new Error('Paystack requires a customer email.');
      const callbackUrl = options.callbackUrl ?? buildDefaultCallbackUrl();
      const { data } = await axios.post('https://api.paystack.co/transaction/initialize', { email: options.customerEmail, amount: Math.round(amount * 100), currency: 'NGN', callback_url: callbackUrl, metadata: { orderNumber, ...options.metadata } }, { headers: { Authorization: 'Bearer ' + env.paystack.secretKey, 'Content-Type': 'application/json' } });
      const session = data?.data;
      if (!session?.reference || !session?.authorization_url) throw new Error('Paystack did not return a valid checkout session.');
      return { reference: session.reference, redirectUrl: session.authorization_url, provider, mocked: false };
    }
    case 'FLUTTERWAVE': {
      if (!env.flutterwave.secretKey) { logger.warn('[payments] FLUTTERWAVE_SECRET_KEY not set - returning mock payment session'); return { reference: 'mock_flw_' + orderNumber, provider, mocked: true }; }
      return { reference: 'flw_' + orderNumber, provider, mocked: false };
    }
    default: throw new Error('Unsupported payment provider: '+ provider);
  }
}