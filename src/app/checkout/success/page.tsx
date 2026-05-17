"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLicenseBySession, resendLicenseEmail } from "@/lib/api";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared message slot for copy/resend feedback
  const [msg, setMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // polling control
  const pollTimerRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  const stoppedRef = useRef(false);

  const MAX_ATTEMPTS = 15; // 15 * 2s = ~30 seconds
  const POLL_MS = 2000;

  async function resolveOnce(sid: string) {
    try {
      const lic = await getLicenseBySession(sid);
      setLicenseKey(lic.license_key);
      setError(null);
      return true;
    } catch (e: any) {
      const m = String(e?.message || "");
      // Most common is 404 "License not ready yet"
      if (m.startsWith("404")) {
        setError(
          "Your payment succeeded, but your license is still being prepared. Please refresh in a moment."
        );
      } else {
        setError(m || "Failed to resolve license.");
      }
      return false;
    }
  }

  async function startResolveFlow(sid: string) {
    // reset state for a fresh run
    setLoading(true);
    setMsg(null);
    setLicenseKey(null);
    attemptsRef.current = 0;
    stoppedRef.current = false;

    // try immediately
    const ok = await resolveOnce(sid);
    setLoading(false);

    if (ok) return;

    // begin polling
    pollTimerRef.current = window.setInterval(async () => {
      if (stoppedRef.current) return;

      attemptsRef.current += 1;

      const success = await resolveOnce(sid);

      if (success) {
        stoppedRef.current = true;
        if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
        return;
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        stoppedRef.current = true;
        if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;

        setError(
          "Still preparing your license. If this persists, your webhook might not have fired. Try again shortly or check Stripe CLI forwarding."
        );
      }
    }, POLL_MS);
  }

  useEffect(() => {
    if (!sessionId) {
      setError("Missing Stripe session ID.");
      setLoading(false);
      return;
    }

    startResolveFlow(sessionId);

    return () => {
      stoppedRef.current = true;
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function onRefresh() {
    if (!sessionId) return;
    // stop any existing poll loop then restart
    stoppedRef.current = true;
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    pollTimerRef.current = null;

    await startResolveFlow(sessionId);
  }

  async function onCopy() {
    if (!licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseKey);
      setMsg("Copied license key ✅");
      setTimeout(() => setMsg(null), 1500);
    } catch {
      setMsg("Couldn’t copy automatically — please copy manually.");
      setTimeout(() => setMsg(null), 2500);
    }
  }

  async function onResend() {
    if (!licenseKey) return;
    setResending(true);
    setMsg(null);
    try {
      await resendLicenseEmail(licenseKey);
      setMsg("License email sent successfully.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to resend license email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">
          Payment Successful ✅
        </h1>

        {loading && (
          <p className="text-sm text-gray-600 text-center">
            Finalizing your license…
          </p>
        )}

        {!loading && error && !licenseKey && (
          <>
            <p className="text-sm text-red-600 text-center">{error}</p>

            <button
              type="button"
              onClick={onRefresh}
              className="w-full rounded border py-2 text-sm hover:bg-gray-100"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded border py-2 text-sm hover:bg-gray-100"
            >
              Back to portal home
            </button>
          </>
        )}

        {!loading && licenseKey && (
          <>
            <p className="text-sm text-gray-700">
              Your Algo Pro license has been created:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onCopy}
                className="w-full rounded border py-2 text-sm hover:bg-gray-100"
              >
                Copy license key
              </button>

              <pre className="text-xs bg-gray-100 rounded px-3 py-2 break-all font-mono">
                {licenseKey}
              </pre>
            </div>

            <p className="text-xs text-gray-600">
              We’ve emailed this to you. If you didn’t receive it:
            </p>

            <button
              onClick={onResend}
              disabled={resending}
              className="w-full rounded border py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend license email"}
            </button>

            {msg && (
              <div className="text-xs text-gray-600 text-center">{msg}</div>
            )}

            <button
              type="button"
              onClick={() => router.push(`/license/${licenseKey}`)}
              className="w-full rounded bg-black text-white py-2 text-sm hover:bg-neutral-800"
            >
              Open Algo Pro Portal
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded border py-2 text-sm hover:bg-gray-100"
            >
              Back to portal home
            </button>
          </>
        )}

        {sessionId && (
          <p className="text-[10px] text-gray-400 text-center">
            Stripe session: <span className="font-mono">{sessionId}</span>
          </p>
        )}
      </div>
    </main>
  );
}