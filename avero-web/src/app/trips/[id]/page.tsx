import { Suspense } from "react";
import TripDetailClient from "./TripDetailClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading trip...</div>}>
      <TripDetailClient />
    </Suspense>
  );
}
