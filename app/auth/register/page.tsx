"use client";
// app/auth/register/page.tsx — Javari Partners
// Retired 2026-07-30, same reasoning as login/page.tsx: creator certification
// starts from the real platform account, not a separate signup.
import { useEffect } from "react";

export default function RegisterRedirect() {
  useEffect(() => {
    const dest = encodeURIComponent(window.location.origin + "/dashboard/apply");
    window.location.replace(`https://craudiovizai.com/signup?returnTo=${dest}`);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0A1628", color: "#F1F5F9", fontFamily: "system-ui" }}>
      <p>Taking you to create an account&hellip;</p>
    </div>
  );
}
