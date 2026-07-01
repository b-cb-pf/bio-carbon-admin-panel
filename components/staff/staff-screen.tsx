"use client";

import { Trash2, UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Staff } from "@/lib/types";
import { staffApi } from "@/lib/api/staff-api";
import { PageHeading } from "@/components/ui/page-heading";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";

export function StaffScreen() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    staffApi.list(query).then((data) => { if (active) setStaff(data); }).catch(() => { if (active) setError("Unable to load staff"); });
    return () => { active = false; };
  }, [query]);

  async function toggleStatus(person: Staff) {
    const status = person.status === "Active" ? "Inactive" : "Active";
    const updated = await staffApi.updateStatus(person.id, status);
    setStaff((current) => current.map((item) => item.id === person.id ? updated : item));
  }

  async function removeStaff() {
    if (!deleteTarget) return;
    await staffApi.remove(deleteTarget.id);
    setStaff((current) => current.filter((person) => person.id !== deleteTarget.id));
    setToast("Staff removed successfully");
    setDeleteTarget(null);
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <div className="admin-container">
      <PageHeading icon={<UsersRound size={17} />} title="Staff" actions={<><SearchField value={query} onChange={setQuery} placeholder="Search by name or email" /><Link href="/staff/new" className="button button--primary"><UserPlus size={14} />Add staff</Link></>} />
      <section className="admin-card table-panel">
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th><span className="sr-only">Delete</span></th></tr></thead>
            <tbody>{staff.map((person) => <tr key={person.id}><td>{person.name}</td><td>{person.email}</td><td><button className={`status-toggle ${person.status === "Active" ? "active" : ""}`} onClick={() => toggleStatus(person)} aria-label={`Set ${person.name} ${person.status === "Active" ? "inactive" : "active"}`}><i />{person.status}</button></td><td><button className="icon-button" onClick={() => setDeleteTarget(person)} aria-label={`Delete ${person.name}`}><Trash2 size={14} /></button></td></tr>)}</tbody>
          </table>
        </div>
        <Pagination />
      </section>
      {error && <div className="toast">{error}</div>}
      {deleteTarget && <div className="modal-layer"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-staff-title"><div className="modal-card__body"><h2 id="delete-staff-title">Delete staff</h2><p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p></div><div className="modal-card__actions"><button className="button button--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="button button--danger" onClick={removeStaff}>Delete</button></div></section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
