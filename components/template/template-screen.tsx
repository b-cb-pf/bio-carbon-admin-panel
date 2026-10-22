"use client";

import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { templateApi } from "@/lib/api/template-api";
import { apiErrorMessage } from "@/lib/api/client";
import type { TemplateFile } from "@/lib/types";
import { maintenanceText as t, maintenanceLocale } from "@/lib/maintenance-i18n";
import { ValidationReport } from "@/components/ui/validation-report";
import { PageHeading } from "@/components/ui/page-heading";
import { DeleteDraftButton } from "@/components/ui/delete-draft-button";
import { MaintenanceDrawer } from "@/components/ui/maintenance-drawer";
import { MaintenanceLogTable } from "@/components/ui/maintenance-log";
import { MaintenanceIcon } from "@/components/ui/maintenance-icon";
import { TemplateMappingReview } from "./template-mapping-preview";
import { Pagination } from "@/components/ui/pagination";

function dateTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat(maintenanceLocale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Bangkok",
      }).format(new Date(value))
    : "—";
}

export function TemplateScreen() {
  const [scope, setScope] = useState(1);
  const [category, setCategory] = useState(1);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [versionLabel, setVersionLabel] = useState("v1.0");
  const [result, setResult] = useState<{ key: string; items: TemplateFile[]; total: number } | null>(null);
  const [review, setReview] = useState<TemplateFile | null>(null);
  const [drawer, setDrawer] = useState<"upload" | TemplateFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = `${scope}:${category}:${page}:${revision}`;
  const loaded = result?.key === key;
  const refresh = async () => {
    setRevision((value) => value + 1);
  };

  useEffect(() => {
    let active = true;
    templateApi
      .page(scope, scope === 3 ? category : 0, page)
      .then((data) => {
        if (!active) return;
        if (page > 1 && !data.items.length) {
          setPage(page - 1);
          return;
        }
        setResult({ ...data, key });
      })
      .catch((reason) => {
        if (active) setError(apiErrorMessage(reason, t("โหลดข้อมูล Template ไม่สำเร็จ")));
      });
    return () => {
      active = false;
    };
  }, [scope, category, page, key]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const created = await templateApi.upload(file, scope, scope === 3 ? category : 0, versionLabel.trim());
      setDrawer(created);
      setPage(1);
    } catch (reason) {
      setError(apiErrorMessage(reason, t("ตรวจสอบ Template ไม่สำเร็จ")));
    } finally {
      await refresh();
      setBusy(false);
    }
  }

  function reviewMapping(file: TemplateFile) {
    setDrawer(null);
    setReview(file);
  }

  return (
    <div className="admin-container maintenance-page">
      <PageHeading
        icon={<MaintenanceIcon name="template" />}
        title={t("Template")}
        actions={
          <button className="icon-button" aria-label={t("Refresh")} disabled={busy} onClick={() => void refresh()}>
            <RefreshCw size={16} />
          </button>
        }
      />
      <div className="subnav" aria-label={t("Scope")}>
        {[1, 2, 3].map((item) => (
          <button
            key={item}
            className={scope === item ? "active" : ""}
            onClick={() => {
              setScope(item);
              setPage(1);
              setError("");
            }}
          >
            {t("Scope")} {item}
          </button>
        ))}
      </div>
      <div className="maintenance-section-heading">
        <h2>
          {t("Scope")} {scope}
        </h2>
        <button
          className="button button--primary"
          onClick={() => {
            setError("");
            setDrawer("upload");
          }}
        >
          <MaintenanceIcon name="upload" />
          {t("Upload template")}
        </button>
      </div>
      {scope === 3 && (
        <div className="category-row" aria-label={t("Category")}>
          {Array.from({ length: 15 }, (_, index) => index + 1).map((item) => (
            <button
              key={item}
              disabled={[10, 11].includes(item)}
              className={category === item ? "active" : ""}
              title={[10, 11].includes(item) ? t("ยังไม่รองรับในรอบนี้") : undefined}
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
            >
              {t("Category")} {item}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="maintenance-alert maintenance-alert--error">
          {error}
        </p>
      )}
      <section className="admin-card table-panel">
        <div className="table-wrap">
          <table className="admin-table maintenance-template-table">
            <thead>
              <tr>
                <th>{t("Template")}</th>
                <th>{t("Uploaded at")}</th>
                <th>
                  <span className="sr-only">{t("Actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={3}>{t("Loading")}</td>
                </tr>
              ) : result.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    {t("ยังไม่มี Template สำหรับส่วนนี้")}
                  </td>
                </tr>
              ) : (
                result.items.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div className="maintenance-file-name">
                        <button
                          className="maintenance-text-button"
                          onClick={() => {
                            setError("");
                            setDrawer(file);
                          }}
                        >
                          {file.fileName} · {file.versionLabel}
                        </button>
                        <span className={`maintenance-status maintenance-status--${file.status}`}>
                          {t(file.status)}
                        </span>
                      </div>
                    </td>
                    <td>{dateTime(file.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        {file.status === "validated" && !file.deletionRequestedAt && (
                          <button
                            className="icon-button"
                            aria-label={t("Publish")}
                            title={t("Publish")}
                            disabled={busy}
                            onClick={() => reviewMapping(file)}
                          >
                            <MaintenanceIcon name="publish" />
                          </button>
                        )}
                        <DeleteDraftButton
                          iconOnly
                          version={file}
                          remove={templateApi.deleteDraft}
                          onChanged={refresh}
                          disabled={busy}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination
        page={page}
        from={(page - 1) * 10 + 1}
        to={Math.min(page * 10, result?.total ?? 0)}
        total={result?.total ?? 0}
        onPrevious={loaded ? () => setPage(page - 1) : undefined}
        onNext={loaded ? () => setPage(page + 1) : undefined}
      />
      <MaintenanceLogTable entityType="template" revision={revision} />
      {review && (
        <TemplateMappingReview
          key={review.id}
          template={review}
          onClose={() => setReview(null)}
          onPublished={refresh}
        />
      )}
      {drawer && (
        <MaintenanceDrawer
          title={t(drawer === "upload" ? "Upload template" : "Template details")}
          busy={busy}
          onClose={() => setDrawer(null)}
        >
          {error && (
            <p role="alert" className="maintenance-alert maintenance-alert--error">
              {error}
            </p>
          )}
          {drawer === "upload" ? (
            <>
              <p>
                {t("Scope")} {scope}
                {scope === 3 ? ` · ${t("Category")} ${category}` : ""}
              </p>
              <label className="field">
                <span>{t("Version")}</span>
                <input value={versionLabel} onChange={(event) => setVersionLabel(event.target.value)} />
              </label>
              <p>{t("Template upload help")}</p>
              <label className="button button--primary">
                <MaintenanceIcon name="upload" />
                {t(busy ? "กำลังตรวจ..." : "Upload template")}
                <input
                  className="sr-only"
                  type="file"
                  accept=".xlsx"
                  disabled={busy || !versionLabel.trim()}
                  onChange={(event) => void upload(event)}
                />
              </label>
            </>
          ) : (
            <>
              <h3>{drawer.fileName}</h3>
              <p>{drawer.versionLabel}</p>
              <span className={`maintenance-status maintenance-status--${drawer.status}`}>{t(drawer.status)}</span>
              <dl className="maintenance-detail-list">
                {[
                  ["Uploaded at", drawer.createdAt],
                  ["Validated", drawer.validatedAt],
                  ["Published", drawer.publishedAt],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{t(label!)}</dt>
                    <dd>{dateTime(value)}</dd>
                  </div>
                ))}
              </dl>
              <ValidationReport report={drawer.validationReport} />
              {drawer.deletionRequestedAt && <p role="status">{t("Draft deletion queued")}</p>}
              <div className="maintenance-drawer-actions">
                <button
                  className="button button--secondary"
                  disabled={!!drawer.deletionRequestedAt}
                  onClick={() =>
                    void templateApi
                      .download(drawer.id)
                      .catch((reason) => setError(apiErrorMessage(reason, t("Download failed"))))
                  }
                >
                  <Download size={16} />
                  {t("Download")}
                </button>
                {drawer.status === "validated" && !drawer.deletionRequestedAt && (
                  <button className="button button--primary" disabled={busy} onClick={() => reviewMapping(drawer)}>
                    {t("Publish")}
                  </button>
                )}
              </div>
            </>
          )}
        </MaintenanceDrawer>
      )}
    </div>
  );
}
