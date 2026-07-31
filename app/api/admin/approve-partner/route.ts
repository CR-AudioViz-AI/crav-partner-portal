// app/api/admin/approve-partner/route.ts
// Admin-only. Turns an approved application into a real partner record with
// the correct type-based commission rate - 20% affiliate / 25% reseller,
// Roy's decision 2026-07-30 - via approve_partner_application(), never set
// by hand at the API layer so the rate can't drift or be typed in wrong.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function requireAdmin(req: NextRequest, sb: SupabaseClient): Promise<string | null> {
  const h = req.headers.get("authorization");
  const t = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  const { data } = await sb.auth.getUser(t);
  if (!data?.user?.id) return null;
  const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role ?? "user";
  return role === "admin" || role === "super_admin" ? data.user.id : null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const adminId = await requireAdmin(req, sb);
  if (!adminId) return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });

  let body: { application_id?: string; partner_type?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 }); }

  if (!body.application_id || !body.partner_type) {
    return NextResponse.json({ ok: false, error: "application_id and partner_type required" }, { status: 400 });
  }

  const { data, error } = await sb.rpc("approve_partner_application", {
    p_application_id: body.application_id,
    p_partner_type: body.partner_type,
    p_reviewer: adminId,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
