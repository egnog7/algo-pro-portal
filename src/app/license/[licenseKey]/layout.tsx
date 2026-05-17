import { ReactNode } from "react";
import { getJSON } from "@/lib/api";
import AuthUser from "@/app/components/AuthUser";
import { auth } from "@clerk/nextjs/server";

type LicenseDTO = {
  plan: string;
  status: string;
  expires_at: string;
  pairs: string;
  max_pairs: number;
  optimizations_policy: string;
  priority_support: boolean;
  license_key: string;
  download_url: string;
  account_locked_to: string | null;
};

type LoadError = "NOT_FOUND" | "GENERIC" | "UNAUTH";

export default async function LicenseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ licenseKey: string }>;
}) {
  const { licenseKey } = await params;

  // ✅ IMPORTANT: your Clerk auth() is async in this project
  const a = await auth();
  const token = a.userId ? await a.getToken() : null;

  let data: LicenseDTO | null = null;
  let error: LoadError | null = null;

  try {
    data = await getJSON<LicenseDTO>(
  `/me/license/${encodeURIComponent(licenseKey)}`,
  { token }
);
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.startsWith("401")) error = "UNAUTH";
    else if (msg.startsWith("404")) error = "NOT_FOUND";
    else error = "GENERIC";
  }

  
  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-xl font-semibold">License check failed</h1>

          {error === "UNAUTH" ? (
            <>
              <p className="text-sm text-gray-700">
                You’re not signed in. Please sign in to view this license.
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
                This might be a temporary API issue. Try again in a moment.
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

  const todayISO = new Date().toISOString().slice(0, 10);
  const isExpired = !!data.expires_at && data.expires_at < todayISO;
  const isSuspended = (data.status || "").toLowerCase() === "suspended";
  const isInactive = isSuspended || isExpired;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Algo Pro · {data.license_key}</h1>
          <p className="text-sm text-gray-600">
            Plan: {data.plan} • Status: {data.status} • Expires: {data.expires_at}
          </p>
          {data.account_locked_to && (
            <p className="text-xs text-gray-500 mt-1">
              Locked to: {data.account_locked_to}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-700">
              Max pairs: {data.max_pairs}
            </span>
            <span
              className={`text-xs rounded-full px-2 py-1 ${
                data.priority_support
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {data.priority_support ? "Priority support" : "Standard support"}
            </span>
          </div>

          <AuthUser />
        </div>
      </header>

      {/* banners */}
      {isSuspended && (
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="font-medium text-red-800">License suspended</div>
            <div className="text-sm text-red-700 mt-1">
              Your subscription appears inactive or payment failed. Restore access
              via <span className="font-medium">Manage Subscription</span>.
            </div>
          </div>
        </div>
      )}

      {!isSuspended && isExpired && (
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="font-medium text-amber-900">License expired</div>
            <div className="text-sm text-amber-800 mt-1">
              This license has passed its expiry date. Renew your subscription to restore access.
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white border-b px-6">
        <ul className="flex flex-wrap gap-2 py-2 text-sm">
          <li>
            <a
              href={`/license/${licenseKey}`}
              className="px-3 py-2 rounded hover:bg-gray-100"
            >
              Overview
            </a>
          </li>

          {isInactive ? (
            <>
              <li>
                <span className="px-3 py-2 rounded text-gray-400 cursor-not-allowed">
                  Manage pairs
                </span>
              </li>
              <li>
                <span className="px-3 py-2 rounded text-gray-400 cursor-not-allowed">
                  Presets &amp; optimization
                </span>
              </li>
              <li>
                <span className="px-3 py-2 rounded text-gray-400 cursor-not-allowed">
                  Download EA
                </span>
              </li>
            </>
          ) : (
            <>
              <li>
                <a
                  href={`/license/${licenseKey}/pairs`}
                  className="px-3 py-2 rounded hover:bg-gray-100"
                >
                  Manage pairs
                </a>
              </li>
              <li>
                <a
                  href={`/license/${licenseKey}/presets`}
                  className="px-3 py-2 rounded hover:bg-gray-100"
                >
                  Presets &amp; optimization
                </a>
              </li>
              <li>
                <a
                  href={`/download/${licenseKey}`}
                  className="px-3 py-2 rounded hover:bg-gray-100"
                >
                  Download EA
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="flex-1 px-6 py-6">{children}</div>
    </main>
  );
}
