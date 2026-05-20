import { NextResponse } from "next/server";
import { adminAuthError, isAdminRequest } from "@/lib/admin-auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: adminAuthError() }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await saveSiteSettings(body.settings);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "站点资料保存失败。" }, { status: 400 });
  }
}
