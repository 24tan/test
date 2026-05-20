"use client";

import { ChangeEvent, useRef, useState } from "react";

type AdminUploadControlProps = {
  accept: string;
  adminUsername: string;
  adminPassword: string;
  buttonLabel?: string;
  multiple?: boolean;
  onUploaded: (urls: string[]) => void;
};

export function AdminUploadControl({
  accept,
  adminUsername,
  adminPassword,
  buttonLabel = "选择上传",
  multiple = false,
  onUploaded,
}: AdminUploadControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    setIsUploading(true);
    setMessage("上传中...");

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
        uploaded?: Array<{ url: string }>;
        error?: string;
      };

      if (!response.ok || !data.uploaded) {
        setMessage(data.error ?? "上传失败");
        return;
      }

      const urls = data.uploaded.map((item) => item.url);
      onUploaded(urls);
      setMessage(`已上传 ${urls.length} 个文件`);
    } catch {
      setMessage("上传失败");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-bone transition hover:border-white/35 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isUploading ? "上传中..." : buttonLabel}
      </button>
      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
