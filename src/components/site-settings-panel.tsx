"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminUploadControl } from "@/components/admin-upload-control";
import type { SiteSettings } from "@/data/site";

type SiteSettingsPanelProps = {
  adminUsername: string;
  adminPassword: string;
};

type SiteResponse = {
  settings: SiteSettings;
  error?: string;
};

function lines(value: string[]) {
  return value.join("\n");
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function capabilitiesToText(settings: SiteSettings) {
  return settings.capabilities
    .map((item) => `${item.title}｜${item.description}`)
    .join("\n");
}

function resourcesToText(settings: SiteSettings) {
  return settings.resources
    .map((item) => `${item.title}｜${item.description}｜${item.url}`)
    .join("\n");
}

function parseCapabilities(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [title, description] = line.split("｜");
      return {
        title: title?.trim() ?? "",
        description: description?.trim() ?? "",
      };
    })
    .filter((item) => item.title && item.description);
}

function parseResources(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [title, description, url] = line.split("｜");
      return {
        title: title?.trim() ?? "",
        description: description?.trim() ?? "",
        url: url?.trim() ?? "",
      };
    })
    .filter((item) => item.title && item.url);
}

type SettingsForm = Omit<
  SiteSettings,
  "aboutParagraphs" | "capabilities" | "processSteps" | "resources"
> & {
  aboutParagraphs: string;
  capabilities: string;
  processSteps: string;
  resources: string;
};

function toForm(settings: SiteSettings): SettingsForm {
  return {
    ...settings,
    aboutParagraphs: lines(settings.aboutParagraphs),
    capabilities: capabilitiesToText(settings),
    processSteps: lines(settings.processSteps),
    resources: resourcesToText(settings),
  };
}

function fromForm(form: SettingsForm): SiteSettings {
  return {
    ...form,
    aboutParagraphs: splitLines(form.aboutParagraphs),
    capabilities: parseCapabilities(form.capabilities),
    processSteps: splitLines(form.processSteps),
    resources: parseResources(form.resources),
  };
}

export function SiteSettingsPanel({
  adminUsername,
  adminPassword,
}: SiteSettingsPanelProps) {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [status, setStatus] = useState("正在读取站点资料...");
  const [isSaving, setIsSaving] = useState(false);

  async function loadSettings() {
    const response = await fetch("/api/site");
    const data = (await response.json()) as SiteResponse;
    setForm(toForm(data.settings));
    setStatus("可以编辑公开网站上的主要文案。");
  }

  useEffect(() => {
    loadSettings().catch(() => {
      setStatus("站点资料读取失败。");
    });
  }, []);

  function updateField(name: keyof SettingsForm, value: string) {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSaving(true);
    setStatus("正在保存站点资料...");

    try {
      const response = await fetch("/api/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": adminUsername,
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ settings: fromForm(form) }),
      });
      const data = (await response.json()) as SiteResponse;

      if (!response.ok) {
        setStatus(data.error ?? "保存失败。");
        return;
      }

      setForm(toForm(data.settings));
      setStatus("站点资料已保存，刷新前台即可看到更新。");
    } catch {
      setStatus("保存失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  if (!form) {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <p className="text-sm text-muted">{status}</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">
            Site profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">站点资料</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="品牌名" value={form.brandName} onChange={(value) => updateField("brandName", value)} />
          <Field label="身份说明" value={form.siteRole} onChange={(value) => updateField("siteRole", value)} />
          <Field label="SEO 标题" value={form.metadataTitle} onChange={(value) => updateField("metadataTitle", value)} />
          <Field label="联系邮箱" value={form.contactEmail} onChange={(value) => updateField("contactEmail", value)} />
          <Field label="导航：首页" value={form.navHomeLabel} onChange={(value) => updateField("navHomeLabel", value)} />
          <Field label="导航：作品" value={form.navWorksLabel} onChange={(value) => updateField("navWorksLabel", value)} />
          <Field label="导航：后台" value={form.navAdminLabel} onChange={(value) => updateField("navAdminLabel", value)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_12rem]">
          <label className="block text-sm font-semibold text-bone">
            首屏媒体路径
            <input
              value={form.heroMediaUrl}
              onChange={(event) => updateField("heroMediaUrl", event.target.value)}
              placeholder="/uploads/hero.mp4 或 /uploads/hero.png"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition placeholder:text-muted focus:border-amberline/70"
            />
            <AdminUploadControl
              accept="image/*,video/*"
              adminUsername={adminUsername}
              adminPassword={adminPassword}
              buttonLabel="上传首屏媒体"
              onUploaded={(urls) => {
                const url = urls[0] ?? "";
                updateField("heroMediaUrl", url);
                updateField(
                  "heroMediaType",
                  /\.(mp4|webm|mov|m4v)$/i.test(url) ? "video" : "image",
                );
              }}
            />
          </label>
          <label className="block text-sm font-semibold text-bone">
            媒体类型
            <select
              value={form.heroMediaType}
              onChange={(event) => updateField("heroMediaType", event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
            >
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </label>
        </div>
        <TextArea label="SEO 描述" value={form.metadataDescription} rows={3} onChange={(value) => updateField("metadataDescription", value)} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">Homepage</p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">首页文案</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="首屏小标题" value={form.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
          <Field label="主按钮文字" value={form.primaryCta} onChange={(value) => updateField("primaryCta", value)} />
          <Field label="联系按钮文字" value={form.contactCta} onChange={(value) => updateField("contactCta", value)} />
          <Field label="关于我小标题" value={form.aboutEyebrow} onChange={(value) => updateField("aboutEyebrow", value)} />
        </div>
        <TextArea label="首屏介绍" value={form.heroDescription} rows={3} onChange={(value) => updateField("heroDescription", value)} />
        <Field label="关于我标题" value={form.aboutTitle} onChange={(value) => updateField("aboutTitle", value)} />
        <TextArea label="关于我段落，每行一段" value={form.aboutParagraphs} rows={4} onChange={(value) => updateField("aboutParagraphs", value)} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">Sections</p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">模块文案</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="能力区小标题" value={form.capabilitiesEyebrow} onChange={(value) => updateField("capabilitiesEyebrow", value)} />
          <Field label="能力区标题" value={form.capabilitiesTitle} onChange={(value) => updateField("capabilitiesTitle", value)} />
          <Field label="精选区小标题" value={form.selectedEyebrow} onChange={(value) => updateField("selectedEyebrow", value)} />
          <Field label="精选区标题" value={form.selectedTitle} onChange={(value) => updateField("selectedTitle", value)} />
          <Field label="查看全部按钮" value={form.viewAllText} onChange={(value) => updateField("viewAllText", value)} />
          <Field label="分类区标题" value={form.categoryTitle} onChange={(value) => updateField("categoryTitle", value)} />
          <Field label="流程区小标题" value={form.processEyebrow} onChange={(value) => updateField("processEyebrow", value)} />
          <Field label="流程区标题" value={form.processTitle} onChange={(value) => updateField("processTitle", value)} />
        </div>
        <TextArea label="能力方向，每行格式：标题｜描述" value={form.capabilities} rows={4} onChange={(value) => updateField("capabilities", value)} />
        <TextArea label="流程步骤，每行一个" value={form.processSteps} rows={3} onChange={(value) => updateField("processSteps", value)} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">Resources</p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">公开资料区</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="资料区小标题" value={form.resourcesEyebrow} onChange={(value) => updateField("resourcesEyebrow", value)} />
          <Field label="资料区标题" value={form.resourcesTitle} onChange={(value) => updateField("resourcesTitle", value)} />
        </div>
        <TextArea label="资料区说明" value={form.resourcesDescription} rows={3} onChange={(value) => updateField("resourcesDescription", value)} />
        <TextArea label="公开资料，每行格式：标题｜说明｜链接或上传路径" value={form.resources} rows={5} onChange={(value) => updateField("resources", value)} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">Archive</p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">作品列表与详情页</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="作品列表小标题" value={form.worksArchiveEyebrow} onChange={(value) => updateField("worksArchiveEyebrow", value)} />
          <Field label="作品列表标题" value={form.worksArchiveTitle} onChange={(value) => updateField("worksArchiveTitle", value)} />
          <Field label="返回按钮文字" value={form.detailBackText} onChange={(value) => updateField("detailBackText", value)} />
          <Field label="视频按钮文字" value={form.detailVideoText} onChange={(value) => updateField("detailVideoText", value)} />
          <Field label="说明区小标题" value={form.detailNotesEyebrow} onChange={(value) => updateField("detailNotesEyebrow", value)} />
          <Field label="说明区标题" value={form.detailNotesTitle} onChange={(value) => updateField("detailNotesTitle", value)} />
          <Field label="图集区小标题" value={form.detailGalleryEyebrow} onChange={(value) => updateField("detailGalleryEyebrow", value)} />
          <Field label="图集区标题" value={form.detailGalleryTitle} onChange={(value) => updateField("detailGalleryTitle", value)} />
          <Field label="图集编号前缀" value={form.detailImageLabel} onChange={(value) => updateField("detailImageLabel", value)} />
        </div>
        <TextArea label="作品列表说明" value={form.worksArchiveDescription} rows={3} onChange={(value) => updateField("worksArchiveDescription", value)} />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">Contact</p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">联系与页脚</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="联系区小标题" value={form.contactEyebrow} onChange={(value) => updateField("contactEyebrow", value)} />
          <Field label="联系区标题" value={form.contactTitle} onChange={(value) => updateField("contactTitle", value)} />
          <Field label="页脚左侧" value={form.footerLeft} onChange={(value) => updateField("footerLeft", value)} />
          <Field label="页脚右侧" value={form.footerRight} onChange={(value) => updateField("footerRight", value)} />
        </div>
        <TextArea label="联系区说明" value={form.contactDescription} rows={3} onChange={(value) => updateField("contactDescription", value)} />
      </section>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-lg border border-white/10 bg-ink/90 p-4 shadow-cinematic backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{status}</p>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "保存中..." : "保存站点资料"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-bone">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-semibold text-bone">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm leading-6 text-bone outline-none transition focus:border-amberline/70"
      />
    </label>
  );
}
