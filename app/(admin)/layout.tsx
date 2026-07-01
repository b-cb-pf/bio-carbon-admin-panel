import type { ReactNode } from "react";
import { AdminRail } from "@/components/layout/admin-rail";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminRail />
      <main className="admin-main">{children}</main>
    </div>
  );
}
