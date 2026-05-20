import { promises as fs } from "fs";
import path from "path";
import {
  defaultSiteSettings,
  type Capability,
  type ResourceLink,
  type SiteSettings,
} from "@/data/site";

const settingsFile = path.join(process.cwd(), "content", "site.json");

function text(value: unknown, fallback: string) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function textList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const list = value.map(String).map((item) => item.trim()).filter(Boolean);
    return list.length > 0 ? list : fallback;
  }

  if (typeof value === "string") {
    const list = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    return list.length > 0 ? list : fallback;
  }

  return fallback;
}

function mediaType(value: unknown, fallback: "image" | "video") {
  return value === "video" ? "video" : value === "image" ? "image" : fallback;
}

function capabilityList(value: unknown, fallback: Capability[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const list = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }

      const capability = item as Partial<Capability>;
      const title = String(capability.title ?? "").trim();
      const description = String(capability.description ?? "").trim();

      return title && description ? { title, description } : undefined;
    })
    .filter((item): item is Capability => Boolean(item));

  return list.length > 0 ? list : fallback;
}

function resourceList(value: unknown, fallback: ResourceLink[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const list = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }

      const resource = item as Partial<ResourceLink>;
      const title = String(resource.title ?? "").trim();
      const description = String(resource.description ?? "").trim();
      const url = String(resource.url ?? "").trim();

      return title && url ? { title, description, url } : undefined;
    })
    .filter((item): item is ResourceLink => Boolean(item));

  return list.length > 0 ? list : fallback;
}

export function normalizeSiteSettings(input: Partial<SiteSettings>): SiteSettings {
  return {
    brandName: text(input.brandName, defaultSiteSettings.brandName),
    siteRole: text(input.siteRole, defaultSiteSettings.siteRole),
    metadataTitle: text(input.metadataTitle, defaultSiteSettings.metadataTitle),
    metadataDescription: text(
      input.metadataDescription,
      defaultSiteSettings.metadataDescription,
    ),
    navHomeLabel: text(input.navHomeLabel, defaultSiteSettings.navHomeLabel),
    navWorksLabel: text(input.navWorksLabel, defaultSiteSettings.navWorksLabel),
    navAdminLabel: text(input.navAdminLabel, defaultSiteSettings.navAdminLabel),
    heroEyebrow: text(input.heroEyebrow, defaultSiteSettings.heroEyebrow),
    heroDescription: text(input.heroDescription, defaultSiteSettings.heroDescription),
    heroMediaUrl: text(input.heroMediaUrl, defaultSiteSettings.heroMediaUrl),
    heroMediaType: mediaType(input.heroMediaType, defaultSiteSettings.heroMediaType),
    primaryCta: text(input.primaryCta, defaultSiteSettings.primaryCta),
    contactCta: text(input.contactCta, defaultSiteSettings.contactCta),
    aboutEyebrow: text(input.aboutEyebrow, defaultSiteSettings.aboutEyebrow),
    aboutTitle: text(input.aboutTitle, defaultSiteSettings.aboutTitle),
    aboutParagraphs: textList(
      input.aboutParagraphs,
      defaultSiteSettings.aboutParagraphs,
    ),
    capabilitiesEyebrow: text(
      input.capabilitiesEyebrow,
      defaultSiteSettings.capabilitiesEyebrow,
    ),
    capabilitiesTitle: text(
      input.capabilitiesTitle,
      defaultSiteSettings.capabilitiesTitle,
    ),
    capabilities: capabilityList(input.capabilities, defaultSiteSettings.capabilities),
    selectedEyebrow: text(input.selectedEyebrow, defaultSiteSettings.selectedEyebrow),
    selectedTitle: text(input.selectedTitle, defaultSiteSettings.selectedTitle),
    viewAllText: text(input.viewAllText, defaultSiteSettings.viewAllText),
    processEyebrow: text(input.processEyebrow, defaultSiteSettings.processEyebrow),
    processTitle: text(input.processTitle, defaultSiteSettings.processTitle),
    processSteps: textList(input.processSteps, defaultSiteSettings.processSteps),
    resourcesEyebrow: text(
      input.resourcesEyebrow,
      defaultSiteSettings.resourcesEyebrow,
    ),
    resourcesTitle: text(input.resourcesTitle, defaultSiteSettings.resourcesTitle),
    resourcesDescription: text(
      input.resourcesDescription,
      defaultSiteSettings.resourcesDescription,
    ),
    resources: resourceList(input.resources, defaultSiteSettings.resources),
    categoryTitle: text(input.categoryTitle, defaultSiteSettings.categoryTitle),
    contactEyebrow: text(input.contactEyebrow, defaultSiteSettings.contactEyebrow),
    contactTitle: text(input.contactTitle, defaultSiteSettings.contactTitle),
    contactDescription: text(
      input.contactDescription,
      defaultSiteSettings.contactDescription,
    ),
    contactEmail: text(input.contactEmail, defaultSiteSettings.contactEmail),
    footerLeft: text(input.footerLeft, defaultSiteSettings.footerLeft),
    footerRight: text(input.footerRight, defaultSiteSettings.footerRight),
    worksArchiveEyebrow: text(
      input.worksArchiveEyebrow,
      defaultSiteSettings.worksArchiveEyebrow,
    ),
    worksArchiveTitle: text(
      input.worksArchiveTitle,
      defaultSiteSettings.worksArchiveTitle,
    ),
    worksArchiveDescription: text(
      input.worksArchiveDescription,
      defaultSiteSettings.worksArchiveDescription,
    ),
    detailBackText: text(input.detailBackText, defaultSiteSettings.detailBackText),
    detailVideoText: text(input.detailVideoText, defaultSiteSettings.detailVideoText),
    detailNotesEyebrow: text(
      input.detailNotesEyebrow,
      defaultSiteSettings.detailNotesEyebrow,
    ),
    detailNotesTitle: text(
      input.detailNotesTitle,
      defaultSiteSettings.detailNotesTitle,
    ),
    detailGalleryEyebrow: text(
      input.detailGalleryEyebrow,
      defaultSiteSettings.detailGalleryEyebrow,
    ),
    detailGalleryTitle: text(
      input.detailGalleryTitle,
      defaultSiteSettings.detailGalleryTitle,
    ),
    detailImageLabel: text(input.detailImageLabel, defaultSiteSettings.detailImageLabel),
  };
}

export async function getSiteSettings() {
  try {
    const raw = await fs.readFile(settingsFile, "utf-8");
    return normalizeSiteSettings(JSON.parse(raw) as Partial<SiteSettings>);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      console.warn("Failed to read site settings:", error);
    }

    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(input: Partial<SiteSettings>) {
  const settings = normalizeSiteSettings(input);
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });
  await fs.writeFile(settingsFile, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
  return settings;
}
