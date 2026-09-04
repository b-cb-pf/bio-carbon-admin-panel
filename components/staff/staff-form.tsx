"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { staffApi } from "@/lib/api/staff-api";
import { apiErrorMessage, apiFieldErrors } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";

export function StaffForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      await staffApi.create({
        firstName: String(data.get("firstName") ?? "").trim(),
        lastName: String(data.get("lastName") ?? "").trim(),
        email,
      });
      router.push("/staff?created=1");
    } catch (reason) {
      const nextFieldErrors = apiFieldErrors(reason);
      setFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length === 0) {
        setError(apiErrorMessage(reason, "Unable to send the staff invitation. Please try again."));
      }
      setSubmitting(false);
    }
  }

  return <div className="admin-container"><Link className="back-link" href="/staff"><ArrowLeft size={16} />Back</Link><h1 className="form-page-title">Add staff</h1><form className="form-card" onSubmit={submit}><FormError message={error} /><section className="form-section"><h2>Staff Information</h2><label className="field"><span>First name <i className="required">*</i></span><input name="firstName" required placeholder="First name" disabled={submitting} aria-invalid={Boolean(fieldErrors.firstName)} />{fieldErrors.firstName && <small className="field-error">{fieldErrors.firstName}</small>}</label><label className="field"><span>Last name <i className="required">*</i></span><input name="lastName" required placeholder="Last name" disabled={submitting} aria-invalid={Boolean(fieldErrors.lastName)} />{fieldErrors.lastName && <small className="field-error">{fieldErrors.lastName}</small>}</label><label className="field"><span>Email <i className="required">*</i></span><input name="email" required type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); setFieldErrors((current) => ({ ...current, email: "" })); }} placeholder="Email" disabled={submitting} aria-invalid={Boolean(fieldErrors.email)} />{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label></section><div className="form-actions"><Link href="/staff" className="button button--secondary">Cancel</Link><button className="button button--primary" type="submit" disabled={!email || submitting}>{submitting ? "Sending invitation…" : "Confirm"}</button></div></form></div>;
}
