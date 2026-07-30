"use client";
// app/auth/login/page.tsx — Javari Partners
// Retired 2026-07-30: this app previously ran its own separate login system,
// a third identity alongside core auth and Javariverse membership. Per Roy:
// creator, user and admin are communities orbiting one Javariverse, not three
// separate accounts. Creator status is now a role on the same core identity —
// this page exists only to send people to the real login and back.
import { useEffect } from "react";

export default function LoginRedirect() {
  useEffect(() => {
    const dest = encodeURIComponent(window.location.origin + "/dashboard");
    window.location.replace(`https://craudiovizai.com/login?redirect=${dest}`);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0A1628", color: "#F1F5F9", fontFamily: "system-ui" }}>
      <p>Taking you to sign in&hellip;</p>
    </div>
  );
}
