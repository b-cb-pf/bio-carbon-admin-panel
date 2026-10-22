"use client";

import { DeleteDraftButton } from "@/components/ui/delete-draft-button";

import { RefreshCw, Upload, Settings2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useState, useRef } from "react";
import { masterDataApi, type MasterDataFilters, type MasterWorksheetManifest } from "@/lib/api/master-data-api";
import { apiErrorMessage } from "@/lib/api/client";
import type { MasterDataRow, MasterDataVersion } from "@/lib/types";
import { maintenanceText as t } from "@/lib/maintenance-i18n";
import { ValidationReport } from "@/components/ui/validation-report";
import { PageHeading } from "@/components/ui/page-heading";

import { MaintenanceIcon } from "@/components/ui/maintenance-icon";
import { MaintenanceDrawer } from "@/components/ui/maintenance-drawer";
import { MaintenanceLogTable } from "@/components/ui/maintenance-log";
import { Pagination } from "@/components/ui/pagination";
import { MasterCatalog } from "./master-catalog";
import { EditFactorModal } from "./edit-factor-modal";
import { MasterDataGroups } from "./master-data-groups";

function Status({ value }: { value: MasterDataVersion["status"] }) {
  return <span className={`maintenance-status maintenance-status--${value}`}>{t(value)}</span>;
}

export function MasterDataScreen() {
  const [drawer, setDrawer] = useState<"versions" | "history" | null>(null);
  const [requestedTab, setTab] = useState("master_emission_factors");
  const [sourceView, setSourceView] = useState(false);
  const [factorPage, setFactorPage] = useState(1);
  const [catalogResult, setCatalogResult] = useState<{
    key: string;
    data?: MasterWorksheetManifest;
    error?: string;
  } | null>(null);
  const [grouped, setGrouped] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<MasterDataFilters>({});
  const [versions, setVersions] = useState<MasterDataVersion[]>([]);
  const [result, setResult] = useState<{ key: string; rows: MasterDataRow[]; total: number } | null>(null);
  const [revision, setRevision] = useState(0);
  const resultKey = `${JSON.stringify(filters)}:${revision}:${factorPage}`;
  const catalogKey = `${filters.versionId}:${revision}`;
  const manifest = catalogResult?.key === catalogKey ? catalogResult.data : undefined;
  const catalogError = catalogResult?.key === catalogKey ? catalogResult.error : undefined;
  const tabs = manifest?.sheets.map((sheet) => sheet.name) ?? ["master_emission_factors"];
  const tab = tabs.includes(requestedTab) ? requestedTab : tabs[0];
  const loading = !!filters.versionId && result?.key !== resultKey;
  const rows = result?.key === resultKey ? result.rows : [];
  const [versionLabel, setVersionLabel] = useState("EF-v1.0");
  const [editing, setEditing] = useState<MasterDataRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadVersions = useCallback(async () => {
    const data = await masterDataApi.versions();
    setVersions(data);
    setFilters((current) => (current.versionId || !data[0] ? current : { ...current, versionId: data[0].id }));
  }, []);
  const loadRows = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    masterDataApi
      .versions()
      .then((data) => {
        if (!active) return;
        setVersions(data);
        setFilters((current) => (current.versionId || !data[0] ? current : { ...current, versionId: data[0].id }));
      })
      .catch((reason: unknown) => {
        if (active) setError(apiErrorMessage(reason, t("โหลดเวอร์ชันไม่สำเร็จ")));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!filters.versionId) return;
    masterDataApi
      .page(filters, factorPage, 10)
      .then((data) => {
        if (active) {
          setResult({ key: resultKey, rows: data.items, total: data.total });
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setResult({ key: resultKey, rows: [], total: 0 });
          setError(apiErrorMessage(reason, t("โหลด Master Data ไม่สำเร็จ")));
        }
      });
    return () => {
      active = false;
    };
  }, [filters, resultKey, factorPage]);

  function updateFilter(key: keyof MasterDataFilters, value: string) {
    setError("");
    setEditing(null);
    setFactorPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      ...(key === "scopeNo" ? { categoryNo: undefined } : {}),
    }));
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const created = await masterDataApi.upload(file, versionLabel.trim());
      await loadVersions();
      setFactorPage(1);
      setFilters({ versionId: created.id });
    } catch (reason) {
      try {
        const latest = await masterDataApi.versions();
        setVersions(latest);
        if (latest[0]) setFilters({ versionId: latest[0].id });
      } catch {
        /* Keep the upload failure visible if refreshing also fails. */
      }
      setError(apiErrorMessage(reason, t("Import Master Data ไม่สำเร็จ")));
    } finally {
      setBusy(false);
    }
  }

  async function publish(id: string) {
    setBusy(true);
    setError("");
    try {
      await masterDataApi.publish(id);
      await loadVersions();
    } catch (reason) {
      setError(apiErrorMessage(reason, t("Publish Master Data ไม่สำเร็จ")));
    } finally {
      setBusy(false);
    }
  }

  const selectedVersion = versions.find((item) => item.id === filters.versionId);
  const catalogReady =
    !!selectedVersion && selectedVersion.status !== "pending" && !selectedVersion.deletionRequestedAt;
  useEffect(() => {
    let active = true;
    if (!filters.versionId || !catalogReady) return;
    masterDataApi
      .worksheets(filters.versionId)
      .then((data) => {
        if (active) setCatalogResult({ key: catalogKey, data });
      })
      .catch((reason) => {
        if (active) setCatalogResult({ key: catalogKey, error: apiErrorMessage(reason, t("Load worksheets failed")) });
      });
    return () => {
      active = false;
    };
  }, [catalogKey, catalogReady, filters.versionId]);
  const editable = selectedVersion?.status === "validated" && !selectedVersion.deletionRequestedAt;

  return (
    <div className="admin-container maintenance-page">
      <PageHeading
        icon={<MaintenanceIcon name="master" />}
        title={t("Master Data")}
        actions={
          <>
            <button className="maintenance-text-button" onClick={() => setDrawer("history")}>
              <MaintenanceIcon name="history" />
              {t("Activity log")}
            </button>
            <button className="button button--secondary" onClick={() => setDrawer("versions")}>
              <Settings2 size={16} />
              {t("Manage versions")}
            </button>
            <button
              aria-label={t("Refresh")}
              className="icon-button"
              onClick={() => {
                void Promise.all([loadVersions(), loadRows()]).catch(() => setError(t("โหลด Master Data ไม่สำเร็จ")));
              }}
            >
              <RefreshCw size={13} />
            </button>
          </>
        }
      />
      <div className="master-tab-bar">
        <button
          className="icon-button"
          aria-label={t("Previous tabs")}
          onClick={() => tabsRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
        >
          <ChevronLeft size={16} />
        </button>
        <div ref={tabsRef} className="master-dataset-tabs" role="tablist" aria-label={t("Master datasets")}>
          {tabs.map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          className="icon-button"
          aria-label={t("Next tabs")}
          onClick={() => tabsRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="maintenance-catalog-toolbar">
        <label>
          {t("Master data version")}
          <select
            aria-label={t("Master data version")}
            value={filters.versionId ?? ""}
            onChange={(event) => updateFilter("versionId", event.target.value)}
          >
            {!versions.length && <option value="">{t("No versions")}</option>}
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.versionLabel} · {t(version.status)}
              </option>
            ))}
          </select>
        </label>
        {tab === "master_emission_factors" && !sourceView && (
          <label className="maintenance-check">
            <input type="checkbox" checked={grouped} onChange={(event) => setGrouped(event.target.checked)} />
            {t("Group by scope and activity")}
          </label>
        )}
      </div>
      {drawer === "versions" && (
        <MaintenanceDrawer title={t("Manage versions")} busy={busy} onClose={() => setDrawer(null)}>
          <section className="maintenance-version-panel admin-card">
            <div>
              <strong>{t("Master Data versions")}</strong>
              <small>{t("Master version help")}</small>
            </div>
            <div className="maintenance-upload-actions">
              <input
                value={versionLabel}
                onChange={(event) => setVersionLabel(event.target.value)}
                aria-label={t("Master data version")}
              />
              <label className="button button--primary">
                <Upload size={13} />
                {busy ? t("กำลังตรวจ...") : t("Import XLSX")}
                <input
                  className="sr-only"
                  type="file"
                  accept=".xlsx"
                  disabled={busy || !versionLabel.trim()}
                  onChange={(event) => void upload(event)}
                />
              </label>
            </div>
            <div className="version-cards">
              {versions.map((version) => (
                <button
                  key={version.id}
                  className={filters.versionId === version.id ? "active" : ""}
                  onClick={() => updateFilter("versionId", version.id)}
                >
                  <span>
                    <strong>{version.versionLabel}</strong>
                    <small>
                      {version.fileName} · {version.rowCount} EF
                    </small>
                  </span>
                  <Status value={version.status} />
                </button>
              ))}
            </div>
            {selectedVersion?.status === "validated" && !selectedVersion.deletionRequestedAt && (
              <button
                className="button button--primary publish-master"
                disabled={busy}
                onClick={() => void publish(selectedVersion.id)}
              >
                {t("Publish this version")}
              </button>
            )}
            {selectedVersion && (
              <DeleteDraftButton
                key={selectedVersion.id}
                version={selectedVersion}
                remove={masterDataApi.deleteDraft}
                disabled={busy}
                onChanged={async () => {
                  const next = await masterDataApi.versions();
                  setVersions(next);
                  setEditing(null);
                  setFilters((current) => ({
                    ...current,
                    versionId: next.some((item) => item.id === current.versionId) ? current.versionId : next[0]?.id,
                  }));
                  loadRows();
                }}
              />
            )}
            {selectedVersion && <ValidationReport report={selectedVersion.validationReport} />}
            <p className="master-group-help">{t("Inactive import guidance")}</p>
          </section>
          {error && (
            <p role="alert" className="maintenance-alert maintenance-alert--error">
              {error}
            </p>
          )}
        </MaintenanceDrawer>
      )}
      {drawer === "history" && (
        <MaintenanceDrawer title={t("Activity log")} onClose={() => setDrawer(null)}>
          <MaintenanceLogTable entityType="master-data" revision={revision} />
        </MaintenanceDrawer>
      )}
      {error && <div className="maintenance-alert maintenance-alert--error">{error}</div>}
      {selectedVersion && ["published", "retired"].includes(selectedVersion.status) && (
        <p className="master-group-help">{t("Published master edit guidance")}</p>
      )}
      {catalogReady && !manifest && !catalogError && <p role="status">{t("Loading worksheets")}</p>}
      {catalogError && (
        <p role="alert" className="maintenance-alert maintenance-alert--error">
          {catalogError}
        </p>
      )}
      {manifest && tab === "master_emission_factors" && (
        <label className="maintenance-check master-source-toggle">
          <input type="checkbox" checked={sourceView} onChange={(event) => setSourceView(event.target.checked)} />
          {t("Show uploaded EF worksheet")}
        </label>
      )}
      {tab === "master_emission_factors" && !sourceView ? (
        <>
          <div className="master-filters">
            <select
              aria-label={t("Scope")}
              value={filters.scopeNo ?? ""}
              onChange={(event) => updateFilter("scopeNo", event.target.value)}
            >
              <option value="">{t("All scopes")}</option>
              <option value="1">{t("Scope")} 1</option>
              <option value="2">{t("Scope")} 2</option>
              <option value="3">{t("Scope")} 3</option>
            </select>
            {filters.scopeNo === "3" && (
              <select
                aria-label={t("Category")}
                value={filters.categoryNo ?? ""}
                onChange={(event) => updateFilter("categoryNo", event.target.value)}
              >
                <option value="">{t("All categories")}</option>
                {Array.from({ length: 15 }, (_, index) => index + 1).map((item) => (
                  <option key={item} value={item} disabled={[10, 11].includes(item)}>
                    {t("Category")} {item}
                    {[10, 11].includes(item) ? " · N/A" : ""}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label={t("EF status")}
              value={filters.isActive ?? ""}
              onChange={(event) => updateFilter("isActive", event.target.value)}
            >
              <option value="">{t("All EF statuses")}</option>
              <option value="true">{t("Enabled EF")}</option>
              <option value="false">{t("Inactive EF")}</option>
            </select>
            <input
              aria-label={t("Search factor, type code, activity or unit")}
              value={filters.search ?? ""}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder={t("Search factor, type code, activity or unit")}
            />
          </div>
          {loading ? (
            <p role="status">{t("Loading factors")}</p>
          ) : grouped ? (
            <MasterDataGroups rows={rows} editable={editable} onEdit={setEditing} />
          ) : (
            <>
              <section className="admin-card table-panel">
                <div className="table-wrap">
                  <table className="admin-table maintenance-factor-table">
                    <thead>
                      <tr>
                        {[
                          "ID",
                          "Scope",
                          "Activity",
                          "Detail",
                          "Source",
                          "kgCO₂e / unit",
                          "Unit",
                          "Active",
                          "Actions",
                        ].map((label) => (
                          <th key={label}>{t(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!rows.length && (
                        <tr>
                          <td colSpan={9} className="empty-cell">
                            {t("No factors match these filters")}
                          </td>
                        </tr>
                      )}
                      {rows.map((row) => (
                        <tr key={row.factorKey}>
                          <td>
                            <code>{row.factorKey}</code>
                          </td>
                          <td>{row.scopeNo}</td>
                          <td>{row.activityLabel}</td>
                          <td>
                            {row.detailLabel}
                            {row.sourceName && (
                              <div>
                                <strong>{row.sourceName}</strong>
                              </div>
                            )}
                            <small>{row.sourceTypeCode}</small>
                          </td>
                          <td>
                            {row.source} {row.sourceYear ?? ""}
                          </td>
                          <td>{row.kgCo2ePerUnit}</td>
                          <td>{row.unit}</td>
                          <td>{t(row.isActive ? "Enabled EF" : "Inactive EF")}</td>
                          <td>
                            {editable && (
                              <button
                                className="icon-button"
                                aria-label={`${t("Edit")} ${row.factorKey}`}
                                onClick={() => setEditing(row)}
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          <Pagination
            from={(factorPage - 1) * 10 + 1}
            to={Math.min(factorPage * 10, result?.total ?? 0)}
            total={result?.key === resultKey ? result.total : 0}
            page={factorPage}
            onPrevious={loading ? undefined : () => setFactorPage((value) => Math.max(1, value - 1))}
            onNext={loading ? undefined : () => setFactorPage((value) => value + 1)}
          />
        </>
      ) : manifest && filters.versionId && tab ? (
        <MasterCatalog key={`${filters.versionId}:${tab}:${revision}`} versionId={filters.versionId} tab={tab} />
      ) : null}
      {editing && (
        <EditFactorModal
          key={`${editing.versionId}:${editing.factorKey}`}
          original={editing}
          onClose={() => setEditing(null)}
          onSaved={loadRows}
        />
      )}
    </div>
  );
}
