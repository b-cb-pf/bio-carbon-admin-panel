"use client";

import { BriefcaseBusiness, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Company } from "@/lib/types";
import { companyApi } from "@/lib/api/company-api";
import { PageHeading } from "@/components/ui/page-heading";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { FormError } from "@/components/ui/form-error";
import { apiErrorMessage } from "@/lib/api/client";
import type { PaginationResponse } from "@/lib/api/staff-api";

const emptyPagination: PaginationResponse = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, from: 0, to: 0 };

export function CompanyScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>(emptyPagination);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    companyApi.list(query, page)
      .then((data) => { if (active) { setItems(data.items); setPagination(data.pagination); setError(""); } })
      .catch((reason) => { if (active) setError(apiErrorMessage(reason, "Unable to load companies. Please try again.")); });
    return () => { active = false; };
  }, [query, page]);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return <div className="admin-container"><PageHeading icon={<BriefcaseBusiness size={17} />} title="Company" actions={<><SearchField value={query} onChange={changeQuery} placeholder="Search by company name" /><Link href="/companies/new" className="button button--primary"><Plus size={14} />Add company</Link></>} /><FormError message={error} /><section className="admin-card table-panel"><div className="table-wrap"><table className="admin-table"><thead><tr><th>Company name</th><th>Legal entity number</th><th>Contract start date</th><th>Contract end date</th><th><span className="sr-only">Edit</span></th></tr></thead><tbody>{items.map((company) => <tr key={company.id}><td><Link className="table-link" href={`/companies/${company.id}`}>{company.name}</Link></td><td>{company.legalEntityNumber}</td><td>{company.contractStartDate}</td><td>{company.contractEndDate}</td><td><Link className="icon-button" href={`/companies/${company.id}`} aria-label={`Edit ${company.name}`}><Pencil size={13} /></Link></td></tr>)}</tbody></table></div><Pagination from={pagination.from} to={pagination.to} total={pagination.totalItems} page={pagination.page} totalPages={pagination.totalPages} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} /></section></div>;
}
