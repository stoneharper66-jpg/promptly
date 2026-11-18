# Promptly

Premium AI image-generation prompt marketplace for the luxury lifestyle
aesthetic — supercars, penthouses, private jets, quiet-luxury fashion,
mansions and entrepreneur imagery.

Built as a React + Vite + Tailwind app structured for **Base44 import**,
with Stripe payments configured **inside Base44** (no payment keys or
custom payment infrastructure live in this repo).

---

## What is in the box

- **60 professionally written prompts** across 6 categories
  (10 each, 2 free + 8 premium per category) in `src/data/seed.js`.
- **Marketplace UI**: Home, Explore (search / filter / sort), category
  pages, prompt detail pages with a working copy-to-clipboard button,
  Pricing, Login/Signup, user Dashboard, My Library, and a full Admin
  dashboard (prompt CRUD, categories, featuring, users, membership stats).
- **Paywall**: free prompts are readable by everyone; premium prompt text
  is split into a separate `PromptContent` entity so Base44 row-level
  security enforces access **server-side** — client tampering reveals
  nothing.
- **Entity schemas with RLS** ready for Base44 in `base44/entities/`.
- **Demo mode**: with no Base44 app configured, the app runs fully
  offline on a localStorage adapter (seeded with all 60 prompts, demo
  auth, simulated checkout) so every flow can be tested before import.
  A banner makes demo mode obvious; nothing pretends to be a real charge.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to ./dist
```

Demo accounts (local mode only):

- Any email/password signs in as a normal user.
- An email starting with `admin` (e.g. `admin@promptly.app`) gets the
  admin role and the Admin dashboard.

## Project structure

```
base44/                 Base44 config + entity schemas (RLS included)
src/
  api/base44Client.js   SDK client (enabled by VITE_BASE44_APP_ID)
  api/db.js             entity facade: Base44 adapter ⇄ local demo adapter
  api/auth.js           auth facade: Base44 auth ⇄ local demo auth
  api/billing.js        Stripe-via-Base44 integration points (no keys)
  config/pricing.js     plan configuration (amounts are placeholders)
  data/seed.js          6 categories + 60 prompts (the product content)
  lib/access.js         single source of truth for paywall rules
  pages/                Home, Explore, Category, PromptDetail, Pricing,
                        Auth, Dashboard, Library, Admin
```

## Importing into Base44

1. In Base44, create a new app **from this GitHub repo** (`promptly`).
2. Create the entities from `base44/entities/*.jsonc` (Category, Prompt,
   PromptContent, Membership, SavedPrompt, PromptHistory) and add the
   custom `has_premium` boolean field to the built-in User entity.
   Apply the RLS rules exactly as written — `PromptContent.read` limited
   to `has_premium: true` or admins is the entire paywall.
3. Seed data: run a one-off import of `src/data/seed.js` content into the
   entities (for each prompt: metadata into `Prompt` — with `full_prompt`
   only when `premium: false` — and premium bodies into `PromptContent`).
4. Set `VITE_BASE44_APP_ID` (Base44 sets this automatically for hosted
   apps). The app then switches all data/auth calls to Base44 and the
   demo banner disappears.

## Stripe setup (inside Base44)

No Stripe keys exist in this repo by design. Configure in Base44:

1. **Connect Stripe** in Base44 → Integrations.
2. **Create products/prices** matching `src/config/pricing.js`:
   - `Promptly Monthly` — recurring monthly (default $14, adjust freely)
   - `Promptly Yearly` — recurring yearly (default $79, adjust freely)
   Update the amounts in `src/config/pricing.js` to whatever you charge.
3. **Checkout**: wire the Pricing page buttons (`startCheckout` in
   `src/api/billing.js`) to Base44's Stripe checkout for the selected
   price. The function currently throws a clear "not configured" error in
   Base44 mode rather than faking success.
4. **Webhooks** (Base44 workflow on Stripe events):
   - `checkout.session.completed` / `customer.subscription.updated` →
     set `User.has_premium = true`, upsert an active `Membership` row
     with the Stripe customer/subscription ids.
   - `customer.subscription.deleted` → `has_premium = false`,
     mark Membership `cancelled`.
   - `invoice.payment_failed` → mark Membership `past_due`; clear
     `has_premium` after your grace period.
5. **Cancellations**: point "Cancel membership" on the Dashboard at the
   Stripe customer portal.

Until those steps are done, do **not** treat payments as live — the repo
never pretends otherwise.

## Preview imagery

Prompt cards render generated gradient artwork (no external image URLs,
so nothing can 404). To use real preview images, upload a file in the
admin prompt editor's "Preview image URL" field (via Base44 file storage
once imported) — it automatically replaces the generated artwork.

## Known Base44 limitations (and the chosen workarounds)

- **Field-level security** is not a Base44 RLS primitive, so premium text
  lives in its own entity (`PromptContent`) instead of a protected field.
- **Login/Signup page**: Base44 uses its own hosted auth; the built-in
  form is the local-mode stand-in and hands off to `base44.auth.login()`
  when running inside Base44.
- **Admin user list** reads Base44's User entity and therefore only
  works for admin-role users once imported.
