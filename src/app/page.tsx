// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [licenseKey, setLicenseKey] = useState("");
  const router = useRouter();

  const trimmed = licenseKey.trim();
  const disabled = !trimmed;

  const goDashboard = () => {
    if (disabled) return;
    router.push(`/license/${encodeURIComponent(trimmed)}`);
  };

  const goManagePairs = () => {
    if (disabled) return;
    router.push(`/license/${encodeURIComponent(trimmed)}/pairs`);
  };

  const goPresets = () => {
    if (disabled) return;
    router.push(`/license/${encodeURIComponent(trimmed)}/presets`);
  };

  const goDownload = () => {
    if (disabled) return;
    router.push(`/download/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Algo Pro Portal</h1>
          <p className="text-sm text-gray-600">
            Manage your Algo Pro license, pairs, presets, downloads and billing.
          </p>
        </div>

        {/* License input */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">
            Enter your license key
          </label>

          <input
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            placeholder="LIC-XXXX-XXXX-XXXX"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goDashboard();
            }}
          />

          <button
            className="w-full rounded bg-black text-white py-2 text-sm font-medium disabled:opacity-60"
            onClick={goDashboard}
            disabled={disabled}
          >
            Open license dashboard
          </button>

          <p className="text-xs text-gray-500">
            Just subscribed? Your license key was emailed to you.
          </p>
        </div>

        {/* Quick actions */}
        <div className="pt-4 border-t space-y-3">
          <div className="text-xs font-semibold text-gray-500 tracking-wide">
            QUICK ACTIONS
          </div>

          <button
            className="w-full border rounded px-4 py-2 text-sm disabled:opacity-60"
            onClick={goManagePairs}
            disabled={disabled}
          >
            Manage pairs
          </button>

          <button
            className="w-full border rounded px-3 py-2 text-sm disabled:opacity-60"
            onClick={goPresets}
            disabled={disabled}
          >
            Presets &amp; optimization
          </button>

          <button
            className="w-full border rounded px-3 py-2 text-sm disabled:opacity-60"
            onClick={goDownload}
            disabled={disabled}
          >
            Download EA
          </button>
        </div>

        {/* New user CTA */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-gray-600">
            Don’t have a license yet?
          </p>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded border border-black px-4 py-2 text-sm hover:bg-gray-100"
          >
            View plans & subscribe
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-gray-400 text-center">
          Test mode: you can use a known key like{" "}
          <code className="px-1 py-0.5 rounded bg-gray-100">
            TEST-LIC-1234
          </code>{" "}
          or a key created via Stripe test checkout.
        </p>
      </div>
    </main>
  );
}
