"use client";

import { useState } from "react";
import { createCheckout } from "@/lib/api";

type Plan = {
  id: string;
  name: string;
  priceId: string;
  priceLabel: string;
  blurb: string;
  bullets: string[];
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    priceId: "price_1SMxUT2L1OGIrdKU2l6P4yev",
    priceLabel: "$49.99 / month",
    blurb: "Perfect for a single pair / starter account.",
    bullets: [
      "Up to 2 pairs selectable",
      "1 optimization per year",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceId: "price_1SN1B82L1OGIrdKUxo1dQFI4",
    priceLabel: "$99.99 / month",
    blurb: "For traders running multiple pairs.",
    bullets: [
      "Up to 5 pairs selectable",
      "Unlimited optimizations (up to 5 pairs)",
      "Priority queue for updates",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    priceId: "price_1SN1Hw2L1OGIrdKUZ0HUSf5Z",
    priceLabel: "$199.99 / month",
    blurb: "Max control + all pairs unlocked.",
    bullets: [
      "All pairs unlocked",
      "Priority optimization & support",
      "Best for prop / multi-account setups",
    ],
  },
];

export default function CheckoutClient() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Plan | null>(PLANS[1]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubscribe() {
    if (!selected) return;

    const finalEmail = email.trim();

    if (!finalEmail) {
      setError("Please enter your email.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { checkout_url } = await createCheckout(
        finalEmail,
        selected.priceId,
        null,
        null
      );

      window.location.href = checkout_url;
    } catch (e: any) {
      console.error(e);

      setError(
        e?.message ?? "Failed to create checkout."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-semibold">
          Subscribe to Algo Pro
        </h1>

        <p className="text-sm text-gray-600">
          Enter your email, pick a plan, and we&apos;ll send your
          license key + EA download automatically after payment.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Email for your license
          </label>

          <input
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const active = selected?.id === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan)}
                className={
                  "border rounded-xl p-4 text-left space-y-2 transition " +
                  (active
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white hover:border-black/70")
                }
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">
                    {plan.name}
                  </span>

                  <span className="text-xs opacity-80">
                    {plan.priceLabel}
                  </span>
                </div>

                <p
                  className={
                    "text-xs " +
                    (active
                      ? "text-gray-100"
                      : "text-gray-600")
                  }
                >
                  {plan.blurb}
                </p>

                <ul className="text-xs list-disc list-inside space-y-1">
                  {plan.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            You&apos;ll be redirected to Stripe Checkout in test mode.
          </p>

          <button
            type="button"
            onClick={onSubscribe}
            disabled={busy || !selected}
            className="px-5 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
          >
            {busy
              ? "Redirecting…"
              : `Continue with ${selected?.name ?? ""}`}
          </button>
        </div>
      </div>
    </main>
  );
}