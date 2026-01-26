"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDefaultModule } from "@/lib/storage/preferences";
import { resolveDefaultRoute } from "@/lib/navigation/default-route";
import { getLastVisitedRoute } from "@/lib/storage/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const lastVisited = getLastVisitedRoute();
    if (lastVisited) {
      router.replace(lastVisited);
      return;
    }

    const storedDefault = getDefaultModule();
    router.replace(resolveDefaultRoute(storedDefault));
  }, [router]);

  return null;
}
