import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

function checkStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    console.warn('Warning: Stripe is not properly configured. Billing features will not work.');
    return false;
  }
  return true;
}

export async function createStripeCustomer(email: string, name?: string) {
  if (!checkStripeConfig()) {
    throw new Error('Stripe is not configured');
  }
  return await stripe.customers.create({
    email,
    name: name || undefined,
  });
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string
) {
  if (!checkStripeConfig()) {
    throw new Error('Stripe is not configured');
  }
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  if (!checkStripeConfig()) {
    throw new Error('Stripe is not configured');
  }
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function createStripeInvoice(
  customerId: string,
  amount: number,
  description: string
) {
  if (!checkStripeConfig()) {
    throw new Error('Stripe is not configured');
  }
  await stripe.invoiceItems.create({
    customer: customerId,
    amount: Math.round(amount * 100),
    currency: 'usd',
    description,
  });

  return await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
  });
}
