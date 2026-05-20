import Link from "next/link";
import { categories, type WorkCategory } from "@/data/works";

type CategoryNavProps = {
  activeCategory?: WorkCategory | "全部";
};

export function CategoryNav({ activeCategory = "全部" }: CategoryNavProps) {
  const items = ["全部", ...categories] as const;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((category) => {
        const isActive = activeCategory === category;
        const href =
          category === "全部"
            ? "/works"
            : `/works?category=${encodeURIComponent(category)}`;

        return (
          <Link
            key={category}
            href={href}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              isActive
                ? "border-amberline bg-amberline text-ink"
                : "border-white/12 bg-white/[0.04] text-muted hover:border-white/30 hover:text-bone"
            }`}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
