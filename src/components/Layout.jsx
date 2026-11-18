import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { IS_DEMO_DATA } from '@/api/db';

const NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-ink text-white' : 'text-soft hover:bg-line/60 hover:text-ink'
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Promptly</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to="/library" className={linkClass}>
                My Library
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-ghost !px-4 !py-2 text-sm">
                  {user.full_name || 'Account'}
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="rounded-full px-3 py-2 text-sm font-medium text-soft hover:text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-medium text-soft hover:text-ink">
                  Log in
                </Link>
                <Link to="/auth?mode=signup" className="btn-ink !px-5 !py-2.5 text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-white px-5 py-3 md:hidden">
            {[...NAV, ...(user ? [{ to: '/library', label: 'My Library' }, { to: '/dashboard', label: 'Account' }] : []), ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : [])].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-paper"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate('/');
                }}
                className="block w-full rounded-xl px-3 py-3 text-left text-[15px] font-medium text-soft"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="btn-ink mt-2 w-full"
              >
                Log in
              </Link>
            )}
          </div>
        )}
      </header>

      {IS_DEMO_DATA && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white/80">
          Demo mode — data is local. Import into Base44 and connect Stripe to go live (see README).
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="font-display text-lg font-bold">Promptly</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-soft">
                Premium AI image prompts for the luxury aesthetic. Copy,
                generate, post.
              </p>
            </div>
            <div className="flex gap-16 text-sm">
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow">Product</p>
                <Link to="/explore" className="text-soft hover:text-ink">Explore</Link>
                <Link to="/pricing" className="text-soft hover:text-ink">Pricing</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow">Account</p>
                <Link to="/auth" className="text-soft hover:text-ink">Log in</Link>
                <Link to="/library" className="text-soft hover:text-ink">My Library</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-line pt-6 text-xs text-soft">
            © 2026 Promptly. AI-generated imagery is fictional — label it where
            platforms require.
          </div>
        </div>
      </footer>
    </div>
  );
}
