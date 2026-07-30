"use client";
// app/dashboard/support/page.tsx — Javari Partners
// Tickets, tier, and fix approval for a creator's own app. The approve button
// is the ONLY thing that can ever put a fix live — this page has no other
// action that touches production, matching what the backend enforces.
// CR AudioViz AI · EIN 39-3646201 · July 30, 2026
import { useState, useEffect, useCallback } from "react";
import { getUser } from "@/lib/supabase";

type Tier = { tier: string; name: string; monthly_cents: number; description: string };
type App = { id: string; name: string; support_tier: string; support_tier_pricing?: Tier };
type Ticket = { id: string; title: string; description: string | null; severity: string; status: string; created_at: string };
type Fix = { id: string; ticket_id: string; diff_summary: string; diff_url: string | null;
             risk_level: string; preview_url: string | null; status: string; proposed_at: string };

const STATUS_LABEL: Record<string, string> = {
  open: "Open", fix_proposed: "Fix proposed", fix_staged: "Fix staged",
  approved: "Approved", rejected: "Rejected", resolved: "Resolved", creator_handling: "You're handling this",
};

export default function SupportPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const user = await getUser();
    const token = (user as { access_token?: string } | null)?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadApps = useCallback(async () => {
    const headers = { "Content-Type": "application/json", ...(await authHeader()) };
    const res = await fetch("/api/creator/apps", { headers });
    const body = await res.json() as { ok?: boolean; apps?: App[] };
    if (body.ok) {
      setApps(body.apps ?? []);
      if (body.apps?.[0]) setActiveApp(body.apps[0].id);
    }
  }, [authHeader]);

  const loadSupport = useCallback(async (appId: string) => {
    const headers = { "Content-Type": "application/json", ...(await authHeader()) };
    const res = await fetch(`https://javariai.com/api/support?app_id=${appId}`, { headers });
    const body = await res.json() as { ok?: boolean; tickets?: Ticket[]; fixes?: Fix[] };
    if (body.ok) { setTickets(body.tickets ?? []); setFixes(body.fixes ?? []); }
  }, [authHeader]);

  useEffect(() => { void loadApps(); }, [loadApps]);
  useEffect(() => { if (activeApp) void loadSupport(activeApp); }, [activeApp, loadSupport]);

  const respondToFix = async (fixId: string, ticketId: string, approve: boolean): Promise<void> => {
    setBusy(fixId); setNotice(null);
    try {
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("https://javariai.com/api/support", {
        method: "POST", headers,
        body: JSON.stringify({
          action: approve ? "approve_fix" : "reject_fix",
          fix_id: fixId, ticket_id: ticketId,
          reason: approve ? undefined : "Declined by creator",
        }),
      });
      const body = await res.json() as { ok?: boolean; error?: string };
      if (!body.ok) { setNotice(body.error ?? "Could not record your decision."); return; }
      setNotice(approve ? "Approved — this will be deployed." : "Declined. You can handle this one yourself.");
      if (activeApp) await loadSupport(activeApp);
    } finally { setBusy(null); }
  };

  const app = apps.find(a => a.id === activeApp);
  const tier = app?.support_tier_pricing;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Support</h1>
      <p style={{ opacity: 0.7, fontSize: 14, margin: "0 0 20px" }}>
        Every fix Javari proposes waits here for your approval — nothing goes live without your click.
      </p>

      {apps.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {apps.map(a => (
            <button key={a.id} type="button" onClick={() => setActiveApp(a.id)}
              style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: a.id === activeApp ? "#00B4D8" : "transparent",
                color: a.id === activeApp ? "#04121A" : "inherit",
                border: "1px solid rgba(0,180,216,0.4)" }}>
              {a.name}
            </button>
          ))}
        </div>
      )}

      {tier && (
        <div style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.2)",
          borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{tier.name} — ${(tier.monthly_cents / 100).toFixed(0)}/mo</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{tier.description}</div>
        </div>
      )}

      {notice && (
        <div role="status" style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16,
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 13 }}>
          {notice}
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>Fixes awaiting your review</h2>
      {fixes.filter(f => f.status === "pending_review").length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>Nothing waiting on you right now.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {fixes.filter(f => f.status === "pending_review").map(f => (
            <div key={f.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{f.diff_summary}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                  background: f.risk_level === "low" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                  color: f.risk_level === "low" ? "#10B981" : "#F59E0B" }}>
                  {f.risk_level} risk
                </span>
              </div>
              {f.preview_url && (
                <a href={f.preview_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#00B4D8" }}>View staged preview →</a>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" disabled={busy === f.id} onClick={() => void respondToFix(f.id, f.ticket_id, true)}
                  style={{ padding: "8px 16px", minHeight: 40, borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#10B981", color: "#04121A", fontWeight: 700, fontSize: 13 }}>
                  {busy === f.id ? "Working…" : "Approve & Deploy"}
                </button>
                <button type="button" disabled={busy === f.id} onClick={() => void respondToFix(f.id, f.ticket_id, false)}
                  style={{ padding: "8px 16px", minHeight: 40, borderRadius: 8, cursor: "pointer",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13 }}>
                  I'll handle it myself
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>All tickets</h2>
      {tickets.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No tickets yet — this fills in as your app collects real usage.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tickets.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 10,
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
              <span>{t.title}</span>
              <span style={{ opacity: 0.65 }}>{STATUS_LABEL[t.status] ?? t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
