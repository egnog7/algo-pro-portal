// src/app/license/[licenseKey]/page.tsx
import LicenseEditor from "./ui/LicenseEditor";
import ManagePortalButton from "./ui/ManagePortalButton";
import ResendLicenseButton from "./ui/ResendLicenseButton";
import ModulesClient from "./ui/ModulesClient";

import { fetchLicense } from "@/lib/api.server";
import { listModules } from "@/lib/api";
import type { LicenseDTO } from "@/lib/api.types";
import type { ModulesResponse } from "@/lib/api";

type PageProps = {
  params: Promise<{ licenseKey: string }>;
};

export default async function LicensePage({ params }: PageProps) {
  const { licenseKey } = await params;

  let data: LicenseDTO | null = null;
  let modulesData: ModulesResponse | null = null;
  let error: "NOT_FOUND" | "GENERIC" | null = null;

  try {
    data = await fetchLicense(licenseKey);
    modulesData = await listModules(licenseKey);
  } catch (e: any) {
    const msg = e?.message || "";

    if (msg === "LICENSE_NOT_FOUND" || msg.startsWith("404")) {
      error = "NOT_FOUND";
    } else {
      error = "GENERIC";
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-xl font-semibold">License check failed</h1>

          {error === "NOT_FOUND" ? (
            <>
              <p className="text-sm text-gray-700">
                We couldn&apos;t find a license with this key:
              </p>
              <pre className="text-xs bg-gray-100 rounded px-3 py-2 break-all">
                {licenseKey}
              </pre>
              <p className="text-sm text-gray-600">
                Double-check for typos, or if you just subscribed, make sure the
                Stripe payment completed and the confirmation email was
                received.
              </p>
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
            </>
          )}

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
        </div>
      </main>
    );
  }

  if (!data) return null;

  const todayISO = new Date().toISOString().slice(0, 10);
  const isExpired = !!data.expires_at && data.expires_at < todayISO;
  const isSuspended = (data.status || "").toLowerCase() === "suspended";
  const isInactive = isSuspended || isExpired;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
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
            <ManagePortalButton licenseKey={licenseKey} />

            <div className="flex gap-2 text-xs text-gray-600">
              <span>Max pairs: {data.max_pairs}</span>

              {modulesData && (
                <span>Max modules: {modulesData.max_modules}</span>
              )}

              {data.priority_support && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                  Priority support
                </span>
              )}
            </div>
          </div>
        </header>

        {isSuspended && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="font-medium text-red-800">License suspended</div>
            <div className="text-sm text-red-700 mt-1">
              Your subscription appears inactive or payment failed. Use{" "}
              <span className="font-medium">Manage Subscription</span> to restore
              access.
            </div>
          </div>
        )}

        {!isSuspended && isExpired && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="font-medium text-amber-900">License expired</div>
            <div className="text-sm text-amber-800 mt-1">
              This license has passed its expiry date. Renew your subscription
              to restore access.
            </div>
          </div>
        )}

        <nav className="border-b text-sm flex gap-4">
          <span className="border-b-2 border-black pb-2 font-medium">
            Overview
          </span>

          {isInactive ? (
            <>
              <span className="pb-2 text-gray-400 cursor-not-allowed">
                Manage pairs
              </span>
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
                href={`/license/${licenseKey}/pairs`}
                className="pb-2 text-gray-600 hover:text-black"
              >
                Manage pairs
              </a>
              <a
                href={`/license/${licenseKey}/presets`}
                className="pb-2 text-gray-600 hover:text-black"
              >
                Presets &amp; optimization
              </a>
              <a
                href={`/license/${licenseKey}#download`}
                className="pb-2 text-gray-600 hover:text-black"
              >
                Download EA
              </a>
            </>
          )}
        </nav>

        <section className="bg-white rounded-xl shadow p-4 space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">License summary</h2>
            <p className="text-xs text-gray-600">
              Plan: {data.plan} · Status: {data.status} · Expires:{" "}
              {data.expires_at}
            </p>
          </div>

          <ResendLicenseButton licenseKey={licenseKey} />

          {modulesData && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-medium">Installed modules</h3>
                <p className="text-xs text-gray-600">
                  {modulesData.enabled_modules || "No modules enabled"} · Max
                  modules: {modulesData.max_modules}
                </p>
              </div>

              <ModulesClient modules={modulesData.modules} />
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-medium">Pairs enabled</h3>
            <p className="text-xs text-gray-600">Max pairs: {data.max_pairs}</p>

            {isInactive ? (
              <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                Pair management is disabled while this license is{" "}
                {isSuspended ? "suspended" : "expired"}. Use{" "}
                <span className="font-medium">Manage Subscription</span> to
                restore access.
              </div>
            ) : (
              <LicenseEditor
                licenseKey={licenseKey}
                currentPairsCSV={data.pairs}
                maxPairs={data.max_pairs}
              />
            )}
          </div>

          <div id="download" className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-1">Download EA</h3>
            <p className="text-xs text-gray-600 mb-2">
              Use the button below to download the latest Algo Pro Utility EA and
              attach it to your MT5 charts.
            </p>

            {isInactive ? (
              <button
                disabled
                className="inline-flex items-center rounded bg-gray-200 text-gray-500 px-4 py-2 text-sm cursor-not-allowed"
              >
                Download disabled
              </button>
            ) : (
              <a
                href={`/download/${licenseKey}`}
                className="inline-flex items-center rounded bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800"
              >
                Download EA
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}