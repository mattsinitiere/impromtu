import { Suspense } from "react";
import HomeApp from "@/components/HomeApp";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeApp />
    </Suspense>
  );
}
