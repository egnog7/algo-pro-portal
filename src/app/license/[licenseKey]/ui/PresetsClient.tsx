"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  listPresets,
  applyPreset,
  runOptimization,
  getOptimizationResult,
  type ApplyPresetResp,
  type RunOptResp,
  type OptResult,
} from "@/lib/api";

type PresetItem = {
  id: string;
  version?: number;
  window?: string;
  metrics?: { pf: number; wr: number; maxdd: number };
  pf?: number;
  wr?: number;
  maxdd?: number;
};

const PAIRS = [
  "EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD","NZDUSD","USDCAD","GBPJPY","EURJPY","AUDJPY",
];

type OptPhase = "idle" | "queued" | "running" | "done" | "error";

export default function PresetsClient({ licenseKey }: { licenseKey: string }) {
  const { getToken } = useAuth();

  const [pair, setPair] = useState<string>("EURUSD");
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [optPhase, setOptPhase] = useState<OptPhase>("idle");

  function pf(p: PresetItem) { return p.metrics?.pf ?? p.pf ?? 0; }
  function wr(p: PresetItem) { return p.metrics?.wr ?? p.wr ?? 0; }
  function dd(p: PresetItem) { return p.metrics?.maxdd ?? p.maxdd ?? 0; }

  async function refresh() {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      const data = await listPresets(pair, token);
      setPresets((data?.presets as PresetItem[]) ?? []);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to load presets.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { refresh(); }, [pair]);

  async function onApply(presetId: string) {
    setBusy(true);
    setMsg("Applying preset…");
    try {
      const token = await getToken();
      const res: ApplyPresetResp = await applyPreset(licenseKey, pair, presetId, token);
      setMsg(`Applied. New presetVer: ${res.presetVer}`);
    } catch (e: any) {
      setMsg(e.message || "Failed to apply preset");
    } finally {
      setBusy(false);
    }
  }

  async function onOptimize() {
    setBusy(true);
    setOptPhase("queued");
    setMsg("Submitting optimization…");
    try {
      const token = await getToken();
      const job: RunOptResp = await runOptimization(licenseKey, pair, token);
      setOptPhase("running");

      const res: OptResult = await getOptimizationResult(job.job_id, token);

      if (res.results?.top?.length) {
        const top = res.results.top[0];
        setMsg(`Optimization finished. Top PF=${top.pf.toFixed(2)}, WR=${(top.wr * 100).toFixed(1)}%`);
        setOptPhase("done");
        await refresh();
      } else {
        setMsg(`Job status: ${res.status}`);
        setOptPhase("done");
      }
    } catch (e: any) {
      setMsg(e.message || "Optimization failed");
      setOptPhase("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-4">
      {/* ...same JSX as before... */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium mb-1">Presets &amp; optimization</h2>
          <p className="text-xs text-gray-500">
            Load tuned parameter sets per pair and push them directly to your EA for license{" "}
            <span className="font-mono">{licenseKey}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Pair</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
            >
              {PAIRS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-60"
            onClick={onOptimize}
            disabled={busy}
          >
            Run optimization (stub)
          </button>

          {optPhase !== "idle" && (
            <span className="text-xs text-gray-500">Status: {optPhase}</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        {busy && <div className="text-sm text-gray-500">Loading…</div>}
        {msg && <div className="text-sm text-blue-700 mt-1">{msg}</div>}

        <div className="mt-4 grid grid-cols-1 gap-3">
          {presets.map((p) => (
            <div key={p.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">
                  {p.id} {p.version ? `· v${p.version}` : ""}
                </div>
                <button
                  className="px-3 py-1 border rounded text-xs md:text-sm disabled:opacity-60"
                  onClick={() => onApply(p.id)}
                  disabled={busy}
                >
                  Apply to {pair}
                </button>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                PF {pf(p).toFixed(2)} · WR {(wr(p) * 100).toFixed(1)}% · MaxDD {(dd(p) * 100).toFixed(1)}%
                {p.window ? <span> · {p.window}</span> : null}
              </div>
            </div>
          ))}

          {presets.length === 0 && !busy && (
            <div className="text-sm text-gray-500">No presets yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
