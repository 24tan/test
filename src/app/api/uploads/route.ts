import { randomUUID } from "crypto";
import path from "path";
import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminAuthError, isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blobPrefix = "uploads/";
const imageLimit = 12 * 1024 * 1024;
const videoLimit = 200 * 1024 * 1024;
const fileLimit = 60 * 1024 * 1024;

type UploadedMedia = {
  name: string;
  url: string;
  type: "image" | "video" | "file";
  size: number;
  updatedAt: string;
};

function mediaKind(fileName: string, mimeType?: string): UploadedMedia["type"] | undefined {
  if (mimeType?.startsWith("image/")) {
    return "image";
  }

  if (mimeType?.startsWith("video/")) {
    return "video";
  }

  if (/\.(png|jpe?g|webp|gif|avif)$/i.test(fileName)) {
    return "image";
  }

  if (/\.(mp4|mov|webm|m4v)$/i.test(fileName)) {
    return "video";
  }

  if (/\.(pdf|docx?|pptx?|xlsx?|txt|md|zip|rar|7z)$/i.test(fileName)) {
    return "file";
  }

  return undefined;
}

function safeFileName(originalName: string) {
  const extension = path.extname(originalName).toLowerCase();
  const baseName =
    path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 42) || "media";

  return `${baseName}-${randomUUID().slice(0, 8)}${extension}`;
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: adminAuthError() }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: blobPrefix });
    const media = blobs
      .map((blob): UploadedMedia | undefined => {
        const name = path.posix.basename(blob.pathname);
        const type = mediaKind(name);

        if (!type) {
          return undefined;
        }

        return {
          name,
          url: blob.url,
          type,
          size: blob.size,
          updatedAt: toIsoString(blob.uploadedAt),
        };
      })
      .filter((item): item is UploadedMedia => Boolean(item))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    return NextResponse.json({ media });
  } catch (error) {
    console.warn("Failed to list Vercel Blob media:", error);
    return NextResponse.json({ error: "媒体库读取失败，请检查 Blob 环境变量。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: adminAuthError() }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "请选择要上传的图片或视频。" }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      const type = mediaKind(file.name, file.type);

      if (!type) {
        return NextResponse.json(
          { error: `${file.name} 不是支持的图片、视频或资料文件格式。` },
          { status: 400 },
        );
      }

      const limit = type === "video" ? videoLimit : type === "image" ? imageLimit : fileLimit;

      if (file.size > limit) {
        return NextResponse.json(
          {
            error:
              type === "video"
                ? `${file.name} 超过 200MB 视频上传限制。`
                : type === "image"
                  ? `${file.name} 超过 12MB 图片上传限制。`
                  : `${file.name} 超过 60MB 资料文件上传限制。`,
          },
          { status: 400 },
        );
      }

      const name = safeFileName(file.name);
      const blob = await put(`${blobPrefix}${name}`, file, {
        access: "public",
        contentType: file.type || undefined,
      });

      uploaded.push({
        name,
        originalName: file.name,
        url: blob.url,
        type,
        size: file.size,
      });
    }

    return NextResponse.json({ uploaded });
  } catch (error) {
    console.warn("Failed to upload to Vercel Blob:", error);
    return NextResponse.json({ error: "上传失败，请检查 Blob 环境变量。" }, { status: 500 });
  }
}
