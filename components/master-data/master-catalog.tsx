"use client";

import { useEffect, useState } from "react";
import { masterDataApi, type MasterWorksheetPage } from "@/lib/api/master-data-api";
import { apiErrorMessage } from "@/lib/api/client";
import { maintenanceText as t } from "@/lib/maintenance-i18n";
import { Pagination } from "@/components/ui/pagination";

export function MasterCatalog({ versionId, tab }: { versionId: string; tab: string }) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const key = `${versionId}:${tab}:${page}:${revision}`;
  const [result, setResult] = useState<{ key: string; data?: MasterWorksheetPage; error?: string } | null>(null);
  const data = result?.key === key ? result.data : undefined;
  const error = result?.key === key ? result.error : undefined;
  useEffect(() => {
    let active = true;
    masterDataApi
      .worksheetPage(versionId, tab, page, 10)
      .then((data) => {
        if (active) setResult({ key, data });
      })
      .catch((reason) => {
        if (active) setResult({ key, error: apiErrorMessage(reason, t("Load worksheets failed")) });
      });
    return () => {
      active = false;
    };
  }, [key, page, tab, versionId]);
  if (error)
    return (
      <div role="alert" className="maintenance-alert maintenance-alert--error">
        {error}{" "}
        <button className="button button--secondary" onClick={() => setRevision((value) => value + 1)}>
          {t("Retry")}
        </button>
      </div>
    );
  if (!data) return <p role="status">{t("Loading")}</p>;
  return (
    <>
      <p className="master-group-help">{t("Uploaded worksheet explanation")}</p>
      {tab === "master_global_warming_potential" && <p className="master-group-help">{t("GWP source guidance")}</p>}
      <section className="admin-card table-panel">
        <div className="table-wrap" tabIndex={0} role="region" aria-label={tab}>
          <table className="admin-table master-worksheet-table">
            <thead>
              <tr>
                <th>{t("Excel row")}</th>
                {data.columns.map((column) => (
                  <th key={column.index}>{column.name || `${t("Column")} ${column.index}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!data.items.length ? (
                <tr>
                  <td colSpan={data.columns.length + 1} className="empty-cell">
                    {t("Empty worksheet")}
                  </td>
                </tr>
              ) : (
                data.items.map((row) => (
                  <tr key={row.sourceRow}>
                    <td>{row.sourceRow}</td>
                    {data.columns.map((column, index) => {
                      const value = row.values[index];
                      const formula = row.formulas[String(column.index)];
                      return (
                        <td key={column.index}>
                          {value === null || value === "" ? "—" : String(value)}
                          {formula && (
                            <details>
                              <summary>{t("Excel formula")}</summary>
                              <code>={formula}</code>
                            </details>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination
        from={(page - 1) * 10 + 1}
        to={Math.min(page * 10, data.total)}
        total={data.total}
        page={page}
        onPrevious={() => setPage((value) => Math.max(1, value - 1))}
        onNext={() => setPage((value) => value + 1)}
      />
    </>
  );
}
