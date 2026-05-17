import { auth } from "@clerk/nextjs/server";
import { getJSON } from "./api";
import type { LicenseDTO } from "./api.types";

export async function fetchLicense(licenseKey: string): Promise<LicenseDTO> {
  const a = await auth();
  const token = await a.getToken();

  if (!a.userId || !token) {
    throw new Error("401 Unauthenticated");
  }

  try {
    return await getJSON<LicenseDTO>(
      `/me/license/${encodeURIComponent(licenseKey)}`,
      { token }
    );
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.startsWith("404")) throw new Error("LICENSE_NOT_FOUND");
    throw e;
  }
}