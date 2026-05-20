export const blobPrefix = "uploads/";
export const imageLimit = 12 * 1024 * 1024;
export const videoLimit = 200 * 1024 * 1024;
export const fileLimit = 60 * 1024 * 1024;

export type MediaType = "image" | "video" | "file";

export function mediaKind(fileName: string, mimeType?: string): MediaType | undefined {
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

export function mediaLimit(type: MediaType) {
  return type === "video" ? videoLimit : type === "image" ? imageLimit : fileLimit;
}

export function mediaLimitMessage(fileName: string, type: MediaType) {
  return type === "video"
    ? `${fileName} 超过 200MB 视频上传限制。`
    : type === "image"
      ? `${fileName} 超过 12MB 图片上传限制。`
      : `${fileName} 超过 60MB 资料文件上传限制。`;
}

export function allowedContentTypes(type: MediaType) {
  if (type === "image") {
    return ["image/*"];
  }

  if (type === "video") {
    return ["video/*"];
  }

  return [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "application/x-7z-compressed",
    "text/plain",
    "text/markdown",
  ];
}

function splitFileName(fileName: string) {
  const cleanName = fileName.split(/[\\/]/).pop() || "media";
  const dotIndex = cleanName.lastIndexOf(".");

  if (dotIndex <= 0) {
    return { baseName: cleanName, extension: "" };
  }

  return {
    baseName: cleanName.slice(0, dotIndex),
    extension: cleanName.slice(dotIndex).toLowerCase(),
  };
}

export function safeUploadPathname(fileName: string) {
  const { baseName, extension } = splitFileName(fileName);
  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 42) || "media";
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${blobPrefix}${safeBaseName}-${suffix}${extension}`;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
