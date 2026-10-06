import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, athleteId, customerEmail } = body;

    // Create a Checkout Session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'HoopPerformance OS - Wild Wolves Academy Plan',
              description: 'Membresía oficial de alto rendimiento deportivo',
            },
            unit_amount: 12900, // $129.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?payment=cancelled`,
      customer_email: customerEmail || 'atleta@wildwolves.academy',
      metadata: {
        athleteId: athleteId || 'ath_01',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error processing Stripe checkout session' },
      { status: 500 }
    );
  }
}
