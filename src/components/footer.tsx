import { getSiteSettings } from "@/lib/site-store";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{settings.footerLeft}</p>
        <p>{settings.footerRight}</p>
      </div>
    </footer>
  );
}
