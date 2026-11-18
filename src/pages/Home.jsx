import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { db } from '@/api/db';
import PromptCard from '@/components/PromptCard';
import PreviewImage from '@/components/PreviewImage';
import { PLANS, PLAN_FEATURES } from '@/config/pricing';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    db.Category.list().then(setCategories);
    db.Prompt.list().then(setPrompts);
  }, []);

  const catName = (id) => categories.find((c) => c.id === id)?.name;
  const featured = prompts.filter((p) => p.featured);
  const popular = prompts.filter((p) => p.popular).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
        <p className="eyebrow rise">Premium AI image prompts</p>
        <h1 className="rise rise-1 mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl">
          The luxury aesthetic, one prompt away
        </h1>
        <p className="rise rise-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-soft sm:text-lg">
          Professionally engineered prompts for hyperreal luxury imagery —
          supercars, penthouses, private jets, quiet-luxury fashion. Tested
          until the output looks like a photo, not AI art.
        </p>
        <div className="rise rise-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/explore" className="btn-ink">
            Explore prompts
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/pricing" className="btn-ghost">
            See pricing
          </Link>
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const sample = prompts.find((p) => p.category_id === c.id && p.featured) ||
              prompts.find((p) => p.category_id === c.id);
            return (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className="group overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {sample && (
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                      <PreviewImage prompt={sample} />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink backdrop-blur">
                    {c.number}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-display text-[15px] font-bold">{c.name}</h3>
                    <p className="mt-0.5 text-[13px] text-soft">{c.tagline}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-soft transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hand-picked this week
            </h2>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-ink hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PromptCard key={p.id} prompt={p} categoryName={catName(p.category_id)} />
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="border-y border-line bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8">
            <p className="eyebrow">Popular</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Most copied right now
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((p) => (
              <PromptCard key={p.id} prompt={p} categoryName={catName(p.category_id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing strip */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="rounded-3xl border border-line bg-card p-8 shadow-card sm:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">Membership</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
                One pass. Every prompt.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-soft">
                Free prompts to try the quality. A single membership unlocks the
                entire premium library.
              </p>
              <div className="mt-6 flex items-end gap-8">
                {PLANS.map((plan) => (
                  <div key={plan.id}>
                    {plan.badge && (
                      <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        {plan.badge}
                      </span>
                    )}
                    <p className="mt-2 font-display text-3xl font-extrabold">
                      ${plan.amount}
                      <span className="text-sm font-semibold text-soft">/{plan.interval}</span>
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/pricing" className="btn-ink mt-7">
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-3 self-center">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
