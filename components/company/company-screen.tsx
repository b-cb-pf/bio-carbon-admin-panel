"use client";

import { BriefcaseBusiness, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Company } from "@/lib/types";
import { companyApi } from "@/lib/api/company-api";
import { PageHeading } from "@/components/ui/page-heading";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";

export function CompanyScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Company[]>([]);
  useEffect(() => {
    let active = true;
    companyApi.list(query).then((data) => { if (active) setItems(data); });
    return () => { active = false; };
  }, [query]);
  return <div className="admin-container"><PageHeading icon={<BriefcaseBusiness size={17} />} title="Company" actions={<><SearchField value={query} onChange={setQuery} placeholder="Search by company name" /><Link href="/companies/new" className="button button--primary"><Plus size={14} />Add company</Link></>} /><section className="admin-card table-panel"><div className="table-wrap"><table className="admin-table"><thead><tr><th>Company name</th><th>Legal entity number</th><th>Contract start date</th><th>Contract end date</th><th><span className="sr-only">Edit</span></th></tr></thead><tbody>{items.map((company) => <tr key={company.id}><td><Link className="table-link" href={`/companies/${company.id}`}>{company.name}</Link></td><td>{company.legalEntityNumber}</td><td>{company.contractStartDate}</td><td>{company.contractEndDate}</td><td><Link className="icon-button" href={`/companies/${company.id}`} aria-label={`Edit ${company.name}`}><Pencil size={13} /></Link></td></tr>)}</tbody></table></div><Pagination /></section></div>;
}
