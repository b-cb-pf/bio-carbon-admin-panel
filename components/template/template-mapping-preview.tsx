"use client";

import { useEffect, useState } from "react";
import { masterDataApi } from "@/lib/api/master-data-api";
import { templateApi } from "@/lib/api/template-api";
import { apiErrorMessage } from "@/lib/api/client";
import type { MasterDataVersion, TemplateFile, TemplateMappingPreview, TemplateMappingEditor, TemplateMappingEdit } from "@/lib/types";
import { TemplateMappingEditForm } from "./template-mapping-edit-form";
import { Pencil } from "lucide-react";
import { maintenanceText as t } from "@/lib/maintenance-i18n";
import { MaintenanceDrawer } from "@/components/ui/maintenance-drawer";

export function TemplateMappingReview({
  template,
  onClose,
  onPublished,
}: {
  template: TemplateFile;
  onClose: () => void;
  onPublished: () => Promise<void>;
}) {
  const [versions, setVersions] = useState<MasterDataVersion[] | null>(null);
  const [masterId, setMasterId] = useState("");
  const [preview, setPreview] = useState<TemplateMappingPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [editor, setEditor] = useState<TemplateMappingEditor | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [sectionReason, setSectionReason] = useState("");
  const [sectionConfirmed, setSectionConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    masterDataApi
      .versions()
      .then((data) => {
        if (active)
          setVersions(
            data.filter(
              (version) =>
                ["published", "retired"].includes(version.status) &&
                version.publishedAt &&
                !version.deletionRequestedAt,
            ),
          );
      })
      .catch((reason) => {
        if (active) setError(apiErrorMessage(reason, t("โหลดเวอร์ชันไม่สำเร็จ")));
      });
    return () => {
      active = false;
    };
  }, [reload]);

  async function inspect() {
    setBusy(true);
    setError("");
    setPreview(null);
    setEditor(null); setEditing(null); setSaved(false);
    try {
      const [next, edit] = await Promise.all([templateApi.preview(template.id, masterId), templateApi.editor(template.id, masterId)]);
      setPreview(next); setEditor(edit); setSectionReason(""); setSectionConfirmed(false);
    } catch (reason) {
      setError(apiErrorMessage(reason, t("Mapping preview failed")));
    } finally {
      setBusy(false);
    }
  }
  async function saveMapping(change: Omit<TemplateMappingEdit, "masterVersionId" | "revision">) {
    if (!editor) return;
    setBusy(true); setError(""); setSaved(false);
    try {
      const next = await templateApi.editMapping(template.id, { ...change, masterVersionId: masterId, revision: editor.revision });
      const edit = await templateApi.editor(template.id, masterId);
      setPreview(next); setEditor(edit); setEditing(null); setSectionReason(""); setSectionConfirmed(false); setSaved(true);
    } catch (reason) {
      setPreview(null); setEditor(null); setEditing(null);
      setError(apiErrorMessage(reason, t("Save mapping failed")));
    } finally { setBusy(false); }
  }
  async function publish() {
    if (!preview?.ready || !preview.previewToken || preview.master.id !== masterId) return;
    setBusy(true);
    setError("");
    try {
      await templateApi.publish(template.id, masterId, preview.previewToken);
      await onPublished();
      onClose();
    } catch (reason) {
      setPreview(null);
      setError(apiErrorMessage(reason, t("Mapping publish failed")));
    } finally {
      setBusy(false);
    }
  }
  const unresolvedRows = new Set((preview?.rows ?? [])
    .filter(row => ["pending_confirmation", "missing", "ambiguous"].includes(row.status)).map(row => row.rowId)).size;
  const totalRows = new Set((preview?.rows ?? []).map(row => row.rowId)).size;
  const liveErrors = (preview?.errors ?? []).filter(message => !editor?.sectionReviewIssues.includes(message));
  const displayedErrors = editor?.sectionReviewIssues.length
    ? [...liveErrors, t("Section confirmation pending")]
    : liveErrors;
  return (
    <MaintenanceDrawer title={t("Review template mapping")} busy={busy} onClose={onClose}>
      <div className="template-mapping-preview">
        <p>
          <strong>{template.versionLabel}</strong> · {template.fileName}
        </p>
        <div className="mapping-version-picker">
          <label className="field">
            <span>{t("Select master version")}</span>
            <select
              value={masterId}
              disabled={busy || !versions?.length}
              onChange={(event) => {
                setMasterId(event.target.value);
                setPreview(null);
                setError("");
                setEditor(null); setEditing(null); setSaved(false); setSectionConfirmed(false);
              }}
            >
              <option value="">{t(versions === null ? "Loading" : "Choose published master")}</option>
              {versions?.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionLabel} · {t(version.status)} · {version.fileName} · {version.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          <button className="button button--secondary" disabled={busy || !masterId} onClick={() => void inspect()}>
            {t(busy ? "Checking mapping" : "Preview mapping")}
          </button>
          {(
            <button
              className="button button--secondary"
              disabled={busy}
              onClick={() => {
                setError("");
                setReload(reload + 1);
                if (masterId) void inspect();
              }}
            >
              {t("Refresh")}
            </button>
          )}
        </div>
        {versions?.length === 0 && <p role="status">{t("Publish master first")}</p>}
        <p className="master-group-help">{t("Pinned master explanation")}</p>
        {saved && <p role="status" className="maintenance-alert">{t("Mapping draft saved")}</p>}
        {error && (
          <p role="alert" className="maintenance-alert maintenance-alert--error">
            {error}
          </p>
        )}
        {preview && (
          <>
            {editing && editor?.rows.find(row => row.rowId === editing) && (
              <TemplateMappingEditForm key={`${editing}:${editor.revision}`} row={editor.rows.find(row => row.rowId === editing)!}
                busy={busy} onSave={saveMapping} onCancel={() => setEditing(null)} />
            )}
            <div className="mapping-review-summary" role="status">
              <strong>{t(preview.ready ? "Mapping ready" : "Mapping needs review")}</strong>
              <span>
                {t("Master data version")}: {preview.master.versionLabel} · {preview.master.id}
              </span>
              <span>
                {t("Mapping rows")}: {preview.rows.length}
              </span>
            </div>
            {displayedErrors.length > 0 && (
              <details className="maintenance-alert maintenance-alert--error">
                <summary>
                  {t("Errors")} ({displayedErrors.length})
                </summary>
                <ul>
                  {displayedErrors.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </details>
            )}
            <div className="admin-card table-panel">
              <div className="table-wrap">
                <table className="admin-table mapping-preview-table">
                  <thead>
                    <tr>
                      {["Template item / type code", "Unit", "Mapping result", "Matched EF", "Reference", "Edit"].map((key) => (
                        <th key={key}>{t(key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={`${row.rowId}:${row.unit}`}>
                        <td>
                          <strong>{row.detailLabel}</strong>
                          <small>{row.activityLabel}</small>
                          <code>{row.rowId}</code>
                          <code>{row.sourceTypeCode}</code>
                        </td>
                        <td>
                          {row.unit}
                          {row.efYear !== null && (
                            <small>
                              {t("EF year")}: {row.efYear}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`mapping-result mapping-result--${row.status}`}>
                            {t(`mapping_${row.status}`)}
                          </span>
                          {row.reason && <small>{row.reason}</small>}
                          {row.status === "formula" && <small>{t("Methane pending GWP")}</small>}
                          {row.requestedFactorKey && <code>{row.requestedFactorKey}</code>}
                          {row.status === "ambiguous" && (
                            <small>
                              {t("Matching factors")}: {row.matchCount}
                            </small>
                          )}
                        </td>
                        <td>
                          {row.candidates.length
                            ? row.candidates.map((factor) => (
                                <div key={factor.factorKey}>
                                  <code>{factor.factorKey}</code>
                                  <span>
                                    {factor.kgCo2ePerUnit} kgCO₂e / {factor.unit}
                                  </span>
                                </div>
                              ))
                            : "—"}
                        </td>
                        <td>
                          {row.candidates.length
                            ? row.candidates.map((factor) => (
                                <div key={factor.factorKey}>
                                  <span>{factor.source || "—"}</span>
                                  <small>
                                    {t("EF year")}: {factor.sourceYear ?? "—"}
                                  </small>
                                </div>
                              ))
                            : "—"}
                        </td>
                        <td>
                          <button className="icon-button" disabled={busy || !editor?.rows.find(item => item.rowId === row.rowId)?.editable}
                            aria-label={`${t("Edit template mapping")} ${row.detailLabel}`} onClick={() => { setEditing(row.rowId); setSaved(false); }}>
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {preview.rows.some((row) => row.matchCount > 20) && <p>{t("Preview candidate limit")}</p>}
            {!!editor?.sectionReviewIssues.length && (
              <section className="mapping-edit-form">
                <h3>{t("Confirm section review")}</h3>
                <p role="status" data-testid="section-mapping-status">
                  {t("Current mapping status")}: {t("Rows passing validation")} {totalRows - unresolvedRows} · {t("Rows needing review")} {unresolvedRows}
                </p>
                <p>{t(editor.canConfirmSection ? "All rows ready for section review" : "Section review explanation")}</p>
                <details className="mapping-help">
                  <summary>{t("Original template review notes")}</summary>
                  <p>{t("Original review notes explanation")}</p>
                  {editor.sectionReviewIssues.map((issue, index) => <p key={index}>{issue}</p>)}
                </details>
                <label className="field"><span>{t("Mapping decision reason")}</span><textarea rows={3} maxLength={1000} value={sectionReason}
                  disabled={busy || !editor.canConfirmSection} onChange={e => { setSectionReason(e.target.value); setSectionConfirmed(false); }} /></label>
                <label className="maintenance-check"><input type="checkbox" checked={sectionConfirmed} disabled={busy || !editor.canConfirmSection}
                  onChange={e => setSectionConfirmed(e.target.checked)} />{t("Confirm section applicability")}</label>
                <button className="button button--secondary" disabled={busy || !editor.canConfirmSection || !sectionReason.trim() || !sectionConfirmed}
                  onClick={() => void saveMapping({ confirmSection: true, reason: sectionReason.trim() })}>{t("Confirm section review")}</button>
              </section>
            )}
          </>
        )}
        <details className="mapping-help">
          <summary>{t("Optional factor key help")}</summary>
          <p>{t("Factor key explanation")}</p>
          <code>{'{"litre":"EF_LITRE","kg":"EF_KG"}'}</code>
        </details>
        <div className="mapping-confirm-actions">
          <button className="button button--secondary" disabled={busy} onClick={onClose}>
            {t("Cancel")}
          </button>
          <button
            className="button button--primary"
            disabled={busy || !!editing || !preview?.ready || !preview.previewToken || preview.master.id !== masterId}
            onClick={() => void publish()}
          >
            {t("Confirm mapping and publish")}
          </button>
        </div>
      </div>
    </MaintenanceDrawer>
  );
}
