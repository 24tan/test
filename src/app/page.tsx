import Link from "next/link";
import { getSiteSettings } from "@/lib/site-store";
import { getAllWorks } from "@/lib/works-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isVideoMedia(url: string, type: "image" | "video") {
  return type === "video" || /\.(mp4|webm|mov|m4v)$/i.test(url);
}

export default async function Home() {
  const settings = await getSiteSettings();
  const works = await getAllWorks();
  const featuredWorks = works.filter((work) => work.featured);
  const mainWork = featuredWorks[0] ?? works[0];
  const secondaryWorks = mainWork
    ? works.filter((work) => work.slug !== mainWork.slug).slice(0, 3)
    : works.slice(0, 3);
  const heroMedia = settings.heroMediaUrl || mainWork?.cover;
  const useVideoHero = heroMedia ? isVideoMedia(heroMedia, settings.heroMediaType) : false;

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-white/10 bg-ink">
        {heroMedia ? (
          useVideoHero ? (
            <video
              src={heroMedia}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover opacity-54"
            />
          ) : (
            <img
              src={heroMedia}
              alt={settings.brandName}
              className="absolute inset-0 h-full w-full object-cover opacity-54"
            />
          )
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,13,0.98)_0%,rgba(8,9,13,0.86)_42%,rgba(8,9,13,0.48)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/72 to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-end px-5 pb-14 pt-24 sm:px-8 lg:pb-16">
          <div className="max-w-4xl">
            <p className="max-w-2xl text-sm font-medium uppercase tracking-[0.34em] text-amberline">
              {settings.heroEyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] text-bone sm:text-7xl lg:text-8xl">
              {settings.brandName}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-bone/76 sm:text-xl">
              {settings.heroDescription}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/works"
                className="inline-flex items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                {settings.primaryCta}
              </Link>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center justify-center rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-bone transition hover:border-white/35 hover:bg-white/[0.06]"
              >
                {settings.contactCta}
              </a>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            {mainWork ? (
              <Link
                href={`/works/${mainWork.slug}`}
                className="mt-14 grid w-full grid-cols-[1fr_auto] items-end gap-6 border-t border-white/12 pt-5 text-bone transition hover:border-amberline/45"
              >
                <div>
                  <p className="text-sm text-amberline">{mainWork.category}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{mainWork.title}</h2>
                </div>
                <span className="text-sm text-muted transition hover:text-bone">查看主推</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amberline">
            {settings.aboutEyebrow}
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-bone sm:text-5xl">
            {settings.aboutTitle}
          </h2>
        </div>
        <div className="grid gap-8">
          <div className="space-y-5 text-base leading-8 text-muted sm:text-lg">
            {settings.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="grid border-y border-white/10 sm:grid-cols-3">
            {settings.capabilities.slice(0, 3).map((item) => (
              <div key={item.title} className="border-t border-white/10 py-5 sm:border-l sm:border-t-0 sm:px-5 first:sm:border-l-0">
                <h3 className="text-lg font-semibold text-bone">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amberline">
                {settings.selectedEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-bone sm:text-4xl">
                {settings.selectedTitle}
              </h2>
            </div>
            <Link href="/works" className="text-sm text-muted transition hover:text-bone">
              {settings.viewAllText}
            </Link>
          </div>
        <div className="grid gap-6 md:grid-cols-3">
          {secondaryWorks.map((work) => (
            <Link key={work.slug} href={`/works/${work.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-smoke">
                <img
                  src={work.cover}
                  alt={work.title}
                  className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm text-amberline">{work.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-bone">{work.title}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                  {work.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amberline">
            {settings.resourcesEyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-bone">
            {settings.resourcesTitle}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            {settings.resourcesDescription}
          </p>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {settings.resources.map((resource) => (
            <a
              key={`${resource.title}-${resource.url}`}
              href={resource.url}
              target={resource.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={resource.url.startsWith("mailto:") ? undefined : "noreferrer"}
              className="group grid gap-3 py-5 transition sm:grid-cols-[13rem_1fr_auto]"
            >
              <h3 className="text-lg font-semibold text-bone">{resource.title}</h3>
              <p className="text-sm leading-7 text-muted">{resource.description}</p>
              <span className="text-sm text-amberline transition group-hover:translate-x-1">
                打开
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amberline">
              {settings.contactEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-bone sm:text-4xl">
              {settings.contactTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              {settings.contactDescription}
            </p>
          </div>
          <div className="flex lg:justify-end">
            <a
              href={`mailto:${settings.contactEmail}`}
              className="inline-flex items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              {settings.contactEmail}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
