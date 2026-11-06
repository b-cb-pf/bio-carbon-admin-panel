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
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      const session = getAuthSession();
      if (!session) {
        window.location.replace("/login?reason=session-expired");
        return;
      }
      timer = setTimeout(check, Math.min(Date.parse(session.expiresAt) - Date.now(), 2147483647));
    };
    check();
    window.addEventListener("focus", check);
    window.addEventListener("storage", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [ready, router]);

  if (!ready) return <main className="admin-main auth-checking">Checking session…</main>;
  return children;
}
