"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AdminUploadControl } from "@/components/admin-upload-control";
import type { Work, WorkCategory } from "@/data/works";

type WorksResponse = {
  categories: readonly WorkCategory[];
  works: Work[];
};

const emptyWork: Work = {
  slug: "",
  title: "",
  category: "AI漫剧",
  description: "",
  cover: "",
  featured: false,
  videoUrl: "",
  storyboardImages: [],
  notes: [],
};

function joinLines(value: string[]) {
  return value.join("\n");
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(work: Work) {
  return {
    ...work,
    videoUrl: work.videoUrl ?? "",
    storyboardImages: joinLines(work.storyboardImages),
    notes: joinLines(work.notes),
  };
}

type WorkForm = ReturnType<typeof toForm>;

type WorksPanelProps = {
  adminUsername: string;
  adminPassword: string;
};

export function WorksPanel({ adminUsername, adminPassword }: WorksPanelProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<readonly WorkCategory[]>([]);
  const [form, setForm] = useState<WorkForm>(toForm(emptyWork));
  const [originalSlug, setOriginalSlug] = useState("");
  const [status, setStatus] = useState("可以新增作品，或点击右侧作品进行编辑。");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(originalSlug);
  const sortedWorks = useMemo(() => works, [works]);

  async function loadWorks() {
    const response = await fetch("/api/works");
    const data = (await response.json()) as WorksResponse;
    setCategories(data.categories);
    setWorks(data.works);

    if (!form.category && data.categories[0]) {
      setForm((current) => ({ ...current, category: data.categories[0] }));
    }
  }

  useEffect(() => {
    loadWorks().catch(() => {
      setStatus("作品库读取失败，请稍后重试。");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(name: keyof WorkForm, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function editWork(work: Work) {
    setOriginalSlug(work.slug);
    setForm(toForm(work));
    setStatus(`正在编辑：${work.title}`);
  }

  function resetForm() {
    setOriginalSlug("");
    setForm(toForm({ ...emptyWork, category: categories[0] ?? "AI漫剧" }));
    setStatus("已切换到新增作品。");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("正在保存作品...");

    const work = {
      ...form,
      storyboardImages: splitLines(form.storyboardImages),
      notes: splitLines(form.notes),
    };

    try {
      const response = await fetch("/api/works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": adminUsername,
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ work, originalSlug: originalSlug || undefined }),
      });
      const data = (await response.json()) as { work?: Work; error?: string };

      if (!response.ok || !data.work) {
        setStatus(data.error ?? "保存失败。");
        return;
      }

      setOriginalSlug(data.work.slug);
      setForm(toForm(data.work));
      setStatus(`已保存：${data.work.title}`);
      await loadWorks();
    } catch {
      setStatus("保存失败，请检查内容后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeWork(slug: string) {
    setStatus("正在删除作品...");

    try {
      const response = await fetch(`/api/works?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: {
          "x-admin-username": adminUsername,
          "x-admin-password": adminPassword,
        },
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(data.error ?? "删除失败。");
        return;
      }

      resetForm();
      await loadWorks();
      setStatus("作品已删除。");
    } catch {
      setStatus("删除失败，请稍后重试。");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-white/[0.04] p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amberline">
              Works editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-bone">
              {isEditing ? "编辑作品" : "新增作品"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-bone"
          >
            新建
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-bone">
            标题
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
            />
          </label>
          <label className="block text-sm font-semibold text-bone">
            路径 slug
            <input
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="留空会按标题生成"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition placeholder:text-muted focus:border-amberline/70"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-bone">
            分类
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-semibold text-bone">
          简介
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm leading-6 text-bone outline-none transition focus:border-amberline/70"
          />
        </label>

        <PathField
          label="封面路径"
          value={form.cover}
          placeholder="/uploads/your-image.png"
          onChange={(value) => updateField("cover", value)}
        >
          <AdminUploadControl
            accept="image/*"
            adminUsername={adminUsername}
            adminPassword={adminPassword}
            buttonLabel="上传封面"
            onUploaded={(urls) => updateField("cover", urls[0] ?? "")}
          />
        </PathField>

        <PathField
          label="视频链接或上传视频路径"
          value={form.videoUrl}
          placeholder="/uploads/your-video.mp4 或外部链接"
          onChange={(value) => updateField("videoUrl", value)}
        >
          <AdminUploadControl
            accept="video/*"
            adminUsername={adminUsername}
            adminPassword={adminPassword}
            buttonLabel="上传视频"
            onUploaded={(urls) => updateField("videoUrl", urls[0] ?? "")}
          />
        </PathField>

        <label className="block text-sm font-semibold text-bone">
          图集路径，每行一个
          <textarea
            value={form.storyboardImages}
            onChange={(event) => updateField("storyboardImages", event.target.value)}
            rows={4}
            placeholder="/uploads/shot-01.png"
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm leading-6 text-bone outline-none transition placeholder:text-muted focus:border-amberline/70"
          />
          <AdminUploadControl
            accept="image/*"
            multiple
            adminUsername={adminUsername}
            adminPassword={adminPassword}
            buttonLabel="上传图集图片"
            onUploaded={(urls) => {
              const current = form.storyboardImages.trim();
              updateField(
                "storyboardImages",
                [current, urls.join("\n")].filter(Boolean).join("\n"),
              );
            }}
          />
        </label>

        <label className="block text-sm font-semibold text-bone">
          创作说明，每行一条
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm leading-6 text-bone outline-none transition focus:border-amberline/70"
          />
        </label>

        <label className="flex items-center gap-3 text-sm font-semibold text-bone">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => updateField("featured", event.target.checked)}
            className="h-4 w-4 accent-amberline"
          />
          设为首页主推
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "保存中..." : "保存作品"}
        </button>

        <p className="rounded-lg border border-white/10 bg-ink/55 p-4 text-sm leading-6 text-muted">
          {status}
        </p>
      </form>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amberline">
              Works library
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-bone">作品列表</h2>
          </div>
          <span className="text-sm text-muted">{sortedWorks.length} 个作品</span>
        </div>

        <div className="space-y-3">
          {sortedWorks.map((work) => (
            <article
              key={work.slug}
              className="grid gap-4 rounded-lg border border-white/10 bg-ink/55 p-4 sm:grid-cols-[8rem_1fr]"
            >
              <img
                src={work.cover}
                alt={work.title}
                className="aspect-video w-full rounded-md object-cover"
              />
              <div>
                <p className="text-xs text-amberline">{work.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-bone">{work.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {work.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editWork(work)}
                    className="rounded-full bg-bone px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWork(work.slug)}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-bone"
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PathField({
  children,
  label,
  onChange,
  placeholder,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-bone">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition placeholder:text-muted focus:border-amberline/70"
      />
      {children}
    </label>
  );
}
