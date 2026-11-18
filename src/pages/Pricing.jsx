import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { startCheckout } from '@/api/billing';
import { PLANS, PLAN_FEATURES } from '@/config/pricing';
import { BASE44_ENABLED } from '@/api/base44Client';

export default function Pricing() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const buy = async (plan) => {
    setError(null);
    if (!user) {
      navigate('/auth?next=/pricing');
      return;
    }
    setBusy(plan.id);
    try {
      await startCheckout(user, plan);
      await refresh();
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          One membership. The whole library.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-soft">
          Try the free prompts first. When you want everything, pick a plan —
          cancel anytime from your account.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-line bg-card p-4 text-center text-sm text-soft">
          {error}
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl border bg-card p-8 shadow-card ${
              plan.badge ? 'border-ink' : 'border-line'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-8 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {plan.badge}
              </span>
            )}
            <h2 className="font-display text-lg font-bold">{plan.name}</h2>
            <p className="mt-3 font-display text-5xl font-extrabold tracking-tight">
              ${plan.amount}
              <span className="text-base font-semibold text-soft">/{plan.interval}</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-soft">{plan.blurb}</p>
            <button
              onClick={() => buy(plan)}
              disabled={busy === plan.id || user?.has_premium}
              className="btn-ink mt-6 w-full disabled:opacity-50"
            >
              {user?.has_premium
                ? 'You are a member'
                : busy === plan.id
                  ? 'Processing…'
                  : `Get ${plan.name}`}
            </button>
            <ul className="mt-7 space-y-2.5 border-t border-line pt-6">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-2xl border border-line bg-card p-5 text-sm leading-relaxed text-soft">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
        <p>
          {BASE44_ENABLED
            ? 'Payments are processed securely by Stripe via Base44.'
            : 'Demo mode: checkout simulates the membership flow without charging anything. Real payments are enabled by connecting Stripe inside Base44 after import — see the README.'}{' '}
          Not sure yet? <Link to="/explore" className="font-semibold text-ink underline">Browse the free prompts</Link> first.
        </p>
      </div>
    </div>
  );
}
