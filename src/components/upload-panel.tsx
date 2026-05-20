"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UploadedMedia = {
  name: string;
  url: string;
  type: "image" | "video" | "file";
  size: number;
  updatedAt?: string;
  originalName?: string;
};

function formatSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

type UploadPanelProps = {
  adminUsername: string;
  adminPassword: string;
};

export function UploadPanel({ adminUsername, adminPassword }: UploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [status, setStatus] = useState("等待选择图片或视频。");
  const [isUploading, setIsUploading] = useState(false);

  const fileSummary = useMemo(() => {
    if (files.length === 0) {
      return "支持图片、视频、PDF、文档和资料包，可多选上传。";
    }

    return files.map((file) => `${file.name} (${formatSize(file.size)})`).join(" / ");
  }, [files]);

  async function loadMedia() {
    const response = await fetch("/api/uploads", {
      headers: {
        "x-admin-username": adminUsername,
        "x-admin-password": adminPassword,
      },
    });
    const data = (await response.json()) as { media?: UploadedMedia[]; error?: string };

    if (!response.ok) {
      setStatus(data.error ?? "媒体库读取失败。");
      return;
    }

    setMedia(data.media ?? []);
  }

  useEffect(() => {
    loadMedia().catch(() => {
      setStatus("媒体库读取失败，请稍后重试。");
    });
  }, [adminPassword, adminUsername]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (files.length === 0) {
      setStatus("请先选择要上传的图片或视频。");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    setIsUploading(true);
    setStatus("正在上传...");

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "x-admin-username": adminUsername,
          "x-admin-password": adminPassword,
        },
        body: formData,
      });
      const data = (await response.json()) as {
        uploaded?: UploadedMedia[];
        error?: string;
      };

      if (!response.ok) {
        setStatus(data.error ?? "上传失败。");
        return;
      }

      setFiles([]);
      setStatus(
        `上传成功：${data.uploaded?.map((item) => item.url).join(" / ") ?? ""}`,
      );
      await loadMedia();
    } catch {
      setStatus("上传失败，请检查文件大小或稍后重试。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-white/[0.04] p-5"
      >
        <div>
          <label className="block text-sm font-semibold text-bone" htmlFor="media">
            选择素材
          </label>
          <input
            id="media"
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.rar,.7z"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="mt-3 block w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-bone file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
          />
          <p className="mt-3 text-sm leading-6 text-muted">{fileSummary}</p>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex w-full items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isUploading ? "上传中..." : "上传到媒体库"}
        </button>

        <p className="rounded-lg border border-white/10 bg-ink/55 p-4 text-sm leading-6 text-muted">
          {status}
        </p>
      </form>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amberline">
              Media library
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-bone">已上传素材</h2>
          </div>
          <span className="text-sm text-muted">{media.length} 个文件</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {media.map((item) => (
            <figure
              key={item.url}
              className="overflow-hidden rounded-lg border border-white/10 bg-ink/55"
            >
              <div className="aspect-video bg-smoke">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : item.type === "video" ? (
                  <video src={item.url} controls className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-5 text-center">
                    <span className="text-sm font-semibold text-bone">资料文件</span>
                  </div>
                )}
              </div>
              <figcaption className="space-y-2 p-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all text-sm font-semibold text-bone transition hover:text-white"
                >
                  {item.url}
                </a>
                <p className="text-xs text-muted">
                  {item.type === "video" ? "视频" : item.type === "image" ? "图片" : "资料"} / {formatSize(item.size)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        {media.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-ink/55 p-4 text-sm text-muted">
            还没有上传素材。上传后会在这里显示，可把路径填入作品数据里。
          </p>
        ) : null}
      </section>
    </div>
  );
}
