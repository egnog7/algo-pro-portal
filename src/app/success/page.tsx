export default function SuccessPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Payment successful 🎉</h1>
      <p className="mt-2 text-gray-700">
        We’ve emailed your license key and download link. Open MT5 and activate using that same key.
      </p>
      <p className="mt-6">
        Lost the email? Once you know your key, visit <code>/license/&lt;YOUR-KEY&gt;</code> to manage pairs and downloads.
      </p>
    </main>
  );
}
