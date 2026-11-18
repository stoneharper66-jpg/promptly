import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { db } from '@/api/db';
import PromptCard from '@/components/PromptCard';

const SORTS = [
  { id: 'featured', label: 'Featured first' },
  { id: 'popular', label: 'Most popular' },
  { id: 'az', label: 'A to Z' },
  { id: 'free', label: 'Free first' },
];

export default function Explore() {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [sort, setSort] = useState('featured');
  const activeCat = params.get('category') || 'all';

  useEffect(() => {
    db.Category.list().then(setCategories);
    db.Prompt.list().then(setPrompts);
  }, []);

  const catName = (id) => categories.find((c) => c.id === id)?.name;

  const visible = useMemo(() => {
    let rows = [...prompts];
    if (activeCat !== 'all') rows = rows.filter((p) => p.category_id === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category_id.includes(q),
      );
    }
    switch (sort) {
      case 'popular':
        rows.sort((a, b) => Number(b.popular) - Number(a.popular));
        break;
      case 'az':
        rows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'free':
        rows.sort((a, b) => Number(a.premium) - Number(b.premium));
        break;
      default:
        rows.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return rows;
  }, [prompts, activeCat, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <p className="eyebrow">Explore</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        The prompt library
      </h1>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="w-full rounded-2xl border border-line bg-card py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-ink/30"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-line bg-card px-4 py-3.5 text-sm font-medium outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setParams({})}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
            activeCat === 'all' ? 'bg-ink text-white' : 'border border-line bg-card text-soft hover:text-ink'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ category: c.id })}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
              activeCat === c.id ? 'bg-ink text-white' : 'border border-line bg-card text-soft hover:text-ink'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <PromptCard key={p.id} prompt={p} categoryName={catName(p.category_id)} />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="mt-16 text-center text-sm text-soft">
          No prompts match that search.
        </p>
      )}
    </div>
  );
}
