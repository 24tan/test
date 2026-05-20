import Link from "next/link";
import { getSiteSettings } from "@/lib/site-store";

export async function Header() {
  const settings = await getSiteSettings();
  const navItems = [
    { href: "/", label: settings.navHomeLabel },
    { href: "/works", label: settings.navWorksLabel },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-amberline shadow-[0_0_22px_rgba(201,163,91,0.85)]" />
          <span className="text-sm font-semibold uppercase tracking-[0.26em] text-bone">
            {settings.brandName}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-white/10 hover:text-bone"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
