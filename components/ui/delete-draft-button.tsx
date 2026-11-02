"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { MaintenanceIcon } from "./maintenance-icon";
import { apiErrorMessage } from "@/lib/api/client";
import { maintenanceText as t } from "@/lib/maintenance-i18n";

type Props = {
  version: {
    id: string;
    versionLabel: string;
    status: string;
    publishedAt: string | null;
    deletionRequestedAt?: string | null;
  };
  remove: (id: string) => Promise<{ deleted: boolean; queued: boolean }>;
  onChanged: () => Promise<void>;
  disabled?: boolean;
  iconOnly?: boolean;
};

export function DeleteDraftButton({ version, remove, onChanged, disabled, iconOnly = false }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [queued, setQueued] = useState(false);
  if (version.publishedAt || !["pending", "validated", "rejected"].includes(version.status)) return null;
  const requestDelete = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await remove(version.id);
      setQueued(result.queued);
      await onChanged();
      setOpen(false);
    } catch (reason) {
      setError(apiErrorMessage(reason, t("Delete draft failed")));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className={iconOnly ? "icon-button" : "button button--secondary button--compact"}
        aria-label={t(version.deletionRequestedAt ? "Retry draft deletion" : "Delete draft")}
        title={t(version.deletionRequestedAt ? "Retry draft deletion" : "Delete draft")}
        disabled={busy || disabled}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {iconOnly ? <MaintenanceIcon name="delete" /> : <Trash2 size={13} />}
        {!iconOnly && t(version.deletionRequestedAt ? "Retry draft deletion" : "Delete draft")}
      </button>
      {(queued || version.deletionRequestedAt) && (
        <small className={iconOnly ? "sr-only" : undefined} role="status">
          {t("Draft deletion queued")}
        </small>
      )}
      {open && (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-label={t("Delete draft confirmation")}>
          <div className="modal-card">
            <div className="modal-card__body">
              <h2>{t("Delete draft confirmation")}</h2>
              <p>{version.versionLabel}</p>
              <p>{t("Delete draft explanation")}</p>
              {error && <p role="alert">{error}</p>}
            </div>
            <div className="modal-card__actions">
              <button className="button button--secondary" disabled={busy} onClick={() => setOpen(false)}>
                {t("Cancel")}
              </button>
              <button className="button button--danger" disabled={busy} onClick={() => void requestDelete()}>
                {t(busy ? "Deleting draft" : "Delete draft")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
