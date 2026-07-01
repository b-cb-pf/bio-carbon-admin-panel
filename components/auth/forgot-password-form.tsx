"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/brand";
import { authApi } from "@/lib/api/auth-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await authApi.requestPasswordReset(email); setSent(true); }
  return <main className="auth-page"><div className="auth-content"><Brand light />{sent ? <section className="auth-card success-card"><span className="success-icon"><Check size={22} /></span><h2>Check your email</h2><p>We sent password reset instructions to <strong>{email}</strong>.</p><Link className="button button--primary" href="/login">Back to login</Link></section> : <form className="auth-card" onSubmit={submit}><h2>Forgot password</h2><p className="auth-subtitle" style={{ color: "#737d78", textAlign: "center" }}>Enter your email and we’ll send you a reset link.</p><label className="field"><span>Email <i className="required">*</i></span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" autoFocus /></label><button className="button button--primary" disabled={!email} type="submit">Send reset link</button><Link className="forgot-link" href="/login"><ArrowLeft size={11} /> Back to login</Link></form>}</div></main>;
}
