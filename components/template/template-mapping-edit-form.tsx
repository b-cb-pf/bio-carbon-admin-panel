"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { TemplateMappingEditor, TemplateMappingEdit } from "@/lib/types";
import { maintenanceText as t } from "@/lib/maintenance-i18n";

const normalize = (v: string) => v.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
export function TemplateMappingEditForm({ row, busy, onSave, onCancel }: {
  row: TemplateMappingEditor["rows"][number];
  busy: boolean;
  onSave: (edit: Pick<TemplateMappingEdit, "rowId" | "mode" | "reason" | "factorKeysByUnit">) => Promise<void>;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "start" });
    formRef.current?.focus({ preventScroll: true });
  }, []);
  const units = row.allowedUnits ?? [row.unit];
  const [mode, setMode] = useState<"direct_factor" | "collect_only">(row.calculationMode === "collect_only" ? "collect_only" : "direct_factor");
  const [keys, setKeys] = useState<Record<string, string>>(() => Object.fromEntries(units.map(unit =>
    [normalize(unit), row.factorKeysByUnit?.[normalize(unit)] ?? row.factorKey ?? ""])));
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const valid = confirmed && !!reason.trim() && (mode === "collect_only" || units.every(unit =>
    row.options.some(f => f.isActive && f.factorKey === keys[normalize(unit)] && normalize(f.unit) === normalize(unit))));
  return <form ref={formRef} tabIndex={-1} className="mapping-edit-form" aria-busy={busy} onSubmit={event => {
    event.preventDefault(); if (valid && !busy) void onSave({ rowId: row.rowId, mode, reason: reason.trim(), factorKeysByUnit: mode === "collect_only" ? {} : keys });
  }}>
    <h3>{t("Edit template mapping")} · {row.detailLabel}</h3>
    <code>{row.sourceTypeCode}</code>
    {(row.reviewNote || row.modeReason) && <p>{row.reviewNote || row.modeReason}</p>}
    <label className="field"><span>{t("Calculation mode")}</span>
      <select disabled={busy} value={mode} onChange={e => { setMode(e.target.value as typeof mode); setConfirmed(false); }}>
        <option value="direct_factor">{t("Calculate with selected EF")}</option>
        <option value="collect_only" disabled={units.length !== 1}>{t("Collect without calculation")}</option>
      </select>
    </label>
    {mode === "direct_factor" ? units.map(unit => <label className="field" key={unit}>
      <span>{t("Select EF for unit")} · {unit}</span>
      <select disabled={busy} value={keys[normalize(unit)] ?? ""} onChange={e => { setKeys({ ...keys, [normalize(unit)]: e.target.value }); setConfirmed(false); }}>
        <option value="">{t("Choose emission factor")}</option>
        {row.options.filter(f => normalize(f.unit) === normalize(unit)).map(f =>
          <option key={f.factorKey} value={f.factorKey} disabled={!f.isActive}>
            {f.factorKey} · {f.kgCo2ePerUnit} kgCO₂e/{f.unit} · {f.source} {f.isActive ? "" : `(${t("Inactive EF")})`}
          </option>)}
      </select>
    </label>) : <p>{t("Collect only explanation")}</p>}
    {row.options.some(f => !f.isActive) && <p>{t("Inactive mapping guidance")} <Link href="/master-data" target="_blank" rel="noreferrer">{t("Manage master data")}</Link></p>}
    <label className="field"><span>{t("Mapping decision reason")}</span>
      <textarea required maxLength={1000} rows={3} value={reason} disabled={busy} onChange={e => { setReason(e.target.value); setConfirmed(false); }} />
    </label>
    <label className="maintenance-check"><input type="checkbox" disabled={busy} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />{t("Confirm mapping applicability")}</label>
    <p className="master-group-help">{t("Mapping draft explanation")}</p>
    <span className="maintenance-save-status" role="status">{busy ? t("Saving mapping") : ""}</span>
    <div className="mapping-confirm-actions">
      <button type="button" className="button button--secondary" disabled={busy} onClick={onCancel}>{t("Cancel")}</button>
      <button type="submit" className="button button--primary" disabled={busy || !valid}>{busy && <LoaderCircle size={16} className="maintenance-save-spinner" aria-hidden="true" />}{t(busy ? "Saving mapping" : "Save mapping draft")}</button>
    </div>
  </form>;
}
