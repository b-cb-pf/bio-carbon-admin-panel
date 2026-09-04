"use client";

import { EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { FormError } from "@/components/ui/form-error";
import { authApi } from "@/lib/api/auth-api";
import { apiFieldErrors } from "@/lib/api/client";

type ResetState = "checking" | "valid" | "expired" | "error" | "done";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<ResetState>(token ? "checking" : "expired");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    authApi.validatePasswordReset(token)
      .then(({ valid }) => { if (active) setState(valid ? "valid" : "expired"); })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [token]);

  const rules = [
    { label: "One uppercase letter (A–Z)", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a–z)", valid: /[a-z]/.test(password) },
    { label: "One number (0–9)", valid: /\d/.test(password) },
    { label: "Minimum of 12 characters", valid: password.length >= 12 },
  ];
  const passwordsMatch = confirm === password;
  const valid = rules.every((rule) => rule.valid) && passwordsMatch;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      await authApi.resetPassword(token, password);
      setState("done");
    } catch (reason) {
      const fields = apiFieldErrors(reason);
      if (fields.token) setState("expired");
      else if (fields.password) setError(fields.password);
      else setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "checking") return <ResetStatus icon="" title="Checking reset link…" message="Please wait while we validate your link." />;
  if (state === "expired") return <ResetStatus icon="/assets/auth/link-expired-icon.svg" title="Link Expired" message="This link is no longer valid. Please request a new link to continue." />;
  if (state === "error") return <ResetStatus icon="/assets/auth/setup-password-error.svg" title="Something went wrong" message="Please try again later." />;
  if (state === "done") {
    return (
      <main className="auth-page auth-page--figma-status">
        <Image className="link-expired-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
        <div className="figma-status-content">
          <section className="figma-success-area">
            <div className="figma-status-message"><Image className="figma-status-icon" src="/assets/auth/account-created.svg" width={48} height={48} alt="" aria-hidden="true" /><div><h1>Password changed successfully</h1><p>Please login to continue.</p></div></div>
            <Link className="setup-password-login" href="/login">Login</Link>
          </section>
          <Brand light />
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page--setup-password">
      <Image className="setup-password-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
      <div className="auth-content setup-password-content">
        <Brand light />
        <div className="setup-password-heading"><h1>Create a new password</h1><p>Please set a new password to continue.</p></div>
        <form className="auth-card setup-password-card" onSubmit={submit}>
          <FormError message={error} />
          <label className="field"><span>Password <i className="required">*</i></span><div className="password-wrap"><input type={show ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Password" autoComplete="new-password" minLength={12} maxLength={128} autoFocus disabled={submitting} /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide passwords" : "Show passwords"}>{show ? <EyeOff size={20} /> : <Image src="/assets/auth/password-visibility-off.svg" width={20} height={20} alt="" />}</button></div></label>
          <ul className="password-rules">{rules.map((rule) => <li key={rule.label} className={rule.valid ? "valid" : ""}>{rule.label}</li>)}</ul>
          <label className="field"><span>Confirm password <i className="required">*</i></span><div className="password-wrap"><input type={show ? "text" : "password"} value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(""); }} placeholder="Confirm password" autoComplete="new-password" maxLength={128} disabled={submitting} aria-invalid={Boolean(confirm) && !passwordsMatch} /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide passwords" : "Show passwords"}>{show ? <EyeOff size={20} /> : <Image src="/assets/auth/password-visibility-off.svg" width={20} height={20} alt="" />}</button></div>{confirm && !passwordsMatch && <small className="field-error">Passwords do not match.</small>}</label>
          <button className="button button--primary" type="submit" disabled={!valid || submitting}>{submitting ? "Setting password…" : "Set password"}</button>
        </form>
      </div>
    </main>
  );
}

function ResetStatus({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <main className="auth-page auth-page--figma-status">
      <Image className="link-expired-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
      <div className="figma-status-content"><section className="figma-status-message">{icon && <Image className="figma-status-icon" src={icon} width={48} height={48} alt="" aria-hidden="true" />}<div><h1>{title}</h1><p>{message}</p></div></section><Brand light /></div>
    </main>
  );
}
