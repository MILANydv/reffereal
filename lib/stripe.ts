import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name: name || undefined,
  });
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string
) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function createStripeInvoice(
  customerId: string,
  amount: number,
  description: string
) {
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
