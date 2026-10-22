"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { maintenanceText as t } from "@/lib/maintenance-i18n";

export function MaintenanceDrawer({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="maintenance-drawer-backdrop">
      <section
        ref={ref}
        className="maintenance-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        onKeyDown={(event) => {
          if ((event.target as HTMLElement).closest('[role="dialog"]') !== ref.current) return;
          if (event.key === "Escape" && !busy) {
            event.stopPropagation();
            onClose();
          }
          if (event.key !== "Tab") return;
          const controls = Array.from(
            ref.current!.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, a[href], [tabindex="0"]',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = controls[0],
            last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <header>
          <h2 id={id}>{title}</h2>
          <button className="icon-button" aria-label={t("Close")} disabled={busy} onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <div className="maintenance-drawer-body">{children}</div>
      </section>
    </div>
  );
}
