import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { db, IS_DEMO_DATA } from '@/api/db';
import { base44, BASE44_ENABLED } from '@/api/base44Client';

const EMPTY = {
  id: '',
  category_id: '',
  title: '',
  description: '',
  full_prompt: '',
  aspect_ratio: '4:5',
  models: 'Midjourney v6, DALL-E 3',
  premium: true,
  featured: false,
  popular: false,
  preview_image_url: '',
};

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('prompts');
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [editing, setEditing] = useState(null); // null | prompt-like draft
  const [newCat, setNewCat] = useState({ id: '', name: '', tagline: '' });
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) navigate('/');
  }, [loading, user, navigate]);

  const reload = async () => {
    setPrompts(await db.Prompt.list());
    setCategories(await db.Category.list());
    setMemberships(await db.Membership.list());
    if (BASE44_ENABLED) {
      try {
        setUsers(await base44.entities.User.list());
      } catch {
        setUsers([]);
      }
    } else {
      const raw = localStorage.getItem('promptly_user');
      setUsers(raw ? [JSON.parse(raw)] : []);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') reload();
  }, [user]);

  const catName = (id) => categories.find((c) => c.id === id)?.name || id;

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  /* ----- prompt CRUD ----- */

  const openNew = () =>
    setEditing({ ...EMPTY, category_id: categories[0]?.id || '' });

  const openEdit = async (p) => {
    let full = p.full_prompt || '';
    if (p.premium) {
      const rows = await db.PromptContent.filter({ prompt_id: p.id });
      full = rows[0]?.full_prompt || '';
    }
    setEditing({
      ...p,
      full_prompt: full,
      models: (p.models || []).join(', '),
      preview_image_url: p.preview_image_url || '',
    });
  };

  const saveEditing = async (e) => {
    e.preventDefault();
    const draft = editing;
    const id =
      draft.id ||
      draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const meta = {
      category_id: draft.category_id,
      title: draft.title,
      description: draft.description,
      aspect_ratio: draft.aspect_ratio,
      models: draft.models.split(',').map((m) => m.trim()).filter(Boolean),
      premium: Boolean(draft.premium),
      featured: Boolean(draft.featured),
      popular: Boolean(draft.popular),
      preview_image_url: draft.preview_image_url || null,
      preview: draft.preview || { from: '#26262e', via: '#3a3a44', to: '#101014', icon: 'sparkles' },
      full_prompt: draft.premium ? null : draft.full_prompt,
    };

    const exists = prompts.some((p) => p.id === id);
    if (exists) await db.Prompt.update(id, meta);
    else await db.Prompt.create({ id, ...meta });

    // keep premium body in PromptContent
    const contentRows = await db.PromptContent.filter({ prompt_id: id });
    if (draft.premium) {
      if (contentRows[0]) {
        await db.PromptContent.update(contentRows[0].id, { full_prompt: draft.full_prompt });
      } else {
        await db.PromptContent.create({ prompt_id: id, full_prompt: draft.full_prompt });
      }
    } else if (contentRows[0]) {
      await db.PromptContent.remove(contentRows[0].id);
    }

    setEditing(null);
    await reload();
    flash(exists ? 'Prompt updated' : 'Prompt created');
  };

  const deletePrompt = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await db.Prompt.remove(p.id);
    const contentRows = await db.PromptContent.filter({ prompt_id: p.id });
    for (const r of contentRows) await db.PromptContent.remove(r.id);
    await reload();
    flash('Prompt deleted');
  };

  const toggleFeatured = async (p) => {
    await db.Prompt.update(p.id, { featured: !p.featured });
    await reload();
  };

  /* ----- category CRUD ----- */

  const addCategory = async (e) => {
    e.preventDefault();
    const id = newCat.id || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await db.Category.create({
      id,
      number: String(categories.length + 1).padStart(2, '0'),
      name: newCat.name,
      tagline: newCat.tagline,
      description: newCat.tagline,
      accent: '#26262e',
    });
    setNewCat({ id: '', name: '', tagline: '' });
    await reload();
    flash('Category created');
  };

  const stats = useMemo(
    () => ({
      total: prompts.length,
      premium: prompts.filter((p) => p.premium).length,
      featured: prompts.filter((p) => p.featured).length,
      activeMembers: memberships.filter((m) => m.status === 'active').length,
    }),
    [prompts, memberships],
  );

  if (!user || user.role !== 'admin') return null;

  const input =
    'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink/30';

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            Marketplace control
          </h1>
        </div>
        <div className="flex gap-6 text-sm">
          <div><span className="font-display text-2xl font-extrabold">{stats.total}</span> <span className="text-soft">prompts</span></div>
          <div><span className="font-display text-2xl font-extrabold">{stats.premium}</span> <span className="text-soft">premium</span></div>
          <div><span className="font-display text-2xl font-extrabold">{stats.featured}</span> <span className="text-soft">featured</span></div>
          <div><span className="font-display text-2xl font-extrabold">{stats.activeMembers}</span> <span className="text-soft">members</span></div>
        </div>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white">
          {notice}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-2">
        {['prompts', 'categories', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold capitalize ${
              tab === t ? 'bg-ink text-white' : 'border border-line bg-card text-soft'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---- Prompts tab ---- */}
      {tab === 'prompts' && (
        <div className="mt-6">
          <button onClick={openNew} className="btn-ink !py-2.5 text-sm">
            <Plus className="h-4 w-4" /> New prompt
          </button>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-soft">
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Tier</th>
                  <th className="px-5 py-3.5">Featured</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prompts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium">{p.title}</td>
                    <td className="px-5 py-3 text-soft">{catName(p.category_id)}</td>
                    <td className="px-5 py-3">{p.premium ? 'Premium' : 'Free'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleFeatured(p)}
                        title="Toggle featured"
                        className={p.featured ? 'text-ink' : 'text-line'}
                      >
                        <Star className="h-4 w-4" fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(p)} className="text-soft hover:text-ink">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deletePrompt(p)} className="text-soft hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Categories tab ---- */}
      {tab === 'categories' && (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card">
            <ul className="divide-y divide-line">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="font-medium">{c.number} — {c.name}</span>
                  <span className="text-soft">
                    {prompts.filter((p) => p.category_id === c.id).length} prompts
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={addCategory} className="h-fit rounded-2xl border border-line bg-card p-6">
            <h3 className="font-display text-lg font-bold">New category</h3>
            <div className="mt-4 space-y-3">
              <input className={input} placeholder="Name" required value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
              <input className={input} placeholder="Tagline" required value={newCat.tagline} onChange={(e) => setNewCat({ ...newCat, tagline: e.target.value })} />
              <button type="submit" className="btn-ink !py-2.5 text-sm">
                <Plus className="h-4 w-4" /> Add category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Users tab ---- */}
      {tab === 'users' && (
        <div className="mt-6">
          {IS_DEMO_DATA && (
            <p className="mb-4 text-sm text-soft">
              Demo mode shows only the locally signed-in user. After Base44
              import, this table lists every registered user.
            </p>
          )}
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-soft">
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id || u.email}>
                    <td className="px-5 py-3 font-medium">{u.full_name || '—'}</td>
                    <td className="px-5 py-3 text-soft">{u.email}</td>
                    <td className="px-5 py-3 capitalize">{u.role || 'user'}</td>
                    <td className="px-5 py-3">{u.has_premium ? 'Premium' : 'Free'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-soft">
                      No users to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Edit drawer ---- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-10">
          <form
            onSubmit={saveEditing}
            className="w-full max-w-2xl rounded-3xl border border-line bg-white p-7 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">
                {editing.id ? 'Edit prompt' : 'New prompt'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="text-soft hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input className={input} placeholder="Title" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <select className={input} value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input className={`${input} sm:col-span-2`} placeholder="Short description" required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <textarea className={`${input} sm:col-span-2`} rows={6} placeholder="Full prompt text" required value={editing.full_prompt} onChange={(e) => setEditing({ ...editing, full_prompt: e.target.value })} />
              <select className={input} value={editing.aspect_ratio} onChange={(e) => setEditing({ ...editing, aspect_ratio: e.target.value })}>
                {['9:16', '4:5', '1:1', '3:2', '16:9'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <input className={input} placeholder="Models (comma separated)" value={editing.models} onChange={(e) => setEditing({ ...editing, models: e.target.value })} />
              <input className={`${input} sm:col-span-2`} placeholder="Preview image URL (optional — upload via Base44 files)" value={editing.preview_image_url} onChange={(e) => setEditing({ ...editing, preview_image_url: e.target.value })} />
            </div>

            <div className="mt-4 flex gap-6 text-sm">
              {['premium', 'featured', 'popular'].map((flag) => (
                <label key={flag} className="flex items-center gap-2 font-medium capitalize">
                  <input
                    type="checkbox"
                    checked={Boolean(editing[flag])}
                    onChange={(e) => setEditing({ ...editing, [flag]: e.target.checked })}
                  />
                  {flag}
                </label>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" className="btn-ink">Save prompt</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
