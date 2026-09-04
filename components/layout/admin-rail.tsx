"use client";

import { BriefcaseBusiness, Database, FileSpreadsheet, LogOut, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authApi } from "@/lib/api/auth-api";
import { getAuthSession } from "@/lib/auth-session";

const navigation = [
  { href: "/staff", label: "Staff", icon: UsersRound },
  { href: "/companies", label: "Company", icon: BriefcaseBusiness },
  { href: "/templates", label: "Template", icon: FileSpreadsheet },
  { href: "/master-data", label: "Master Data", icon: Database },
];

function Mark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M25.2 4.5c8.8 4.8 15.1 12.4 17.1 21.3-4.4-2.2-9.5-2.7-14.4-1.2-7.6 2.3-12.7 8.3-14.2 15.5C7.4 36.9 3.5 30.4 3.5 23.5c0-7.9 4.9-14.6 11.8-17.4-.8 6 .8 11.6 4.4 15.4.8-7 2.5-12.7 5.5-17Z" />
      <path d="M41.9 30.3c-5.2-1.8-10.9-1.3-15.2 1.8-3.8 2.8-6 7-6.3 11.4 8.7 1.8 17.7-3.2 21.5-13.2Z" />
    </svg>
  );
}

export function AdminRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const session = menuOpen ? getAuthSession() : null;
  const fullName = session
    ? [session.admin.title, session.admin.firstName, session.admin.lastName].filter(Boolean).join(" ")
    : "";
  const initials = session
    ? `${session.admin.firstName.at(0) ?? ""}${session.admin.lastName.at(0) ?? ""}`.toUpperCase()
    : "";

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      profileButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    logoutButtonRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function logout() {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      setMenuOpen(false);
      router.replace("/login");
    }
  }
  return (
    <aside className="admin-rail" aria-label="Admin navigation">
      <Link href="/staff" className="rail-mark" aria-label="CarbonProfile admin"><Mark /></Link>
      <nav>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-label={item.label} title={item.label}><Icon size={18} strokeWidth={1.7} /></Link>;
        })}
      </nav>
      <div className="rail-user" ref={accountRef}>
        <button
          ref={profileButtonRef}
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title="Account"
          className={menuOpen ? "active" : ""}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <UserRound size={20} />
        </button>
        {menuOpen && session && (
          <section className="account-menu" role="menu" aria-label="Account menu">
            <div className="account-menu__identity">
              <span className="account-menu__avatar" aria-hidden="true">{initials || <UserRound size={20} />}</span>
              <div>
                <strong>{fullName || session.admin.email}</strong>
                <span>{session.admin.email}</span>
              </div>
            </div>
            <button
              ref={logoutButtonRef}
              className="account-menu__logout"
              role="menuitem"
              onClick={logout}
              disabled={loggingOut}
            >
              <LogOut size={17} />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </section>
        )}
      </div>
    </aside>
  );
}
