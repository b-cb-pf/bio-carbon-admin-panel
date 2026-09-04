import type { ReactNode } from "react";
import { AdminRail } from "@/components/layout/admin-rail";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="admin-layout">
        <AdminRail />
        <main className="admin-main">{children}</main>
      </div>
    </AuthGuard>
  );
}
