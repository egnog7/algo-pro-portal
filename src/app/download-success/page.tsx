// src/app/download-success/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function DownloadSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const licenseKey = sp.get("license_key");

  const goBack = () => {
    if (licenseKey) {
      router.push(`/license/${encodeURIComponent(licenseKey)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Download complete ✅
        </h1>

        <p className="text-gray-600 text-center max-w-lg mx-auto">
          Your Expert Advisor should now be available in your downloads.
          <br />
          Install it in MetaTrader 5 via:
          <br />
          <br />
          <code className="bg-gray-100 p-2 rounded inline-block">
            File → Open Data Folder → MQL5 → Experts
          </code>
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={goBack}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-neutral-800"
          >
            {licenseKey ? "Return to Portal" : "Return to Portal Home"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 border rounded hover:bg-gray-100"
          >
            Portal home
          </button>

          {licenseKey ? (
            <div className="text-[11px] text-gray-400 text-center">
              License: <span className="font-mono">{licenseKey}</span>
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 text-center">
              Tip: if you came from a download redirect, we usually include your
              license key in the URL.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
