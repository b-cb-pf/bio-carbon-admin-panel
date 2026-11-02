"use client";

import { useEffect, useState } from "react";
import { templateApi } from "@/lib/api/template-api";
import { apiErrorMessage } from "@/lib/api/client";
import type { MaintenanceLog } from "@/lib/types";
import { maintenanceText as t, maintenanceLocale } from "@/lib/maintenance-i18n";
import { Pagination } from "./pagination";

export function MaintenanceLogTable({
  entityType,
  revision = 0,
}: {
  entityType: "template" | "master-data";
  revision?: number;
}) {
  const [page, setPage] = useState(1);
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [result, setResult] = useState<{ key: string; items: MaintenanceLog[]; total: number } | null>(null);
  const [error, setError] = useState("");
  const key = JSON.stringify({ entityType, page, startDate, endDate, revision });
  useEffect(() => {
    let active = true;
    templateApi
      .logPage(entityType, page, startDate, endDate)
      .then((data) => {
        if (active) {
          setResult({ ...data, key });
          setError("");
        }
      })
      .catch((reason) => {
        if (active) setError(apiErrorMessage(reason, t("Load history failed")));
      });
    return () => {
      active = false;
    };
  }, [entityType, page, startDate, endDate, key]);
  const loaded = result?.key === key;
  return (
    <section className="maintenance-history">
      <div className="maintenance-section-heading">
        <h2>{t("Activity log")}</h2>
        <div className="maintenance-date-filter">
          <span>{t("Filter")}</span>
          <input
            type="date"
            aria-label={t("Start date")}
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => {
              setStart(e.target.value);
              setPage(1);
            }}
          />
          <span>–</span>
          <input
            type="date"
            aria-label={t("End date")}
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEnd(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="admin-card table-panel">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {["Date and time", "Staff", "Activity", "Detail"].map((label) => (
                  <th key={label}>{t(label)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={4}>{t("Loading")}</td>
                </tr>
              ) : result.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    {t("ยังไม่มีกิจกรรม")}
                  </td>
                </tr>
              ) : (
                result.items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Intl.DateTimeFormat(maintenanceLocale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Bangkok",
                      }).format(new Date(row.createdAt))}
                    </td>
                    <td>{row.staffName || t("System")}</td>
                    <td>{t(row.action)}</td>
                    <td>
                      {[row.detail.versionLabel, row.detail.fileName, row.detail.factorKey]
                        .filter((value) => typeof value === "string")
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        page={page}
        from={(page - 1) * 10 + 1}
        to={Math.min(page * 10, result?.total ?? 0)}
        total={result?.total ?? 0}
        onPrevious={loaded ? () => setPage(page - 1) : undefined}
        onNext={loaded ? () => setPage(page + 1) : undefined}
      />
    </section>
  );
}
