"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => Boolean(getAuthSession()),
    () => false,
  );

  useEffect(() => {
    if (!getAuthSession()) {
      router.replace("/login");
      return;
    }
  }, [ready, router]);

  if (!ready) return <main className="admin-main auth-checking">Checking session…</main>;
  return children;
}
