# Payment and Donor Platform Integration Guide

## Overview

This document outlines the integration strategy for payment processors and donor platforms for the MTD-Site. The platform requires two distinct payment flows:

1. **Subscription Payments**: For mentees to access platform features
2. **Donations**: For one-time or recurring charitable contributions

## Table of Contents

1. [Payment Integration (Subscriptions)](#payment-integration-subscriptions)
2. [Donor Platform Integration](#donor-platform-integration)
3. [Implementation Steps](#implementation-steps)
4. [Testing Strategy](#testing-strategy)
5. [Security Considerations](#security-considerations)

---

## Payment Integration (Subscriptions)

### Supported Payment Processors

#### 1. Stripe (Recommended)

**Why Stripe:**
- Comprehensive subscription management
- PCI DSS compliance handled
- Extensive documentation and SDKs
- Webhook support for real-time updates
- Support for multiple payment methods (cards, Apple Pay, Google Pay)

**Integration Steps:**

1. **Install Stripe SDK:**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Create Stripe Checkout Session API:**
   ```typescript
   // src/app/api/payments/create-checkout/route.ts
   import Stripe from 'stripe';
   import { NextRequest, NextResponse } from 'next/server';
   
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2023-10-16',
   });
   
   export async function POST(request: NextRequest) {
     const { userId, priceId } = await request.json();
     
     const session = await stripe.checkout.sessions.create({
       mode: 'subscription',
       payment_method_types: ['card'],
       line_items: [{ price: priceId, quantity: 1 }],
       success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/mentee?success=true`,
       cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
       client_reference_id: userId,
     });
     
     return NextResponse.json({ sessionId: session.id });
   }
   ```

4. **Create Webhook Handler:**
   ```typescript
   // src/app/api/webhooks/stripe/route.ts
   import Stripe from 'stripe';
   import { headers } from 'next/headers';
   import { NextResponse } from 'next/server';
   import { createSubscription, updateSubscription } from '@/lib/models/Subscription';
   import { createPayment } from '@/lib/models/Payment';
   
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
   
   export async function POST(req: Request) {
     const body = await req.text();
     const signature = headers().get('stripe-signature')!;
     
     let event: Stripe.Event;
     
     try {
       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
     } catch (err) {
       return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
     }
     
     switch (event.type) {
       case 'checkout.session.completed':
         const session = event.data.object as Stripe.Checkout.Session;
         // Create subscription and payment records
         break;
       case 'invoice.payment_succeeded':
         // Update subscription status
         break;
       case 'customer.subscription.deleted':
         // Mark subscription as cancelled
         break;
     }
     
     return NextResponse.json({ received: true });
   }
   ```

**Pricing Plans:**
```typescript
const PRICING_PLANS = {
  monthly: {
    name: 'Monthly Subscription',
    priceId: 'price_XXXXX',
    amount: 2999, // $29.99
    interval: 'month'
  },
  yearly: {
    name: 'Annual Subscription',
    priceId: 'price_XXXXX',
    amount: 29999, // $299.99
    interval: 'year'
  }
};
```

#### 2. PayPal

**Integration Steps:**

1. **Install PayPal SDK:**
   ```bash
   npm install @paypal/checkout-server-sdk
   ```

2. **Environment Variables:**
   ```bash
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox # or 'live'
   ```

3. **Create PayPal Order:**
   ```typescript
   // src/app/api/payments/paypal/create-order/route.ts
   import paypal from '@paypal/checkout-server-sdk';
   
   function environment() {
     const clientId = process.env.PAYPAL_CLIENT_ID!;
     const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
     
     return process.env.PAYPAL_MODE === 'live'
       ? new paypal.core.LiveEnvironment(clientId, clientSecret)
       : new paypal.core.SandboxEnvironment(clientId, clientSecret);
   }
   
   export async function POST(request: Request) {
     const { userId, planType } = await request.json();
     
     const client = new paypal.core.PayPalHttpClient(environment());
     const request = new paypal.orders.OrdersCreateRequest();
     
     request.prefer('return=representation');
     request.requestBody({
       intent: 'CAPTURE',
       purchase_units: [{
         amount: {
           currency_code: 'USD',
           value: '29.99'
         }
       }]
     });
     
     const response = await client.execute(request);
     return NextResponse.json({ orderId: response.result.id });
   }
   ```

#### 3. Apple Pay

Apple Pay can be integrated through Stripe or PayPal, as both support it natively.

**Stripe Apple Pay:**
```typescript
const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: {
    label: 'MTD Subscription',
    amount: 2999,
  },
  requestPayerName: true,
  requestPayerEmail: true,
});

const elements = stripe.elements();
const prButton = elements.create('paymentRequestButton', {
  paymentRequest: paymentRequest,
});
```

---

## Donor Platform Integration

### Current Integration: Zeffy

**Status:** ✅ Implemented (iframe on `/donate` page)

**Configuration:**
```typescript
// Environment variable
NEXT_PUBLIC_ZEFFY_URL=https://www.zeffy.com/embed/donation-form/...
```

**Usage:**
```tsx
<iframe
  src={process.env.NEXT_PUBLIC_ZEFFY_URL}
  style={{ width: '100%', height: '800px', border: 'none' }}
  title="Donation Form"
/>
```

### Future Integration: GiveLively

**Why GiveLively:**
- Zero fees for nonprofits
- Recurring donation support
- Donor management CRM
- Campaign creation tools
- Email marketing integration

**Integration Steps:**

1. **Setup GiveLively Account:**
   - Create organization account at https://www.givelively.org
   - Complete nonprofit verification
   - Set up bank account for deposits

2. **Embed Donation Form:**
   ```html
   <script src="https://secure.givelively.org/widgets/simple_donation/mothers-to-daughters-foundation.js"></script>
   ```

3. **Create API Integration:**
   ```typescript
   // src/app/api/donations/givelively/webhook/route.ts
   export async function POST(request: Request) {
     const body = await request.json();
     
     // Verify webhook signature
     // Log donation in database
     // Send thank you email
     
     return NextResponse.json({ success: true });
   }
   ```

4. **Environment Variables:**
   ```bash
   GIVELIVELY_API_KEY=...
   GIVELIVELY_ORG_ID=...
   GIVELIVELY_WEBHOOK_SECRET=...
   ```

### Donation Tracking System

**Database Schema (already implemented):**
```typescript
// Separate from subscriptions
interface Donation {
  _id: string;
  userId?: string; // Optional for anonymous donations
  amount: number;
  currency: string;
  frequency: 'one-time' | 'monthly' | 'yearly';
  platform: 'zeffy' | 'givelively';
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  donorInfo: {
    name: string;
    email: string;
    anonymous: boolean;
  };
  createdAt: Date;
}
```

**Create Donation Model:**
```typescript
// src/lib/models/Donation.ts
import { getDb } from '../db';

export async function createDonation(donationData: Omit<Donation, '_id' | 'createdAt'>) {
  const db = await getDb();
  const donations = db.collection('donations');
  
  const donation = {
    ...donationData,
    createdAt: new Date(),
  };
  
  const result = await donations.insertOne(donation);
  return { ...donation, _id: result.insertedId.toString() };
}

export async function getDonationsByUserId(userId: string) {
  const db = await getDb();
  const donations = db.collection('donations');
  return await donations.find({ userId }).sort({ createdAt: -1 }).toArray();
}
```

---

## Implementation Steps

### Phase 1: Stripe Integration

1. **Set up Stripe account and get API keys**
2. **Create pricing plans in Stripe Dashboard**
3. **Implement checkout session creation API**
4. **Create webhook handler for subscription events**
5. **Build pricing page UI with payment options**
6. **Test subscription flow end-to-end**

### Phase 2: PayPal Integration

1. **Set up PayPal business account**
2. **Get API credentials**
3. **Implement PayPal order creation**
4. **Add PayPal buttons to pricing page**
5. **Test payment flow**

### Phase 3: Apple Pay (via Stripe)

1. **Verify domain with Apple**
2. **Configure Apple Pay in Stripe**
3. **Add Apple Pay button to checkout**
4. **Test on iOS devices**

### Phase 4: GiveLively Integration

1. **Complete GiveLively registration**
2. **Create donation form**
3. **Embed form on donation pages**
4. **Set up webhook handlers**
5. **Test donation flow**

---

## Testing Strategy

### Test Accounts

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
3D Secure: 4000 0025 0000 3155
Declined: 4000 0000 0000 9995
```

**PayPal Sandbox:**
- Create test buyer and seller accounts
- Use PayPal sandbox credentials

### Test Scenarios

1. **Subscription Purchase:**
   - [ ] Monthly subscription with card
   - [ ] Annual subscription with card
   - [ ] Apple Pay subscription
   - [ ] PayPal subscription
   - [ ] Failed payment handling
   - [ ] 3D Secure authentication

2. **Subscription Management:**
   - [ ] Upgrade from monthly to annual
   - [ ] Downgrade from annual to monthly
   - [ ] Cancel subscription
   - [ ] Reactivate subscription
   - [ ] Update payment method

3. **Donations:**
   - [ ] One-time donation via Zeffy
   - [ ] Recurring donation via GiveLively
   - [ ] Anonymous donation
   - [ ] Donation receipt email

4. **Webhooks:**
   - [ ] Subscription created
   - [ ] Payment succeeded
   - [ ] Payment failed
   - [ ] Subscription cancelled
   - [ ] Subscription renewed

---

## Security Considerations

### Best Practices

1. **Never Store Card Details:**
   - Use Stripe Elements or PayPal SDK
   - Tokenize payment information
   - Never log sensitive data

2. **Webhook Security:**
   - Verify webhook signatures
   - Use HTTPS only
   - Implement replay attack prevention
   - Rate limit webhook endpoints

3. **PCI Compliance:**
   - Use hosted payment pages (Stripe Checkout)
   - Avoid handling raw card data
   - Implement CSP headers

4. **User Authentication:**
   - Require authentication for subscription management
   - Verify user owns subscription before allowing changes
   - Log all payment-related actions

### Environment Variables Security

```bash
# Never commit these to version control
# Use .env.local for development
# Configure in Vercel/hosting platform for production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# GiveLively
GIVELIVELY_API_KEY=...
GIVELIVELY_WEBHOOK_SECRET=...
```

### Monitoring and Alerts

1. **Set up monitoring for:**
   - Failed payments
   - Webhook failures
   - Subscription cancellations
   - Unusual payment patterns

2. **Alert channels:**
   - Email notifications for admins
   - Slack integration for real-time alerts
   - Dashboard metrics

---

## API Endpoints Summary

### Subscription Endpoints
- `POST /api/payments/create-checkout` - Create Stripe checkout session
- `POST /api/payments/paypal/create-order` - Create PayPal order
- `POST /api/payments/paypal/capture-order` - Capture PayPal payment
- `GET /api/subscriptions/current` - Get user's current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/reactivate` - Reactivate subscription

### Webhook Endpoints
- `POST /api/webhooks/stripe` - Handle Stripe events
- `POST /api/webhooks/paypal` - Handle PayPal events
- `POST /api/webhooks/givelively` - Handle GiveLively events

### Donation Endpoints
- `GET /api/donations/user` - Get user's donation history
- `GET /api/admin/donations` - Admin view of all donations
- `POST /api/donations/thank-you` - Send donation thank you email

---

## UI Components Needed

### 1. Pricing Page (`/pricing`)
- Display subscription plans
- Feature comparison
- Payment method selection
- Call-to-action buttons

### 2. Checkout Flow
- Payment method selection
- Subscription summary
- Terms and conditions
- Success/failure pages

### 3. Subscription Management (`/dashboard/mentee/subscription`)
- Current plan details
- Payment history
- Update payment method
- Cancel/reactivate options

### 4. Donation Pages
- `/donate` - Main donation page (Zeffy)
- `/donate/givelively` - Alternative donation page
- `/dashboard/donor/history` - Donation history

---

## Support and Maintenance

### Regular Tasks
- Monitor webhook success rates
- Review failed payments
- Update pricing plans
- Check for API version updates
- Review transaction logs

### Documentation Links
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com/)
- [Zeffy Help Center](https://help.zeffy.com/)
- [GiveLively Support](https://www.givelively.org/help)

### Contact Information
For payment integration support:
- Stripe Support: support@stripe.com
- PayPal Support: https://www.paypal.com/businesshelp
- Internal: admin@motherstodaughters.org

---

## Next Steps

1. **Immediate:**
   - [ ] Complete Stripe account setup
   - [ ] Create test pricing plans
   - [ ] Implement basic checkout flow

2. **Short-term (1-2 weeks):**
   - [ ] Add webhook handlers
   - [ ] Build subscription management UI
   - [ ] Test end-to-end flows

3. **Medium-term (1 month):**
   - [ ] Add PayPal integration
   - [ ] Implement Apple Pay
   - [ ] Complete GiveLively setup

4. **Long-term:**
   - [ ] Advanced reporting
   - [ ] Subscription analytics
   - [ ] Automated retry logic for failed payments
   - [ ] Dunning management

---

*Last Updated: [Current Date]*
*Version: 1.0*
