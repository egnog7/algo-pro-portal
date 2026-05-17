// src/app/license/[licenseKey]/presets/page.tsx
import PresetsClient from "../ui/PresetsClient";

export default async function PresetsPage({
  params,
}: {
  params: Promise<{ licenseKey: string }>;
}) {
  const { licenseKey } = await params;

  if (!licenseKey) {
    return (
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-medium mb-1">Presets &amp; optimization</h2>
        <p className="text-sm text-red-600">Missing license key in route.</p>
      </section>
    );
  }

  return <PresetsClient licenseKey={licenseKey} />;
}
