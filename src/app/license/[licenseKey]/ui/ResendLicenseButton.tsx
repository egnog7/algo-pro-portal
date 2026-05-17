"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { resendLicenseEmail } from "@/lib/api";

export default function ResendLicenseButton({
  licenseKey,
}: {
  licenseKey: string;
}) {
  const { getToken } = useAuth(); // ✅ add Clerk hook

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onResend() {
    setBusy(true);
    setMsg(null);

    try {
      const token = await getToken(); // ✅ fetch JWT
      if (!token) throw new Error("401 Missing bearer token");

      await resendLicenseEmail(licenseKey, token); // ✅ pass token

      setMsg("License email sent successfully.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to resend email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={onResend}
        disabled={busy}
        className="rounded border px-3 py-1 text-xs hover:bg-gray-100 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Resend license email"}
      </button>
      {msg && <div className="text-xs text-gray-600">{msg}</div>}
    </div>
  );
}