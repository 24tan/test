import Link from "next/link";
import type { Work } from "@/data/works";

type WorkCardProps = {
  work: Work;
  priority?: boolean;
};

export function WorkCard({ work, priority = false }: WorkCardProps) {
  return (
    <Link
      href={`/works/${work.slug}`}
      className="group block overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-cinematic transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
    >
      <div className="film-frame aspect-[4/3] bg-smoke">
        <img
          src={work.cover}
          alt={work.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-ink/70 px-3 py-1 text-xs text-bone backdrop-blur">
          {work.category}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-semibold text-bone">{work.title}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {work.description}
        </p>
      </div>
    </Link>
  );
}
