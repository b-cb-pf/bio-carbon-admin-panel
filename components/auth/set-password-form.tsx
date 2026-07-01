"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/brand";
import { authApi } from "@/lib/api/auth-api";

export function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const rules = [{ label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(password) }, { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(password) }, { label: "One number (0-9)", valid: /\d/.test(password) }, { label: "Minimum of 8 characters", valid: password.length >= 8 }];
  const valid = rules.every((rule) => rule.valid) && confirm === password;
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (valid) { await authApi.setPassword(password); setDone(true); } }
  return <main className="auth-page"><div className="auth-content"><Brand light />{done ? <section className="auth-card success-card"><span className="success-icon"><Check size={22} /></span><h2>Password changed successfully</h2><p>Your account is ready. You can now sign in to CarbonProfile.</p><a className="button button--primary" href="/login">Login</a></section> : <><h1>Set up your account</h1><p className="auth-subtitle">Please create a new password to get started.</p><form className="auth-card" onSubmit={submit}><label className="field"><span>Password <i className="required">*</i></span><div className="password-wrap"><input type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoFocus /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label><ul className="password-rules">{rules.map((rule) => <li key={rule.label} className={rule.valid ? "valid" : ""}>{rule.label}</li>)}</ul><label className="field"><span>Confirm password <i className="required">*</i></span><div className="password-wrap"><input type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" /></div></label><button className="button button--primary" type="submit" disabled={!valid}>Set password</button></form></>}</div></main>;
}
