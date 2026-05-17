// src/app/license/[licenseKey]/pairs/page.tsx
import LicenseEditor from "../ui/LicenseEditor";
import { fetchLicense, type LicenseDTO } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";

type PageProps = {
  params: Promise<{ licenseKey: string }>;
};

type LoadError = "NOT_FOUND" | "GENERIC" | "UNAUTH";

export default async function ManagePairsPage({ params }: PageProps) {
  const { licenseKey } = await params;

  // ✅ Get Clerk JWT on the server (App Router)
  const a = await auth();
  const token = a.userId ? await a.getToken() : null;

  let data: LicenseDTO | null = null;
  let error: LoadError | null = null;

  try {
    data = await fetchLicense(licenseKey, token);
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.startsWith("401")) error = "UNAUTH";
    else if (msg.startsWith("404")) error = "NOT_FOUND";
    else error = "GENERIC";
  }

  // --- Error state UI ---
  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-xl font-semibold">License check failed</h1>

          {error === "UNAUTH" ? (
            <>
              <p className="text-sm text-gray-700">
                You&apos;re not signed in. Please sign in to manage pairs for
                this license.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/sign-in"
                  className="rounded bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800"
                >
                  Sign in
                </a>
                <a
                  href="/"
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Back to portal home
                </a>
              </div>
            </>
          ) : error === "NOT_FOUND" ? (
            <>
              <p className="text-sm text-gray-700">
                We couldn&apos;t find a license with this key:
              </p>
              <pre className="text-xs bg-gray-100 rounded px-3 py-2 break-all">
                {licenseKey}
              </pre>
              <p className="text-sm text-gray-600">
                Double-check for typos, or if you just subscribed, refresh your
                Stripe success page and try again.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/"
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Back to portal home
                </a>
                <a
                  href="/checkout"
                  className="rounded bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800"
                >
                  View plans &amp; subscribe
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Something went wrong while loading this license.
              </p>
              <p className="text-sm text-gray-600">
                This might be a temporary API issue. Try again in a moment, and
                if it persists, contact support.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/"
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Back to portal home
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  // Suspended / expired logic
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const isExpired = !!data.expires_at && data.expires_at < todayISO;
  const isSuspended = (data.status || "").toLowerCase() === "suspended";
  const isInactive = isSuspended || isExpired;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header / summary */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              Algo Pro · {data.license_key}
            </h1>
            <p className="text-sm text-gray-600">
              Plan: {data.plan} · Status: {data.status} · Expires:{" "}
              {data.expires_at}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 text-xs text-gray-600">
              <span>Max pairs: {data.max_pairs}</span>
              {data.priority_support && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                  Priority support
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Suspended / Expired banners */}
        {isSuspended && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="font-medium text-red-800">License suspended</div>
            <div className="text-sm text-red-700 mt-1">
              Your subscription appears inactive or payment failed. Please manage
              your subscription to restore access.
            </div>
          </div>
        )}

        {!isSuspended && isExpired && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="font-medium text-amber-900">License expired</div>
            <div className="text-sm text-amber-800 mt-1">
              This license has passed its expiry date. Renew your subscription to
              restore access.
            </div>
          </div>
        )}

        {/* Top tab-ish nav */}
        <nav className="border-b text-sm flex gap-4">
          <a
            href={`/license/${licenseKey}`}
            className="pb-2 text-gray-600 hover:text-black"
          >
            Overview
          </a>

          <span className="border-b-2 border-black pb-2 font-medium">
            Manage pairs
          </span>

          {isInactive ? (
            <>
              <span className="pb-2 text-gray-400 cursor-not-allowed">
                Presets &amp; optimization
              </span>
              <span className="pb-2 text-gray-400 cursor-not-allowed">
                Download EA
              </span>
            </>
          ) : (
            <>
              <a
                href={`/license/${licenseKey}/presets`}
                className="pb-2 text-gray-600 hover:text-black"
              >
                Presets &amp; optimization
              </a>
              <a
                href={`/download/${licenseKey}`}
                className="pb-2 text-gray-600 hover:text-black"
              >
                Download EA
              </a>
            </>
          )}
        </nav>

        {/* Content */}
        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Pairs enabled</h2>

          <p className="text-xs text-gray-500">
            You can enable up to <strong>{data.max_pairs}</strong> pairs on this
            license. Changes save instantly to your EA.
          </p>

          {isInactive ? (
            <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
              Pair management is disabled while this license is{" "}
              {isSuspended ? "suspended" : "expired"}. Restore your subscription
              to re-enable editing.
            </div>
          ) : (
            <LicenseEditor
              licenseKey={licenseKey}
              currentPairsCSV={data.pairs}
              maxPairs={data.max_pairs}
            />
          )}
        </section>

        {/* Bottom quick links */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`/license/${licenseKey}`}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Back to overview
          </a>

          <a
            href={`/license/${licenseKey}/presets`}
            className={`rounded border px-4 py-2 text-sm hover:bg-gray-100 ${
              isInactive ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Presets &amp; optimization
          </a>

          <a
            href={`/download/${licenseKey}`}
            className={`rounded bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 ${
              isInactive ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Download EA
          </a>
        </div>
      </div>
    </main>
  );
}