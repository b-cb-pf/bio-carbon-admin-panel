"use client";

import { useEffect, useState } from "react";
import { masterDataApi, type MasterCatalogRow } from "@/lib/api/master-data-api";
import { apiErrorMessage } from "@/lib/api/client";
import type { MasterDataRow } from "@/lib/types";
import { maintenanceText as t } from "@/lib/maintenance-i18n";

type Identity = Pick<MasterDataRow, "activityLabel" | "detailLabel" | "unit" | "sourceTypeCode">;
const activityKey = (row: Identity) =>
  JSON.stringify([row.sourceTypeCode?.replace(/_TYP\d+$/, "") ?? "", row.activityLabel]);
const typeKey = (row: Identity) => JSON.stringify([row.sourceTypeCode ?? "", row.detailLabel]);
const unique = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export function EditFactorModal({
  original,
  onClose,
  onSaved,
}: {
  original: MasterDataRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(original);
  const [selectedActivity, setSelectedActivity] = useState(activityKey(original));
  const [catalog, setCatalog] = useState<MasterCatalogRow[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    masterDataApi
      .catalog(original.versionId)
      .then((rows) => {
        if (active) setCatalog(rows);
      })
      .catch((reason) => {
        if (active) setError(apiErrorMessage(reason, t("โหลด Master Data ไม่สำเร็จ")));
      });
    return () => {
      active = false;
    };
  }, [original.versionId, reload]);
  const candidates = (catalog ?? [])
    .filter((row) => row.scopeNo === original.scopeNo && row.categoryNo === original.categoryNo && !!row.sourceTypeCode)
    .map((row) => ({
      ...row,
      sourceTypeCode: row.sourceTypeCode!,
    }));
  const activities = [...new Map(candidates.map((row) => [activityKey(row), row])).values()];
  const types = [
    ...new Map(
      candidates.filter((row) => activityKey(row) === selectedActivity).map((row) => [typeKey(row), row]),
    ).values(),
  ];
  const units = unique(
    candidates
      .filter((row) => activityKey(row) === selectedActivity && typeKey(row) === typeKey(editing))
      .map((row) => row.unit),
  );
  const sources = unique((catalog ?? []).map((row) => row.source).filter(Boolean));
  const years = [
    ...new Set(
      (catalog ?? [])
        .filter((row) => row.source === editing.source && row.sourceYear !== null)
        .map((row) => row.sourceYear!),
    ),
  ].sort((a, b) => b - a);
  const sameIdentity =
    activityKey(editing) === activityKey(original) &&
    typeKey(editing) === typeKey(original) &&
    editing.unit === original.unit;
  const validIdentity =
    sameIdentity ||
    candidates.some(
      (row) => activityKey(row) === selectedActivity && typeKey(row) === typeKey(editing) && row.unit === editing.unit,
    );
  const dirty = JSON.stringify(editing) !== JSON.stringify(original);
  const valid =
    catalog !== null &&
    validIdentity &&
    sources.includes(editing.source) &&
    /^\d+(?:\.\d+)?$/.test(editing.kgCo2ePerUnit.trim()) &&
    (!editing.isActive || !!editing.sourceTypeCode) &&
    (editing.sourceYear === null
      ? !editing.isActive
      : Number.isInteger(editing.sourceYear) &&
        editing.sourceYear >= 1900 &&
        editing.sourceYear <= 3000 &&
        (!years.length || years.includes(editing.sourceYear)));
  async function save() {
    if (!valid || !dirty || busy) return;
    setBusy(true);
    setError("");
    try {
      await masterDataApi.update(original.versionId, original.factorKey, {
        ...(editing.sourceTypeCode ? { sourceTypeCode: editing.sourceTypeCode } : {}),
        activityLabel: editing.activityLabel,
        detailLabel: editing.detailLabel,
        unit: editing.unit,
        kgCo2ePerUnit: editing.kgCo2ePerUnit,
        source: editing.source,
        sourceYear: editing.sourceYear,
        isActive: editing.isActive,
      });
      onSaved();
      onClose();
    } catch (reason) {
      setError(apiErrorMessage(reason, t("บันทึก EF ไม่สำเร็จ")));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="edit-ef-title">
      <form
        className="modal-card maintenance-edit-modal"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="modal-card__body">
          <h2 id="edit-ef-title">{t("Edit emission factor")}</h2>
          <p>{original.factorKey}</p>
          {original.sourceName && (
            <p>
              {t("Source item")}: <strong>{original.sourceName}</strong>
            </p>
          )}
          <p data-testid="editing-type-code">{editing.sourceTypeCode || t("Type code unavailable")}</p>
          {error && (
            <p role="alert" className="maintenance-alert maintenance-alert--error">
              {error}
            </p>
          )}
          {!catalog && <p role="status">{t("Loading reference choices")}</p>}
          {!catalog && error && (
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setError("");
                setReload(reload + 1);
              }}
            >
              {t("Refresh")}
            </button>
          )}
          <fieldset disabled={busy || !catalog} className="ef-reference-fields">
            <label className="field">
              <span>{t("Activity")}</span>
              <select
                aria-label={t("Activity")}
                value={selectedActivity}
                onChange={(event) => {
                  const row = activities.find((row) => activityKey(row) === event.target.value);
                  if (row) {
                    setSelectedActivity(activityKey(row));
                    setEditing({
                      ...editing,
                      activityLabel: row.activityLabel,
                      sourceTypeCode: undefined,
                      detailLabel: "",
                      unit: "",
                      kgCo2ePerUnit: "",
                    });
                  }
                }}
              >
                <option value="" disabled>
                  {t("Select activity")}
                </option>
                {editing.activityLabel && !activities.some((row) => activityKey(row) === selectedActivity) && (
                  <option value={activityKey(editing)}>{editing.activityLabel}</option>
                )}
                {activities.map((row) => (
                  <option key={activityKey(row)} value={activityKey(row)}>
                    {row.activityLabel} · {row.sourceTypeCode.replace(/_TYP\d+$/, "")}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("Detail")}</span>
              <select
                aria-label={t("Detail")}
                value={editing.detailLabel ? typeKey(editing) : ""}
                onChange={(event) => {
                  const row = types.find((row) => typeKey(row) === event.target.value);
                  if (row)
                    setEditing({
                      ...editing,
                      sourceTypeCode: row.sourceTypeCode,
                      detailLabel: row.detailLabel,
                      unit: "",
                      kgCo2ePerUnit: "",
                    });
                }}
              >
                <option value="" disabled>
                  {t("Select type")}
                </option>
                {editing.detailLabel && !types.some((row) => typeKey(row) === typeKey(editing)) && (
                  <option value={typeKey(editing)}>{editing.detailLabel}</option>
                )}
                {types.map((row) => (
                  <option key={typeKey(row)} value={typeKey(row)}>
                    {row.detailLabel} · {row.sourceTypeCode}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("Unit")}</span>
              <select
                aria-label={t("Unit")}
                value={editing.unit}
                disabled={!editing.detailLabel}
                onChange={(event) => setEditing({ ...editing, unit: event.target.value, kgCo2ePerUnit: "" })}
              >
                <option value="" disabled>
                  {t("Select unit")}
                </option>
                {editing.unit && !units.includes(editing.unit) && <option value={editing.unit}>{editing.unit}</option>}
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("kgCO₂e / unit")}</span>
              <input
                inputMode="decimal"
                value={editing.kgCo2ePerUnit}
                disabled={!editing.unit}
                onChange={(event) => setEditing({ ...editing, kgCo2ePerUnit: event.target.value })}
              />
            </label>
            {!sameIdentity && <p className="master-group-help">{t("Review EF after identity change")}</p>}
            <label className="field">
              <span>{t("Source")}</span>
              <select
                aria-label={t("Source")}
                value={editing.source}
                onChange={(event) => {
                  const source = event.target.value;
                  const nextYears = (catalog ?? [])
                    .filter((row) => row.source === source && row.sourceYear !== null)
                    .map((row) => row.sourceYear);
                  setEditing({
                    ...editing,
                    source,
                    sourceYear: nextYears.includes(editing.sourceYear) ? editing.sourceYear : null,
                  });
                }}
              >
                <option value="" disabled>
                  {t("Select reference")}
                </option>
                {editing.source && !sources.includes(editing.source) && (
                  <option value={editing.source}>{editing.source}</option>
                )}
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("EF year (CE)")}</span>
              {years.length ? (
                <select
                  aria-label={t("EF year (CE)")}
                  value={editing.sourceYear ?? ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      sourceYear: event.target.value === "" ? null : Number(event.target.value),
                    })
                  }
                >
                  <option value="">{t("Select reference year")}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min="1900"
                  max="3000"
                  step="1"
                  value={editing.sourceYear ?? ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      sourceYear: event.target.value === "" ? null : Number(event.target.value),
                    })
                  }
                />
              )}
            </label>
            <p className="master-group-help">{t("Enable EF review guidance")}</p>
            {dirty && !valid && <p role="status">{t("EF edit validation guidance")}</p>}
            <label className="maintenance-check">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })}
              />
              {t("Active for mapping")}
            </label>
          </fieldset>
        </div>
        <div className="modal-card__actions">
          <button type="button" className="button button--secondary" disabled={busy} onClick={onClose}>
            {t("Cancel")}
          </button>
          <button type="submit" className="button button--primary" disabled={busy || !dirty || !valid}>
            {t("Save draft")}
          </button>
        </div>
      </form>
    </div>
  );
}
