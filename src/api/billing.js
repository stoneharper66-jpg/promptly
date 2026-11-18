// Billing integration points.
//
// Payments are configured through Base44's Stripe integration AFTER this
// repo is imported — no Stripe keys live in this codebase, and nothing
// here fakes a real charge.
//
// In Base44 (see README "Stripe setup"):
//   1. Connect Stripe in Base44 → Integrations.
//   2. Create the products/prices listed in src/config/pricing.js.
//   3. Point the checkout action of the Pricing page buttons at the
//      Base44 Stripe checkout for the chosen price.
//   4. On `checkout.session.completed` / `customer.subscription.updated`
//      webhooks, set User.has_premium and upsert a Membership row.
//   5. On `customer.subscription.deleted` / `invoice.payment_failed`,
//      clear User.has_premium and mark the Membership inactive.
//
// Locally: a clearly-labelled DEMO checkout flips the same flags so the
// whole paywall flow can be tested before Stripe exists.

import { BASE44_ENABLED } from '@/api/base44Client';
import { updateLocalUser } from '@/api/auth';
import { db } from '@/api/db';

export async function startCheckout(user, plan) {
  if (BASE44_ENABLED) {
    throw new Error(
      'Stripe checkout is not configured yet. Connect Stripe inside Base44 and wire this action to the Base44 checkout for price: ' +
        plan.id,
    );
  }

  // DEMO checkout — no money moves. Mirrors exactly what the Base44
  // Stripe webhook handler should do after a successful payment.
  await db.Membership.create({
    user_id: user.id,
    plan_id: plan.id,
    status: 'active',
    started_at: new Date().toISOString(),
  });
  return updateLocalUser({ has_premium: true });
}

export async function cancelMembership(user) {
  if (BASE44_ENABLED) {
    throw new Error(
      'Cancellation is handled by the Stripe customer portal once connected in Base44.',
    );
  }
  const memberships = await db.Membership.filter({ user_id: user.id, status: 'active' });
  for (const m of memberships) {
    await db.Membership.update(m.id, { status: 'cancelled' });
  }
  return updateLocalUser({ has_premium: false });
}
