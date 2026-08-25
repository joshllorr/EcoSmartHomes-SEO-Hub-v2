import { Request, Response } from 'express';
import Stripe from 'stripe';

function getStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16',
  });
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!process.env.STRIPE_SECRET_KEY || !endpointSecret) {
    console.warn('⚠ Stripe webhook called but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not configured.');
    return res.status(500).send('Stripe credentials not configured.');
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
  } catch (err: any) {
    console.error(`2▀#Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const leadData = {
      leadId: `lead-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      stripeStatus: 'PAID',
      stripeSessionId: session.id,
      homeownerProfile: {
        name: session.customer_details?.name || 'Homeowner',
        phone: session.customer_details?.phone || '',
        email: session.customer_details?.email || '',
      },
      approvalStatus: 'AWAITING_DOCUMENT_UPLOAD',
    };

    console.log(`✅ [Stripe] €49 Payment confirmed for session: ${session.id}`, leadData);
  }

  res.json({ received: true });
};
