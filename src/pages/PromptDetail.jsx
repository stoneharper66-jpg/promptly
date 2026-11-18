import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Lock } from 'lucide-react';
import { db } from '@/api/db';
import { useAuth } from '@/lib/AuthContext';
import { getFullPrompt, recordView } from '@/lib/access';
import CopyButton from '@/components/CopyButton';
import PreviewImage from '@/components/PreviewImage';
import PromptCard from '@/components/PromptCard';

export default function PromptDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [category, setCategory] = useState(null);
  const [fullPrompt, setFullPrompt] = useState(null);
  const [related, setRelated] = useState([]);
  const [saved, setSaved] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await db.Prompt.get(id);
      if (!alive) return;
      setPrompt(p);
      setLoaded(true);
      if (!p) return;
      db.Category.get(p.category_id).then((c) => alive && setCategory(c));
      db.Prompt.filter({ category_id: p.category_id }).then(
        (rows) => alive && setRelated(rows.filter((r) => r.id !== p.id).slice(0, 3)),
      );
      const text = await getFullPrompt(p, user);
      if (alive) setFullPrompt(text);
      recordView(p, user);
      if (user) {
        const existing = await db.SavedPrompt.filter({ user_id: user.id, prompt_id: p.id });
        if (alive) setSaved(existing[0] || null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, user]);

  if (loaded && !prompt) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Prompt not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-sm font-semibold underline">
          Back to Explore
        </Link>
      </div>
    );
  }
  if (!prompt) return null;

  const locked = prompt.premium && !fullPrompt;

  const toggleSave = async () => {
    if (!user) return;
    if (saved) {
      await db.SavedPrompt.remove(saved.id);
      setSaved(null);
    } else {
      const row = await db.SavedPrompt.create({
        user_id: user.id,
        prompt_id: prompt.id,
        saved_at: new Date().toISOString(),
      });
      setSaved(row);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <Link
        to={`/category/${prompt.category_id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {category?.name || 'Back'}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Preview */}
        <div className="overflow-hidden rounded-3xl border border-line shadow-card">
          <div className="aspect-[4/3]">
            <PreviewImage prompt={prompt} />
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-line bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-soft">
              {category?.name}
            </span>
            {prompt.premium ? (
              <span className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Lock className="h-3 w-3" /> Premium
              </span>
            ) : (
              <span className="rounded-full border border-line bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-soft">
                Free
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {prompt.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-soft">{prompt.description}</p>

          <div className="mt-5 flex gap-6 text-sm">
            <div>
              <p className="eyebrow">Aspect ratio</p>
              <p className="mt-1 font-semibold">{prompt.aspect_ratio}</p>
            </div>
            <div>
              <p className="eyebrow">Works with</p>
              <p className="mt-1 font-semibold">{(prompt.models || []).join(', ')}</p>
            </div>
          </div>

          {/* Prompt body */}
          <div className="mt-7 rounded-2xl border border-line bg-card p-6 shadow-card">
            {locked ? (
              <div className="text-center">
                <Lock className="mx-auto h-6 w-6 text-soft" />
                <h3 className="mt-3 font-display text-lg font-bold">
                  This prompt is for members
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-soft">
                  Unlock the full library — every premium prompt, copy-ready —
                  with a Promptly membership.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link to="/pricing" className="btn-ink">
                    Unlock with membership
                  </Link>
                  {!user && (
                    <Link to="/auth" className="btn-ghost">
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="eyebrow mb-3">The prompt</p>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                  {fullPrompt}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <CopyButton text={fullPrompt} />
                  {user && (
                    <button onClick={toggleSave} className="btn-ghost !px-4">
                      {saved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4" /> Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" /> Save
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-xl font-extrabold tracking-tight">
            More from {category?.name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PromptCard key={p.id} prompt={p} categoryName={category?.name} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
