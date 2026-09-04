"use client";

import { Trash2, UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Staff } from "@/lib/types";
import { staffApi, type InvitationStatus, type PaginationResponse, type StaffDetails } from "@/lib/api/staff-api";
import { PageHeading } from "@/components/ui/page-heading";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { FormError } from "@/components/ui/form-error";
import { apiErrorMessage } from "@/lib/api/client";
import { getAuthSession } from "@/lib/auth-session";

const primaryAdminEmail = (process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL ?? "biocarbon@gmail.com").trim().toLowerCase();

const invitationLabels: Record<InvitationStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  logged: "Not sent (email disabled)",
  failed: "Failed",
  expired: "Expired",
  accepted: "Accepted",
};

function formatInvitationExpiry(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function StaffScreen() {
  const [staff, setStaff] = useState<StaffDetails[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({ page: 1, pageSize: 0, totalItems: 0, totalPages: 0, from: 0, to: 0 });
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [busyStaffId, setBusyStaffId] = useState("");
  const [resendingStaffId, setResendingStaffId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const currentAdminId = getAuthSession()?.admin.id;

  function protectionFor(person: Staff) {
    if (person.email.trim().toLowerCase() === primaryAdminEmail) return "primary";
    if (person.id === currentAdminId) return "current";
    return null;
  }

  useEffect(() => {
    let active = true;
    staffApi.list(query).then((data) => { if (active) { setStaff(data.items); setPagination(data.pagination); setError(""); } }).catch((reason) => { if (active) setError(apiErrorMessage(reason, "Unable to load staff. Please try again.")); });
    return () => { active = false; };
  }, [query]);

  async function toggleStatus(person: Staff) {
    if (protectionFor(person)) return;
    const status = person.status === "Active" ? "Inactive" : "Active";
    setError("");
    setBusyStaffId(person.id);
    try {
      const updated = await staffApi.updateStatus(person.id, status);
      setStaff((current) => current.map((item) => item.id === person.id ? updated : item));
    } catch (reason) {
      setError(apiErrorMessage(reason, `Unable to set ${person.name} ${status.toLowerCase()}.`));
    } finally {
      setBusyStaffId("");
    }
  }

  async function removeStaff() {
    if (!deleteTarget) return;
    if (protectionFor(deleteTarget)) {
      setDeleteTarget(null);
      return;
    }
    setError("");
    setDeleting(true);
    try {
      await staffApi.remove(deleteTarget.id);
      setStaff((current) => current.filter((person) => person.id !== deleteTarget.id));
      setPagination((current) => ({ ...current, totalItems: Math.max(0, current.totalItems - 1), to: Math.max(0, current.to - 1) }));
      setToast("Staff removed successfully");
      setDeleteTarget(null);
      window.setTimeout(() => setToast(""), 2400);
    } catch (reason) {
      setError(apiErrorMessage(reason, "Unable to delete this staff member."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function resendInvitation(person: StaffDetails) {
    setError("");
    setResendingStaffId(person.id);
    try {
      const updated = await staffApi.resendInvitation(person.id);
      setStaff((current) => current.map((item) => item.id === person.id ? updated : item));
      setToast(`Invitation resent to ${person.email}`);
      window.setTimeout(() => setToast(""), 2400);
    } catch (reason) {
      setError(apiErrorMessage(reason, `Unable to resend the invitation to ${person.email}.`));
    } finally {
      setResendingStaffId("");
    }
  }

  return (
    <div className="admin-container">
      <PageHeading icon={<UsersRound size={17} />} title="Staff" actions={<><SearchField value={query} onChange={setQuery} placeholder="Search by name or email" /><Link href="/staff/new" className="button button--primary"><UserPlus size={14} />Add staff</Link></>} />
      <FormError message={error} />
      <section className="admin-card table-panel">
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Email status</th><th>Status</th><th><span className="sr-only">Delete</span></th></tr></thead>
            <tbody>
              {staff.map((person) => {
                const protection = protectionFor(person);
                const isCurrentUser = person.id === currentAdminId;
                const protectionLabel = protection === "primary"
                  ? "The primary administrator account is protected"
                  : "You cannot change or delete your own account";
                return (
                  <tr key={person.id}>
                    <td>
                      <span className="staff-name">
                        {person.name}
                        {isCurrentUser && <small className="current-user-badge">You</small>}
                      </span>
                    </td>
                    <td>{person.email}</td>
                    <td>
                      <div className="invitation-status">
                        <span className={`invitation-status__badge invitation-status__badge--${person.invitationStatus}`}>{invitationLabels[person.invitationStatus]}</span>
                        {person.invitationExpiresAt && person.invitationStatus !== "accepted" && <small>Expires {formatInvitationExpiry(person.invitationExpiresAt)}</small>}
                        {person.canResendInvitation && (
                          <button className="invitation-resend" type="button" onClick={() => resendInvitation(person)} disabled={Boolean(resendingStaffId)}>
                            {resendingStaffId === person.id ? "Resending…" : "Resend invitation email"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {protection ? (
                        <span className="staff-status-readonly" title={protectionLabel}>{person.status}</span>
                      ) : (
                        <button className={`status-toggle ${person.status === "Active" ? "active" : ""}`} onClick={() => toggleStatus(person)} disabled={Boolean(busyStaffId)} aria-label={`Set ${person.name} ${person.status === "Active" ? "inactive" : "active"}`}>
                          <i />{busyStaffId === person.id ? "Updating…" : person.status}
                        </button>
                      )}
                    </td>
                    <td>
                      {protection
                        ? <span className="sr-only">{protectionLabel}; delete unavailable</span>
                        : <button className="icon-button" onClick={() => setDeleteTarget(person)} disabled={Boolean(busyStaffId)} aria-label={`Delete ${person.name}`}><Trash2 size={16} /></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination from={pagination.from} to={pagination.to} total={pagination.totalItems} page={pagination.page} totalPages={pagination.totalPages} />
      </section>
      {deleteTarget && <div className="modal-layer"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-staff-title"><div className="modal-card__body"><h2 id="delete-staff-title">Delete staff</h2><p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p></div><div className="modal-card__actions"><button className="button button--secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button className="button button--danger" onClick={removeStaff} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</button></div></section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
