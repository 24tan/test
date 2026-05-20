import { promises as fs } from "fs";
import path from "path";
import { categories, works as defaultWorks, type Work, type WorkCategory } from "@/data/works";
import { assertRedis, getRedis, parseRedisJson } from "@/lib/redis";

const worksFile = path.join(process.cwd(), "content", "works.json");
const worksKey = "works:all";

function isCategory(value: string): value is WorkCategory {
  return categories.some((category) => category === value);
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `work-${Date.now()}`;
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeWork(input: Partial<Work>, fallbackSlug?: string): Work {
  const title = String(input.title ?? "").trim();
  const category = String(input.category ?? categories[0]);
  const cover = String(input.cover ?? "").trim();
  const description = String(input.description ?? "").trim();
  const videoUrl = String(input.videoUrl ?? "").trim();

  if (!title) {
    throw new Error("请填写作品标题。");
  }

  if (!isCategory(category)) {
    throw new Error("请选择有效的作品分类。");
  }

  if (!description) {
    throw new Error("请填写作品简介。");
  }

  if (!cover) {
    throw new Error("请填写或选择作品封面。");
  }

  const slug = String(input.slug ?? fallbackSlug ?? toSlug(title)).trim() || toSlug(title);

  return {
    slug: toSlug(slug),
    title,
    category,
    description,
    cover,
    featured: Boolean(input.featured),
    videoUrl: videoUrl || undefined,
    storyboardImages: normalizeList(input.storyboardImages),
    notes: normalizeList(input.notes),
  };
}

async function readWorksFile() {
  try {
    const raw = await fs.readFile(worksFile, "utf-8");
    const parsed = JSON.parse(raw) as Work[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((work) => normalizeWork(work, work.slug));
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      console.warn("Failed to read works file:", error);
    }
  }

  return defaultWorks;
}

export async function getAllWorks() {
  const redis = getRedis();

  if (redis) {
    try {
      const stored = parseRedisJson<Work[]>(await redis.get(worksKey));

      if (Array.isArray(stored)) {
        return stored.map((work) => normalizeWork(work, work.slug));
      }
    } catch (error) {
      console.warn("Failed to read works from Redis:", error);
    }
  }

  return readWorksFile();
}

export async function getWorkBySlug(slug: string) {
  const works = await getAllWorks();
  return works.find((work) => work.slug === slug);
}

export async function saveAllWorks(works: Work[]) {
  const normalizedWorks = works.map((work) => normalizeWork(work, work.slug));
  await assertRedis().set(worksKey, normalizedWorks);
}

export async function upsertWork(input: Partial<Work>, originalSlug?: string) {
  const works = await getAllWorks();
  const work = normalizeWork(input, originalSlug);
  const targetSlug = originalSlug || work.slug;
  const existingIndex = works.findIndex((item) => item.slug === targetSlug);
  const duplicate = works.find((item) => item.slug === work.slug && item.slug !== targetSlug);

  if (duplicate) {
    throw new Error("这个作品路径已经存在，请换一个路径。");
  }

  if (existingIndex >= 0) {
    works[existingIndex] = work;
  } else {
    works.unshift(work);
  }

  await saveAllWorks(works);
  return work;
}

export async function deleteWork(slug: string) {
  const works = await getAllWorks();
  const nextWorks = works.filter((work) => work.slug !== slug);

  if (nextWorks.length === works.length) {
    throw new Error("作品不存在。");
  }

  await saveAllWorks(nextWorks);
}
