"use client";

import { upload } from "@vercel/blob/client";
import { ChangeEvent, useRef, useState } from "react";
import {
  errorMessage,
  mediaKind,
  mediaLimit,
  mediaLimitMessage,
  safeUploadPathname,
} from "@/lib/upload-utils";

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

  async function uploadFile(file: File) {
    const type = mediaKind(file.name, file.type);

    if (!type) {
      throw new Error(`${file.name} 不是支持的图片、视频或资料文件格式。`);
    }

    if (file.size > mediaLimit(type)) {
      throw new Error(mediaLimitMessage(file.name, type));
    }

    const blob = await upload(safeUploadPathname(file.name), file, {
      access: "public",
      handleUploadUrl: "/api/uploads",
      multipart: true,
      contentType: file.type || undefined,
      headers: {
        "x-admin-username": adminUsername,
        "x-admin-password": adminPassword,
      },
    });

    return blob.url;
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setMessage("上传中...");

    try {
      const urls = [];

      for (const file of files) {
        const url = await uploadFile(file);
        urls.push(url);
      }

      onUploaded(urls);
      setMessage(`已上传 ${urls.length} 个文件`);
    } catch (error) {
      setMessage(`上传失败：${errorMessage(error)}`);
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
