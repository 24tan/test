import { CategoryNav } from "@/components/category-nav";
import { WorkCard } from "@/components/work-card";
import { categories, type WorkCategory } from "@/data/works";
import { getSiteSettings } from "@/lib/site-store";
import { getAllWorks } from "@/lib/works-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WorksPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

function toCategory(value?: string): WorkCategory | undefined {
  if (!value) {
    return undefined;
  }

  return categories.find((category) => category === value);
}

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const works = await getAllWorks();
  const activeCategory = toCategory(params?.category);
  const visibleWorks = activeCategory
    ? works.filter((work) => work.category === activeCategory)
    : works;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-9 max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.28em] text-amberline">
          {settings.worksArchiveEyebrow}
        </p>
        <h1 className="text-4xl font-semibold text-bone sm:text-6xl">
          {settings.worksArchiveTitle}
        </h1>
        <p className="text-base leading-7 text-muted sm:text-lg">
          {settings.worksArchiveDescription}
        </p>
      </div>

      <div className="mb-8">
        <CategoryNav activeCategory={activeCategory ?? "全部"} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleWorks.map((work, index) => (
          <WorkCard key={work.slug} work={work} priority={index < 3} />
        ))}
      </div>
    </div>
  );
}
