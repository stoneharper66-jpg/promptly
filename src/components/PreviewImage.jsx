import {
  Banknote,
  Building2,
  Car,
  GlassWater,
  Home,
  Laptop,
  Plane,
  Ship,
  Shirt,
  Sparkles,
  Watch,
  Waves,
} from 'lucide-react';

const ICONS = {
  building: Building2,
  car: Car,
  plane: Plane,
  ship: Ship,
  watch: Watch,
  shirt: Shirt,
  home: Home,
  pool: Waves,
  laptop: Laptop,
  banknote: Banknote,
  martini: GlassWater,
  sparkles: Sparkles,
};

// Generated preview artwork (no external image URLs → nothing can break).
// When a prompt has preview_image_url set (via the admin dashboard /
// Base44 file upload), the real image replaces the generated artwork.
export default function PreviewImage({ prompt, className = '' }) {
  const Icon = ICONS[prompt.preview?.icon] ?? Sparkles;
  const { from = '#1c1c22', via = '#30303a', to = '#0c0c10' } = prompt.preview || {};

  if (prompt.preview_image_url) {
    return (
      <img
        src={prompt.preview_image_url}
        alt={prompt.title}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(150deg, ${from}, ${via} 52%, ${to})` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 30% 20%, rgba(255,255,255,0.14), transparent 60%)',
        }}
      />
      <Icon className="relative h-8 w-8 text-white/70" strokeWidth={1.5} />
    </div>
  );
}
