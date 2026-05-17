"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createPortal } from "@/lib/api";

export default function ManagePortalButton({ licenseKey }: { licenseKey: string }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openPortal() {
    try {
      setLoading(true);
      setErr(null);

      const token = await getToken();
      if (!token) throw new Error("401 Missing bearer token");

      const { url } = await createPortal(licenseKey, token);
      window.location.href = url;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to open portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={openPortal}
        disabled={loading}
        className="rounded border px-3 py-2 text-sm"
      >
        {loading ? "Opening…" : "Manage Subscription"}
      </button>
      {err && <span className="mt-1 text-xs text-red-600">{err}</span>}
    </div>
  );
}