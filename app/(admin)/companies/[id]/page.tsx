"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CompanyForm } from "@/components/company/company-form";
import { companyApi } from "@/lib/api/company-api";
import type { Company } from "@/lib/types";

export default function EditCompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    companyApi.getById(id)
      .then((response) => { if (active) setCompany(response); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load company."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="admin-container"><p className="form-error" role="alert">{error}</p></div>;
  if (!company) return <div className="admin-container">Loading company…</div>;
  return <CompanyForm mode="edit" company={company} />;
}
