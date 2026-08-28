// app/api/partners/payouts/route.ts
// Real payouts. GET returns a partner's payout history and connect status.
// POST either starts Stripe Connect onboarding or requests a payout of
// earned, unpaid commission - never both in one call, and a payout request
// always runs the real fraud checks before it is created.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = "force-dynamic";

const SB_URL = supabaseUrl();
const SB_SVC = secretKey();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

async function userFrom(req: NextRequest, sb: SupabaseClient): Promise<string | null> {
  const h = req.headers.get("authorization");
  const t = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  const { data } = await sb.auth.getUser(t);
  return data?.user?.id ?? null;
}

async function ownPartner(sb: SupabaseClient, userId: string) {
  const { data } = await sb.from("partners").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const userId = await userFrom(req, sb);
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  const partner = await ownPartner(sb, userId);
  if (!partner) return NextResponse.json({ ok: false, error: "No partner account" }, { status: 404 });

  const [{ data: payouts }, { data: closedDeals }] = await Promise.all([
    sb.from("partner_payouts").select("*").eq("partner_id", partner.id).order("requested_at", { ascending: false }),
    // Only deals with a verified, real subscription behind them count toward
    // a payout - a self-reported "closed" deal with no subscription_id is
    // never eligible for real money, no matter what its amount field says.
    sb.from("partner_deals").select("id, amount, status").eq("partner_id", partner.id)
      .eq("status", "closed").not("subscription_id", "is", null),
  ]);

  const alreadyPaidDealIds = new Set((payouts ?? []).flatMap(p => (p.deal_ids as string[]) ?? []));
  const unpaidDeals = (closedDeals ?? []).filter(d => !alreadyPaidDealIds.has(d.id));
  const commissionRate = Number(partner.commission_rate ?? 0.25);
  const availableCents = Math.round(
    unpaidDeals.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) * commissionRate * 100
  );

  return NextResponse.json({
    ok: true,
    payout_status: partner.payout_status,
    minimum_payout_cents: partner.minimum_payout_cents,
    available_cents: availableCents,
    unpaid_deal_count: unpaidDeals.length,
    payouts: payouts ?? [],
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ ok: false }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
  const userId = await userFrom(req, sb);
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  const partner = await ownPartner(sb, userId);
  if (!partner) return NextResponse.json({ ok: false, error: "No partner account" }, { status: 404 });

  let body: { action?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 }); }

  // Start (or resume) Stripe Connect onboarding for this partner. Express
  // accounts, not Standard - Express keeps the partner inside our UI for
  // everything except the identity/bank-account steps Stripe legally must
  // collect directly.
  if (body.action === "connect_stripe") {
    let accountId = partner.stripe_connect_account_id as string | null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: partner.email,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
      });
      accountId = account.id;
      await sb.from("partners").update({
        stripe_connect_account_id: accountId, payout_status: "pending_verification",
      }).eq("id", partner.id);
    }
    const origin = req.headers.get("origin") ?? "https://javaripartners.com";
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/settings?connect=refresh`,
      return_url: `${origin}/dashboard/settings?connect=complete`,
      type: "account_onboarding",
    });
    return NextResponse.json({ ok: true, onboarding_url: link.url });
  }

  // Request a payout of earned, unpaid commission. Runs real fraud checks
  // first - any flag holds the payout for manual review rather than either
  // silently blocking it or silently paying it out.
  if (body.action === "request_payout") {
    if (partner.payout_status !== "active") {
      return NextResponse.json({ ok: false, error: "Complete Stripe Connect onboarding before requesting a payout" }, { status: 400 });
    }

    await sb.rpc("run_fraud_checks", { p_partner: partner.id });
    const { data: openFlags } = await sb.from("fraud_flags")
      .select("id").eq("entity_type", "partner").eq("entity_id", partner.id).eq("resolved", false);

    const { data: payouts } = await sb.from("partner_payouts").select("deal_ids").eq("partner_id", partner.id);
    const alreadyPaidDealIds = new Set((payouts ?? []).flatMap(p => (p.deal_ids as string[]) ?? []));
    const { data: closedDeals } = await sb.from("partner_deals")
      .select("id, amount").eq("partner_id", partner.id).eq("status", "closed")
      .not("subscription_id", "is", null); // verified deals only - same rule as GET above
    const unpaidDeals = (closedDeals ?? []).filter(d => !alreadyPaidDealIds.has(d.id));
    const commissionRate = Number(partner.commission_rate ?? 0.25);
    const amountCents = Math.round(unpaidDeals.reduce((s, d) => s + Number(d.amount ?? 0), 0) * commissionRate * 100);

    if (amountCents < Number(partner.minimum_payout_cents ?? 5000)) {
      return NextResponse.json({
        ok: false,
        error: `Minimum payout is $${(partner.minimum_payout_cents / 100).toFixed(2)}; you have $${(amountCents / 100).toFixed(2)} available.`,
      }, { status: 400 });
    }

    const { data: payout, error } = await sb.from("partner_payouts").insert({
      partner_id: partner.id,
      amount_cents: amountCents,
      deal_ids: unpaidDeals.map(d => d.id),
      status: (openFlags ?? []).length > 0 ? "held_for_review" : "processing",
      hold_reason: (openFlags ?? []).length > 0 ? "Pending fraud review" : null,
    }).select("id, status").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    if (payout.status === "processing") {
      try {
        const transfer = await stripe.transfers.create({
          amount: amountCents, currency: "usd",
          destination: partner.stripe_connect_account_id,
        });
        await sb.from("partner_payouts").update({
          status: "paid", stripe_transfer_id: transfer.id, paid_at: new Date().toISOString(),
        }).eq("id", payout.id);
      } catch (e) {
        await sb.from("partner_payouts").update({
          status: "failed", failure_reason: e instanceof Error ? e.message : String(e),
        }).eq("id", payout.id);
        return NextResponse.json({ ok: false, error: "Payout failed to process — see payout history for details" }, { status: 502 });
      }
    }

    return NextResponse.json({ ok: true, payout_id: payout.id, status: payout.status });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
