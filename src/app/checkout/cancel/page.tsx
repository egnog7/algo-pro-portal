// src/app/checkout/cancel/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6 space-y-5">
        <h1 className="text-2xl font-semibold text-center">
          Checkout cancelled
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Your payment was cancelled before completion. No charges were made and
          no license key was issued.
        </p>

        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium mb-1">What would you like to do next?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Return to pricing and choose a plan</li>
            <li>Open the license portal if you already have a key</li>
            <li>Come back later — nothing has been saved</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            className="flex-1 px-4 py-2 rounded border text-sm hover:bg-gray-100"
            onClick={() => router.push("/checkout")}
          >
            View plans & checkout
          </button>

          <button
            className="flex-1 px-4 py-2 rounded bg-black text-white text-sm hover:bg-neutral-800"
            onClick={() => router.push("/")}
          >
            Go to license portal
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center pt-2">
          Need help? If you encountered an issue during checkout, you can safely
          retry or contact support.
        </p>
      </div>
    </main>
  );
}
