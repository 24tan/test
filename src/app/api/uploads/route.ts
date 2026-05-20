import path from "path";
import { list } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { adminAuthError, isAdminRequest } from "@/lib/admin-auth";
import {
  allowedContentTypes,
  blobPrefix,
  errorMessage,
  mediaKind,
  mediaLimit,
} from "@/lib/upload-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadedMedia = {
  name: string;
  url: string;
  type: "image" | "video" | "file";
  size: number;
  updatedAt: string;
};

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
    return NextResponse.json(
      { error: `媒体库读取失败：${errorMessage(error)}` },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    if (body.type === "blob.generate-client-token" && !isAdminRequest(request)) {
      return NextResponse.json({ error: adminAuthError() }, { status: 401 });
    }

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(blobPrefix)) {
          throw new Error("上传路径必须位于 uploads/ 目录。");
        }

        const type = mediaKind(pathname);

        if (!type) {
          throw new Error(`${path.basename(pathname)} 不是支持的图片、视频或资料文件格式。`);
        }

        return {
          allowedContentTypes: allowedContentTypes(type),
          maximumSizeInBytes: mediaLimit(type),
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Vercel Blob client upload completed:", blob.url);
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.warn("Failed to handle Vercel Blob client upload:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
