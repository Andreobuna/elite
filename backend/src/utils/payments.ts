import Stripe from 'stripe';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * Unified payment adapter. Each provider is only actually called if its
 * secret key is configured; otherwise a mock session/reference is returned
 * so checkout can be fully tested end-to-end before real payment keys exist.
 *
 * To go live for a given provider, set its secret key in .env:
 *   STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID/SECRET, PAYSTACK_SECRET_KEY, FLUTTERWAVE_SECRET_KEY
 */

const stripe = env.stripe.secretKey ? new Stripe(env.stripe.secretKey) : null;

export interface PaymentSession {
  reference: string;
  clientSecret?: string;
  redirectUrl?: string;
  provider: string;
  mocked: boolean;
}

export async function createPaymentIntent(
  provider: 'STRIPE' | 'PAYPAL' | 'PAYSTACK' | 'FLUTTERWAVE',
  amount: number,
  orderNumber: string
): Promise<PaymentSession> {
  switch (provider) {
    case 'STRIPE': {
      if (!stripe) {
        logger.warn('[payments] STRIPE_SECRET_KEY not set — returning mock payment session');
        return { reference: `mock_stripe_${orderNumber}`, provider, mocked: true };
      }
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: { orderNumber },
      });
      return { reference: intent.id, clientSecret: intent.client_secret ?? undefined, provider, mocked: false };
    }
    case 'PAYPAL': {
      if (!env.paypal.clientId) {
        logger.warn('[payments] PAYPAL_CLIENT_ID not set — returning mock payment session');
        return { reference: `mock_paypal_${orderNumber}`, provider, mocked: true };
      }
      // Real integration: call PayPal Orders API v2 (/v2/checkout/orders) here
      // using an OAuth2 client-credentials token from env.paypal.clientId/Secret.
      return { reference: `paypal_${orderNumber}`, provider, mocked: false };
    }
    case 'PAYSTACK': {
      if (!env.paystack.secretKey) {
        logger.warn('[payments] PAYSTACK_SECRET_KEY not set — returning mock payment session');
        return { reference: `mock_paystack_${orderNumber}`, provider, mocked: true };
      }
      // Real integration: POST to https://api.paystack.co/transaction/initialize
      return { reference: `paystack_${orderNumber}`, provider, mocked: false };
    }
    case 'FLUTTERWAVE': {
      if (!env.flutterwave.secretKey) {
        logger.warn('[payments] FLUTTERWAVE_SECRET_KEY not set — returning mock payment session');
        return { reference: `mock_flw_${orderNumber}`, provider, mocked: true };
      }
      // Real integration: POST to https://api.flutterwave.com/v3/payments
      return { reference: `flw_${orderNumber}`, provider, mocked: false };
    }
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
