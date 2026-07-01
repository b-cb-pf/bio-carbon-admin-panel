"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { staffApi } from "@/lib/api/staff-api";

export function StaffForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await staffApi.create({ name: `${data.get("firstName")} ${data.get("lastName")}`.trim(), email });
    router.push("/staff?created=1");
  }

  return <div className="admin-container"><Link className="back-link" href="/staff"><ArrowLeft size={13} />Back</Link><h1 className="form-page-title">Add staff</h1><form className="form-card" onSubmit={submit}><section className="form-section"><h2>Staff Information</h2><label className="field"><span>First name <i className="required">*</i></span><input name="firstName" required placeholder="First name" /></label><label className="field"><span>Last name <i className="required">*</i></span><input name="lastName" required placeholder="Last name" /></label><label className="field"><span>Email <i className="required">*</i></span><input name="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" /></label></section><div className="form-actions"><Link href="/staff" className="button button--secondary">Cancel</Link><button className="button button--primary" type="submit" disabled={!email}>Confirm</button></div></form></div>;
}
