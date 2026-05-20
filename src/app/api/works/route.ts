import { NextResponse } from "next/server";
import { categories } from "@/data/works";
import { adminAuthError, isAdminRequest } from "@/lib/admin-auth";
import { deleteWork, getAllWorks, upsertWork } from "@/lib/works-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    categories,
    works: await getAllWorks(),
  });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: adminAuthError() }, { status: 401 });
  }

  try {
    const body = await request.json();
    const work = await upsertWork(body.work, body.originalSlug);
    return NextResponse.json({ work });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "作品保存失败。" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: adminAuthError() }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "缺少作品路径。" }, { status: 400 });
  }

  try {
    await deleteWork(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "作品删除失败。" },
      { status: 400 },
    );
  }
}
