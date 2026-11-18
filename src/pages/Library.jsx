import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import PromptCard from '@/components/PromptCard';

export default function Library() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth?next=/library');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [saved, all, cats] = await Promise.all([
        db.SavedPrompt.filter({ user_id: user.id }),
        db.Prompt.list(),
        db.Category.list(),
      ]);
      const ids = new Set(saved.map((s) => s.prompt_id));
      setPrompts(all.filter((p) => ids.has(p.id)));
      setCategories(cats);
      setReady(true);
    })();
  }, [user]);

  if (!user) return null;

  const catName = (id) => categories.find((c) => c.id === id)?.name;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <p className="eyebrow">My Library</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
        Saved prompts
      </h1>
      {ready && prompts.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-line bg-card p-12 text-center shadow-card">
          <p className="font-display text-lg font-bold">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-soft">
            Tap Save on any prompt and it will live here for quick access.
          </p>
          <Link to="/explore" className="btn-ink mt-6">
            Explore prompts
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} categoryName={catName(p.category_id)} />
          ))}
        </div>
      )}
    </div>
  );
}
