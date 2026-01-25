"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthTokens } from "@/lib/storage/auth";
import { getDefaultModule } from "@/lib/storage/preferences";
import { resolveDefaultRoute } from "@/lib/navigation/default-route";
import { getLastVisitedRoute } from "@/lib/storage/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }

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
