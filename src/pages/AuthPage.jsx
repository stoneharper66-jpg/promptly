import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { login, signup, IS_DEMO_AUTH } from '@/api/auth';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const next = params.get('next') || '/dashboard';

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup') await signup(name, email, password);
    else await login(email, password);
    await refresh();
    navigate(next);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-soft">
          {mode === 'signup'
            ? 'Save prompts, track your library and unlock premium.'
            : 'Log in to your Promptly account.'}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-sm outline-none focus:border-ink/30"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-sm outline-none focus:border-ink/30"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-sm outline-none focus:border-ink/30"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-ink w-full">
          {mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        className="mt-5 text-sm font-medium text-soft hover:text-ink"
      >
        {mode === 'signup'
          ? 'Already have an account? Log in'
          : 'New to Promptly? Create an account'}
      </button>

      {IS_DEMO_AUTH && (
        <p className="mt-8 rounded-2xl border border-line bg-card p-4 text-xs leading-relaxed text-soft">
          Demo auth: any email works, no real password storage. Use an email
          starting with <span className="font-semibold">admin</span> (e.g.
          admin@promptly.app) to access the admin dashboard. After Base44
          import, this screen is replaced by Base44 authentication.
        </p>
      )}
    </div>
  );
}
