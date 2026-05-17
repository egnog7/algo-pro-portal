export type LicenseDTO = {
  plan: string;
  status: string;
  expires_at: string | null;
  pairs: string;
  max_pairs: number;
  optimizations_policy: string | null;
  priority_support: boolean;
  license_key: string;
  download_url: string;
  account_locked_to: string | null;
};