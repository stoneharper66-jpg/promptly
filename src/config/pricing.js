// Pricing is CONFIGURATION, not hard-coded truth — adjust amounts here and
// create the matching Stripe products/prices inside Base44. The `stripe`
// notes document exactly what to create; no keys or price IDs live in code.

export const PLANS = [
  {
    id: 'promptly-monthly',
    name: 'Monthly',
    amount: 14,
    currency: 'USD',
    interval: 'month',
    badge: null,
    blurb: 'Full library access, billed monthly. Cancel anytime.',
    stripe: 'Create a recurring monthly price and name it "Promptly Monthly".',
  },
  {
    id: 'promptly-yearly',
    name: 'Yearly',
    amount: 79,
    currency: 'USD',
    interval: 'year',
    badge: 'Best value',
    blurb: 'Everything in Monthly at less than half the effective rate.',
    stripe: 'Create a recurring yearly price and name it "Promptly Yearly".',
  },
];

export const PLAN_FEATURES = [
  'Every premium prompt, unlocked',
  'All six categories + new drops',
  'Copy-ready, tested prompt text',
  'Save prompts to your library',
  'Cancel anytime from your account',
];
