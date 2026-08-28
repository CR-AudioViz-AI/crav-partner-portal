// app/api/partners/overview/route.ts
// The dashboard's at-a-glance view, matching what PartnerStack's homepage
// shows: pending applications, new leads, deals in progress, and — the piece
// that actually makes payouts accurate — real per-app revenue, derived only
// from deals tied to a verified subscription, never a self-reported number.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = "force-dynamic";

const SB_URL = supabaseUrl();
const SB_SVC = secretKey();

async function userFrom(req: NextRequest, sb: SupabaseClient): Promise<string | null> {
  const h = req.headers.get("authorization");
  const t = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  const { data } = await sb.auth.getUser(t);
  return data?.user?.id ?? null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const userId = await userFrom(req, sb);
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });

  const { data: partner } = await sb.from("partners").select("*").eq("user_id", userId).maybeSingle();
  if (!partner) {
    // No partner record yet — check for a pending application instead, so
    // the dashboard can tell someone honestly "your application is under
    // review" rather than a generic empty state.
    const { data: application } = await sb.from("partner_applications")
      .select("status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).maybeSingle();
    return NextResponse.json({ ok: true, has_partner_account: false, application: application ?? null });
  }

  const { data: overview } = await sb.rpc("partner_overview", { p_partner: partner.id });

  return NextResponse.json({
    ok: true,
    has_partner_account: true,
    partner: { company_name: partner.company_name, tier: partner.tier, payout_status: partner.payout_status },
    overview: overview ?? {},
  });
}
