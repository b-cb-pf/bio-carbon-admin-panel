import { notFound } from "next/navigation";
import { CompanyForm } from "@/components/company/company-form";
import { companyApi } from "@/lib/api/company-api";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let company;
  try { company = await companyApi.getById(id); } catch { notFound(); }
  return <CompanyForm mode="edit" company={company} />;
}
