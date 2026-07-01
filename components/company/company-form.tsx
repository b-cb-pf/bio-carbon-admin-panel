"use client";

import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";
import { companyApi } from "@/lib/api/company-api";

export function CompanyForm({ mode, company }: { mode: "add" | "edit"; company?: Company }) {
  const router = useRouter();
  const initial = useMemo(() => ({ name: company?.name ?? "", legal: company?.legalEntityNumber ?? "", contract: company ? `${company.contractStartDate} - ${company.contractEndDate}` : "", email: company?.adminEmail ?? "" }), [company]);
  const [values, setValues] = useState(initial);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const changed = JSON.stringify(values) !== JSON.stringify(initial);
  const valid = values.name.trim() && values.legal.trim() && values.contract.trim() && (mode === "edit" || values.email.trim());

  function update(key: keyof typeof values, value: string) { setValues((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [contractStartDate = values.contract, contractEndDate = values.contract] = values.contract.split(" - ");
    const payload = { name: values.name, legalEntityNumber: values.legal, contractStartDate, contractEndDate, adminEmail: values.email };
    if (mode === "add") await companyApi.create(payload);
    else if (company) await companyApi.update(company.id, payload);
    router.push("/companies");
  }

  async function removeCompany() {
    if (company) await companyApi.remove(company.id);
    router.push("/companies");
  }

  return <div className="admin-container"><div className="form-page-header"><div><Link className="back-link" href="/companies"><ArrowLeft size={13} />Back</Link><h1 className="form-page-title">{mode === "add" ? "Add company" : "Edit company"}</h1></div>{mode === "edit" && <button className="button button--danger" onClick={() => setDeleteOpen(true)}>Delete</button>}</div><form className="form-card" onSubmit={submit}><section className="form-section"><h2>Company Information</h2><label className="field"><span>Company name <i className="required">*</i></span><input value={values.name} onChange={(event) => update("name", event.target.value)} required placeholder="Company name" /></label><label className="field"><span>Legal entity number <i className="required">*</i></span><input value={values.legal} onChange={(event) => update("legal", event.target.value)} required placeholder="Legal entity number" /></label><label className="field"><span>Contract date</span><div className="password-wrap"><input value={values.contract} onChange={(event) => update("contract", event.target.value)} required placeholder="Start date - End date" /><button type="button" aria-label="Select contract date"><CalendarDays size={14} /></button></div></label></section>{mode === "add" && <section className="form-section"><h2>Admin information</h2><label className="field"><span>Email <i className="required">*</i></span><input value={values.email} onChange={(event) => update("email", event.target.value)} type="email" required placeholder="Email" /></label></section>}<div className="form-actions"><Link href="/companies" className="button button--secondary">Cancel</Link><button className="button button--primary" disabled={!valid || (mode === "edit" && !changed)} type="submit">Confirm</button></div></form>{deleteOpen && <div className="modal-layer"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-company-title"><div className="modal-card__body"><h2 id="delete-company-title">Delete company</h2><p>This company and all associated data will be permanently deleted. This action cannot be undone.</p></div><div className="modal-card__actions"><button className="button button--secondary" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="button button--danger" onClick={removeCompany}>Delete</button></div></section></div>}</div>;
}
