"use client";

import { useState } from "react";
import { postJSON } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const ALL = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "XAUUSD",
  "AUDUSD",
  "NZDUSD",
  "USDCAD",
  "GBPJPY",
  "EURJPY",
  "AUDJPY",
];

type Props = {
  licenseKey: string;
  currentPairsCSV: string;
  maxPairs: number;
  /** optional: show a Download EA button if provided */
  downloadUrl?: string;
};

export default function LicenseEditor({
  licenseKey,
  currentPairsCSV,
  maxPairs,
  downloadUrl,
}: Props) {
  const { getToken } = useAuth(); // ✅ add

  const [sel, setSel] = useState<string[]>(
    currentPairsCSV.split(",").filter(Boolean)
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(p: string) {
    setSel((old) => (old.includes(p) ? old.filter((x) => x !== p) : [...old, p]));
  }

  async function save() {
    if (sel.length > maxPairs) {
      setMsg(`Too many pairs selected (max ${maxPairs})`);
      return;
    }
    setSaving(true);
    setMsg(null);

    try {
      const token = await getToken(); // ✅ add
      if (!token) {
        setMsg("401 Missing bearer token (not signed in)");
        return;
      }

      const res = await postJSON<{ ok: boolean; pairs: string }>(
        "/me/update-pairs",
        { license_key: licenseKey, pairs: sel },
        { token } // ✅ add
      );

      setMsg(res.ok ? "Saved ✅" : "Failed to save");
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Max pairs: {maxPairs}</div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="rounded bg-black text-white px-3 py-2 text-sm"
          >
            Download EA
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {ALL.map((p) => (
          <button
            key={p}
            onClick={() => toggle(p)}
            className={`rounded border px-3 py-2 text-sm ${
              sel.includes(p) ? "bg-black text-white" : "bg-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded bg-black text-white px-4 py-2"
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {msg && <div className="text-sm">{msg}</div>}
    </section>
  );
}