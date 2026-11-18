import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/api/db';
import PromptCard from '@/components/PromptCard';

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    db.Category.get(id).then(setCategory);
    db.Prompt.filter({ category_id: id }).then((rows) => {
      setPrompts(rows);
      setLoaded(true);
    });
  }, [id]);

  if (loaded && !category) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Category not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-sm font-semibold text-ink underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        All categories
      </Link>
      {category && (
        <>
          <p className="eyebrow mt-6">{category.number}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-soft sm:text-base">
            {category.description}
          </p>
        </>
      )}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => (
          <PromptCard key={p.id} prompt={p} categoryName={category?.name} />
        ))}
      </div>
    </div>
  );
}
