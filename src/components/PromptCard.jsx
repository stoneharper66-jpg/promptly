import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import PreviewImage from '@/components/PreviewImage';

export default function PromptCard({ prompt, categoryName }) {
  return (
    <Link
      to={`/prompt/${prompt.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          <PreviewImage prompt={prompt} />
        </div>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {prompt.featured && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
              Featured
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          {prompt.premium ? (
            <span className="flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          ) : (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
              Free
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-soft">
          {categoryName || prompt.category_id}
        </p>
        <h3 className="mt-1 font-display text-[15px] font-bold leading-snug">
          {prompt.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-soft">
          {prompt.description}
        </p>
        <p className="mt-3 text-[11px] font-medium text-soft">
          {prompt.aspect_ratio} · {(prompt.models || []).join(' · ')}
        </p>
      </div>
    </Link>
  );
}
