"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";
import { companyApi, type TenantInvitation } from "@/lib/api/company-api";
import { apiErrorMessage, apiFieldErrors } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";

export function CompanyForm({ mode, company }: { mode: "add" | "edit"; company?: Company }) {
  const router = useRouter();
  const initial = useMemo(() => ({ name: company?.name ?? "", legal: company?.legalEntityNumber ?? "", contractStartDate: company?.contractStartDate ?? "", contractEndDate: company?.contractEndDate ?? "", email: company?.adminEmail ?? "" }), [company]);
  const [values, setValues] = useState(initial);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resending, setResending] = useState(false);
  const [invitation, setInvitation] = useState<TenantInvitation | undefined>(company?.invitation);
  const [invitationStatus, setInvitationStatus] = useState(company?.adminInvitationStatus);
  const [toast, setToast] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const changed = JSON.stringify(values) !== JSON.stringify(initial);
  const valid = values.name.trim() && values.legal.trim() && values.contractStartDate && values.contractEndDate && values.contractEndDate >= values.contractStartDate && (mode === "edit" || values.email.trim());

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
    const backendFields: Record<keyof typeof values, string[]> = {
      name: ["name"],
      legal: ["legalEntityNumber"],
      contractStartDate: ["contractStartDate"],
      contractEndDate: ["contractEndDate"],
      email: ["adminEmail"],
    };
    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of backendFields[key]) delete next[field];
      return next;
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { name: values.name, legalEntityNumber: values.legal, contractStartDate: values.contractStartDate, contractEndDate: values.contractEndDate, adminEmail: values.email };
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      if (mode === "add") await companyApi.create(payload);
      else if (company) await companyApi.update(company.id, payload);
      router.push("/companies");
    } catch (reason) {
      const nextFieldErrors = apiFieldErrors(reason);
      setFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length === 0) {
        setError(apiErrorMessage(reason, `Unable to ${mode === "add" ? "add" : "update"} the company. Please try again.`));
      }
      setSubmitting(false);
    }
  }

  async function removeCompany() {
    if (!company) return;
    setDeleting(true);
    setError("");
    try {
      await companyApi.remove(company.id);
      router.push("/companies");
    } catch (reason) {
      setError(apiErrorMessage(reason, "Unable to delete the company. Please try again."));
      setDeleteOpen(false);
      setDeleting(false);
    }
  }

  async function resendInvitation() {
    if (!company) return;
    setResending(true);
    setError("");
    try {
      const response = await companyApi.resendInvitation(company.id);
      setInvitation(response);
      setInvitationStatus(response.deliveryStatus);
      setToast(`Invitation resent to ${values.email}`);
      window.setTimeout(() => setToast(""), 2400);
    } catch (reason) {
      setError(apiErrorMessage(reason, `Unable to resend the invitation to ${values.email}.`));
    } finally {
      setResending(false);
    }
  }

  const createdAt = company?.createdAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(company.createdAt))
    : "";
  const invitationExpired = invitation ? new Date(invitation.expiresAt).getTime() < renderedAt : false;
  const currentInvitationStatus = invitationExpired ? "expired" : invitationStatus ?? invitation?.deliveryStatus;
  const invitationLabel = currentInvitationStatus === "expired"
    ? "Expired"
    : currentInvitationStatus === "sent"
      ? "Sent"
      : currentInvitationStatus === "logged"
        ? "Not sent (email disabled)"
        : currentInvitationStatus === "failed"
          ? "Failed"
          : currentInvitationStatus === "accepted"
            ? "Accepted"
            : currentInvitationStatus === "pending"
              ? "Pending"
              : "Status unavailable";
  const adminEmailChanged = values.email.trim().toLowerCase() !== initial.email.trim().toLowerCase();

  return <div className="admin-container"><div className="form-page-header"><div><Link className="back-link" href="/companies"><ArrowLeft size={16} />Back</Link><h1 className="form-page-title">{mode === "add" ? "Add company" : "Edit company"}</h1></div>{mode === "edit" && <button className="button button--danger" onClick={() => setDeleteOpen(true)}>Delete</button>}</div><form className="form-card" onSubmit={submit}><FormError message={error} /><section className="form-section"><h2>Company Information</h2><label className="field"><span>Company name <i className="required">*</i></span><input value={values.name} onChange={(event) => update("name", event.target.value)} required placeholder="Company name" disabled={submitting} aria-invalid={Boolean(fieldErrors.name)} />{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label><label className="field"><span>Legal entity number <i className="required">*</i></span><input value={values.legal} onChange={(event) => update("legal", event.target.value)} required placeholder="Legal entity number" disabled={submitting} aria-invalid={Boolean(fieldErrors.legalEntityNumber)} />{fieldErrors.legalEntityNumber && <small className="field-error">{fieldErrors.legalEntityNumber}</small>}</label><fieldset className="field contract-date-field"><legend>Contract date <i className="required">*</i></legend><div className="contract-date-range"><input aria-label="Contract start date" type="date" value={values.contractStartDate} onChange={(event) => update("contractStartDate", event.target.value)} required disabled={submitting} max={values.contractEndDate || undefined} aria-invalid={Boolean(fieldErrors.contractStartDate)} /><span aria-hidden="true">–</span><input aria-label="Contract end date" type="date" value={values.contractEndDate} onChange={(event) => update("contractEndDate", event.target.value)} required disabled={submitting} min={values.contractStartDate || undefined} aria-invalid={Boolean(fieldErrors.contractEndDate)} /></div>{fieldErrors.contractStartDate && <small className="field-error">{fieldErrors.contractStartDate}</small>}{fieldErrors.contractEndDate && <small className="field-error">{fieldErrors.contractEndDate}</small>}</fieldset></section><section className="form-section"><h2>Admin information</h2><label className="field"><span>Email <i className="required">*</i></span><input value={values.email} onChange={(event) => update("email", event.target.value)} type="email" required placeholder="Email" disabled={submitting || resending} aria-invalid={Boolean(fieldErrors.adminEmail)} />{fieldErrors.adminEmail && <small className="field-error">{fieldErrors.adminEmail}</small>}</label>{mode === "edit" && <div className="invitation-status"><span className={`invitation-status__badge invitation-status__badge--${currentInvitationStatus ?? "pending"}`}>{invitationLabel}</span>{invitation && !invitationExpired && <small>Expires {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invitation.expiresAt))}</small>}{adminEmailChanged && <small>Save the new admin email to send a new invitation.</small>}<button className="invitation-resend" type="button" onClick={resendInvitation} disabled={resending || submitting || adminEmailChanged || currentInvitationStatus === "accepted" || !values.email.trim()}>{resending ? "Resending…" : "Resend invitation email"}</button></div>}</section>{mode === "edit" && company && <section className="form-section company-metadata"><h2>Company metadata</h2><dl><div><dt>Tenant ID</dt><dd>{company.id}</dd></div><div><dt>Workspace</dt><dd>{company.workspace || "—"}</dd></div><div><dt>Login URL</dt><dd>{company.loginUrl ? <a href={company.loginUrl} target="_blank" rel="noreferrer">{company.loginUrl}</a> : "—"}</dd></div><div><dt>Status</dt><dd><span className={`company-metadata__status company-metadata__status--${company.status ?? "unknown"}`}>{company.status ?? "Unknown"}</span></dd></div><div><dt>Created at</dt><dd>{createdAt || "—"}</dd></div></dl></section>}<div className="form-actions"><Link href="/companies" className="button button--secondary">Cancel</Link><button className="button button--primary" disabled={!valid || submitting || resending || (mode === "edit" && !changed)} type="submit">{submitting ? "Saving…" : "Confirm"}</button></div></form>{deleteOpen && <div className="modal-layer"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-company-title"><div className="modal-card__body"><h2 id="delete-company-title">Delete company</h2><p>This company and all associated data will be permanently deleted. This action cannot be undone.</p></div><div className="modal-card__actions"><button className="button button--secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</button><button className="button button--danger" onClick={removeCompany} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</button></div></section></div>}{toast && <div className="toast">✓ {toast}</div>}</div>;
}
