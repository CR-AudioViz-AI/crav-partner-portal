// app/api/partners/referrals/route.ts
// A partner's own referral link plus real click and conversion stats — every
// number here comes from partner_link_clicks / referral_attributions /
// partner_deals, none of it estimated.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
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

function makeCode(companyName: string): string {
  const base = (companyName || "partner").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20).replace(/^-+|-+$/g, "");
  return `${base || "partner"}-${randomBytes(3).toString("hex")}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const userId = await userFrom(req, sb);
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });

  const { data: partner } = await sb.from("partners").select("*").eq("user_id", userId).maybeSingle();
  if (!partner) return NextResponse.json({ ok: false, error: "No partner account" }, { status: 404 });

  const [{ count: clickCount }, { data: attributions }, { data: convertedDeals }] = await Promise.all([
    sb.from("partner_link_clicks").select("*", { count: "exact", head: true }).eq("partner_id", partner.id),
    sb.from("referral_attributions").select("converted, expires_at").eq("partner_id", partner.id),
    sb.from("partner_deals").select("amount").eq("partner_id", partner.id).not("subscription_id", "is", null),
  ]);

  const activeAttributions = (attributions ?? []).filter(a => !a.converted && new Date(a.expires_at) > new Date()).length;
  const convertedCount = (attributions ?? []).filter(a => a.converted).length;
  const conversionRate = clickCount ? Math.round((convertedCount / clickCount) * 1000) / 10 : 0;
  const verifiedRevenue = (convertedDeals ?? []).reduce((s, d) => s + Number(d.amount ?? 0), 0);

  return NextResponse.json({
    ok: true,
    referral_code: partner.referral_code,
    referral_url: partner.referral_code ? `https://craudiovizai.com/ref/${partner.referral_code}` : null,
    cookie_window_days: partner.cookie_window_days,
    commission_rate: partner.commission_rate,
    stats: {
      total_clicks: clickCount ?? 0,
      active_attributions: activeAttributions,   // clicked, cookie still live, not yet converted
      converted: convertedCount,                 // became a real, paying subscription
      conversion_rate_pct: conversionRate,
      verified_revenue: verifiedRevenue,          // only ever from real subscriptions - never estimated
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const userId = await userFrom(req, sb);
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });

  const { data: partner } = await sb.from("partners").select("id, referral_code, company_name").eq("user_id", userId).maybeSingle();
  if (!partner) return NextResponse.json({ ok: false, error: "No partner account" }, { status: 404 });
  if (partner.referral_code) {
    // A code is permanent once generated - regenerating would silently break
    // every link already posted anywhere, orphaning real, in-flight clicks.
    return NextResponse.json({ ok: false, error: "A referral code already exists for this account" }, { status: 409 });
  }

  let code = makeCode(partner.company_name ?? "");
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await sb.from("partners").update({ referral_code: code }).eq("id", partner.id);
    if (!error) {
      return NextResponse.json({ ok: true, referral_code: code, referral_url: `https://craudiovizai.com/ref/${code}` });
    }
    code = makeCode(partner.company_name ?? ""); // collision on the unique constraint - try again with a fresh suffix
  }
  return NextResponse.json({ ok: false, error: "Could not generate a unique code — try again" }, { status: 500 });
}
