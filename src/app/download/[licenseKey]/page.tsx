// src/app/download/[licenseKey]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDownloadRedirect } from "@/lib/api";

type Status = "starting" | "opening" | "manual" | "done" | "error";

export default function DownloadPage({
  params,
}: {
  params: Promise<{ licenseKey: string }>;
}) {
  const { licenseKey } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<Status>("starting");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function go() {
      try {
        setStatus("starting");

        const { url } = await getDownloadRedirect(licenseKey);
        if (cancelled) return;

        setDownloadUrl(url);

        // Try open in a new tab so THIS page can stay and redirect cleanly.
        setStatus("opening");
        const w = window.open(url, "_blank");

        // Popup blocked → switch to manual download mode (don’t navigate away)
        if (!w) {
          setStatus("manual");
          return;
        }

        // Give the browser a moment to start the download, then go to success page.
        setTimeout(() => {
          if (cancelled) return;
          setStatus("done");
          router.replace(
            `/download-success?license_key=${encodeURIComponent(licenseKey)}`
          );
        }, 900);
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    }

    go();
    return () => {
      cancelled = true;
    };
  }, [licenseKey, router]);

  const goSuccess = () => {
    router.replace(
      `/download-success?license_key=${encodeURIComponent(licenseKey)}`
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h1 className="text-xl font-semibold">Downloading your EA…</h1>

        {status === "starting" && (
          <p className="text-sm text-gray-600">
            Preparing your download for{" "}
            <span className="font-mono">{licenseKey}</span>.
          </p>
        )}

        {status === "opening" && (
          <p className="text-sm text-gray-600">
            Your download should start in a new tab. If nothing happens, your
            popup blocker may have blocked it.
          </p>
        )}

        {status === "manual" && (
          <>
            <p className="text-sm text-gray-600">
              Your popup blocker prevented the download tab from opening.
              Use the button below to download manually.
            </p>

            <div className="space-y-2">
              <a
                href={downloadUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center rounded bg-black text-white py-2 text-sm hover:bg-neutral-800"
              >
                Open download
              </a>

              <button
                type="button"
                onClick={goSuccess}
                className="w-full rounded border py-2 text-sm hover:bg-gray-100"
              >
                I’ve downloaded it — continue
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Tip: allow popups for this site to make downloads 1-click.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-red-600">
              We couldn’t generate a download link for this license.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded border py-2 text-sm hover:bg-gray-100"
            >
              Try again
            </button>
          </>
        )}

        <p className="text-[11px] text-gray-400">
          License: <span className="font-mono">{licenseKey}</span>
        </p>

        {/* Optional: always show a manual link when we have it */}
        {downloadUrl && status !== "manual" && status !== "error" && (
          <div className="pt-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-600 underline"
            >
              If your download didn’t start, click here.
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
