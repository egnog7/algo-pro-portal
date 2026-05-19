import { Suspense } from "react";
import DownloadSuccessClient from "./DownloadSuccessClient";

export default function DownloadSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadSuccessClient />
    </Suspense>
  );
}