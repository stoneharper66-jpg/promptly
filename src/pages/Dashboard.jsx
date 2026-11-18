import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cancelMembership } from '@/api/billing';

export default function Dashboard() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth?next=/dashboard');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    db.Membership.filter({ user_id: user.id }).then(setMemberships);
    db.PromptHistory.filter({ user_id: user.id }).then((rows) =>
      setHistory(rows.slice(-8).reverse()),
    );
  }, [user]);

  if (!user) return null;

  const active = memberships.find((m) => m.status === 'active');

  const cancel = async () => {
    setError(null);
    try {
      await cancelMembership(user);
      await refresh();
      setMemberships(await db.Membership.filter({ user_id: user.id }));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
        {user.full_name}
      </h1>
      <p className="mt-1 text-sm text-soft">{user.email}</p>

      {/* Membership card */}
      <div className="mt-8 rounded-3xl border border-line bg-card p-7 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${user.has_premium ? 'bg-ink text-white' : 'border border-line text-soft'}`}>
              {user.has_premium ? <BadgeCheck className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            </span>
            <div>
              <p className="font-display text-lg font-bold">
                {user.has_premium ? 'Premium member' : 'Free account'}
              </p>
              <p className="text-sm text-soft">
                {user.has_premium
                  ? `Plan: ${active?.plan_id || 'active'} — full library unlocked`
                  : 'Premium prompts are locked. Upgrade to unlock everything.'}
              </p>
            </div>
          </div>
          {user.has_premium ? (
            <button onClick={cancel} className="btn-ghost !py-2.5 text-sm">
              Cancel membership
            </button>
          ) : (
            <Link to="/pricing" className="btn-ink !py-2.5 text-sm">
              Upgrade
            </Link>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-soft">{error}</p>}
      </div>

      {/* Recently viewed */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-bold">Recently viewed</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-soft">
            Nothing yet — <Link to="/explore" className="font-semibold text-ink underline">go explore the library</Link>.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  to={`/prompt/${h.prompt_id}`}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-medium hover:bg-paper"
                >
                  {h.prompt_id}
                  <span className="text-xs text-soft">
                    {new Date(h.viewed_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
