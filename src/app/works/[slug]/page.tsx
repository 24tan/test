import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-store";
import { getAllWorks, getWorkBySlug } from "@/lib/works-store";

type WorkDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const works = await getAllWorks();

  return works.map((work) => ({
    slug: work.slug,
  }));
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const work = await getWorkBySlug(slug);

  if (!work) {
    return {
      title: `作品不存在 | ${settings.brandName}`,
    };
  }

  return {
    title: `${work.title} | ${settings.brandName}`,
    description: work.description,
  };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const work = await getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return (
    <article>
      <section className="relative min-h-[72vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={work.cover}
            alt={work.title}
            className="h-full w-full object-cover opacity-68"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,13,0.95),rgba(8,9,13,0.62),rgba(8,9,13,0.2))]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-end px-5 pb-12 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <Link href="/works" className="text-sm text-muted transition hover:text-bone">
              {settings.detailBackText}
            </Link>
            <p className="inline-flex rounded-full border border-amberline/50 bg-amberline/12 px-4 py-2 text-sm text-amberline">
              {work.category}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-bone sm:text-6xl">
              {work.title}
            </h1>
            <p className="text-lg leading-8 text-bone/78">{work.description}</p>
            {work.videoUrl ? (
              <a
                href={work.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                {settings.detailVideoText}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-amberline">
              {settings.detailNotesEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-bone">
              {settings.detailNotesTitle}
            </h2>
          </div>
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            {work.notes.map((note) => (
              <p key={note} className="text-sm leading-7 text-muted">
                {note}
              </p>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-amberline">
              {settings.detailGalleryEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-bone">
              {settings.detailGalleryTitle}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {work.storyboardImages.map((image, index) => (
              <figure
                key={image}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
              >
                <img
                  src={image}
                  alt={`${work.title} 作品画面 ${index + 1}`}
                  className="aspect-video h-full w-full object-cover"
                />
                <figcaption className="border-t border-white/10 px-4 py-3 text-sm text-muted">
                  {settings.detailImageLabel} {String(index + 1).padStart(2, "0")}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
