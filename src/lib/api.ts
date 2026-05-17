// src/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response) {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    return j?.detail ? String(j.detail) : text;
  } catch {
    return text;
  }
}

export async function getJSON<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const token = init?.token ?? null;

  // strip token out before passing to fetch
  const { token: _ignore, ...fetchInit } = (init || {}) as any;

  // optional debug (server-side only)
  if (typeof window === "undefined") {
    console.log("[getJSON]", path);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...fetchInit,
    headers: {
      ...(fetchInit.headers || {}),
      ...authHeaders(token),
    },
  });

  if (!res.ok) throw new Error(`${res.status} ${await parseError(res)}`);
  return (await res.json()) as T;
}

export async function postJSON<T>(
  path: string,
  body: unknown,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const token = init?.token ?? null;

  // strip token out before passing to fetch
  const { token: _ignore, ...fetchInit } = (init || {}) as any;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    ...fetchInit,
    headers: {
      "content-type": "application/json",
      ...(fetchInit.headers || {}),
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`${res.status} ${await parseError(res)}`);
  return (await res.json()) as T;
}

/* =========================
   Types (shared DTOs)
========================= */

export type LicenseDTO = {
  plan: string;
  status: string;
  expires_at: string | null;
  pairs: string;
  max_pairs: number;
  optimizations_policy: string;
  priority_support: boolean;
  license_key: string;
  download_url: string;
  account_locked_to: string | null;
};

export type PresetDTO = {
  id: string;
  pair: string;
  version: number | string;
  params: Record<string, any>;
  metrics?: Record<string, any>;
  created_at?: string;
  created_by?: string;
  window?: string;
};

export type OptimizationResultDTO = {
  job_id: string;
  status: "queued" | "finished" | string;
  results?: any;
};

/* =========================
   License (secure)
========================= */

export async function fetchLicense(
  licenseKey: string,
  token?: string | null
): Promise<LicenseDTO> {
  return getJSON<LicenseDTO>(`/me/license/${encodeURIComponent(licenseKey)}`, {
    token,
  });
}

export async function updatePairs(
  licenseKey: string,
  pairs: string[],
  token?: string | null
): Promise<{ ok: boolean; pairs: string; max_pairs: number }> {
  return postJSON<{ ok: boolean; pairs: string; max_pairs: number }>(
    "/me/update-pairs",
    { license_key: licenseKey, pairs },
    { token }
  );
}

/* =========================
   Stripe / Billing
========================= */
export async function getLicenseBySession(sessionId: string) {
  return getJSON<{ license_key: string; status: string; expires_at: string; plan: string }>(
    `/checkout/license-by-session?session_id=${encodeURIComponent(sessionId)}`
  );
}

export async function createCheckout(
  email: string,
  priceId: string,
  clerkUserId?: string | null,
  token?: string | null
): Promise<{ checkout_url: string }> {
  return postJSON<{ checkout_url: string }>(
    "/stripe/create-checkout",
    {
      email,
      price_id: priceId,
      clerk_user_id: clerkUserId ?? "",
    },
    { token }
  );
}

export async function createPortal(
  licenseKey: string,
  token?: string | null
): Promise<{ url: string }> {
  return postJSON<{ url: string }>(
    "/me/create-portal",
    { license_key: licenseKey },
    { token }
  );
}

export async function resendLicenseEmail(
  licenseKey: string,
  token?: string | null
): Promise<{ ok: boolean; sent_to?: string }> {
  return postJSON<{ ok: boolean; sent_to?: string }>(
    "/me/resend-license",
    { license_key: licenseKey },
    { token }
  );
}

/* =========================
   Presets & Optimization
========================= */

export async function listPresets(
  pair: string,
  token?: string | null
): Promise<{ pair: string; presets: PresetDTO[] }> {
  // backend: GET /portal/presets?pair=EURUSD
  return getJSON<{ pair: string; presets: PresetDTO[] }>(
    `/portal/presets?pair=${encodeURIComponent(pair)}`,
    { token }
  );
}

export async function applyPreset(
  licenseKey: string,
  pair: string,
  version: string,
  token?: string | null
): Promise<{ ok: boolean; pair: string; presetVer: string }> {
  // backend: POST /portal/presets/apply
  return postJSON<{ ok: boolean; pair: string; presetVer: string }>(
    "/portal/presets/apply",
    {
      license_key: licenseKey,
      pair,
      version,
    },
    { token }
  );
}

export async function runOptimization(
  licenseKey: string,
  pair: string,
  objective: string = "pf",
  token?: string | null
): Promise<{ job_id: string; status: string }> {
  // backend: POST /portal/optimization/run
  return postJSON<{ job_id: string; status: string }>(
    "/portal/optimization/run",
    {
      license_key: licenseKey,
      pair,
      objective,
    },
    { token }
  );
}

export async function getOptimizationResult(
  jobId: string,
  token?: string | null
): Promise<OptimizationResultDTO> {
  // backend: GET /portal/optimization/result/{job_id}
  return getJSON<OptimizationResultDTO>(
    `/portal/optimization/result/${encodeURIComponent(jobId)}`,
    { token }
  );
}

/* =========================
   Download
========================= */

export async function getDownloadRedirect(
  licenseKey: string,
  token?: string | null
): Promise<{ url: string }> {
  // backend: GET /portal/download?license_key=...
  return getJSON<{ url: string }>(
    `/portal/download?license_key=${encodeURIComponent(licenseKey)}`,
    { token }
  );
}