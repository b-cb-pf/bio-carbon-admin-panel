"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/brand";
import { FormError } from "@/components/ui/form-error";
import { authApi } from "@/lib/api/auth-api";
import { apiErrorMessage, apiFieldErrors } from "@/lib/api/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setEmailError("");
    try {
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (reason) {
      const fields = apiFieldErrors(reason);
      if (fields.email) setEmailError(fields.email);
      else setError(apiErrorMessage(reason, "Unable to request a password reset. Please try again later."));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main className="auth-page auth-page--figma-status">
        <Image className="link-expired-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
        <div className="figma-status-content">
          <section className="figma-status-message">
            <Image className="figma-status-icon" src="/assets/auth/account-created.svg" width={48} height={48} alt="" aria-hidden="true" />
            <div><h1>Check your email</h1><p>We’ve sent a password reset link to your email. Please check your inbox and follow the instructions.</p></div>
          </section>
          <Brand light />
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page--reset-flow">
      <Image className="setup-password-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
      <div className="reset-flow-content">
        <Brand light />
        <div className="setup-password-heading"><h1>Reset your password</h1><p>Please enter the email address you used to sign up. We will send you a link to reset your password.</p></div>
        <form className="auth-card reset-request-card" onSubmit={submit} noValidate>
          <FormError message={error} />
          <label className="field"><span>Email <i className="required">*</i></span><input type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); setError(""); }} placeholder="Email" autoComplete="email" autoFocus disabled={submitting} aria-invalid={Boolean(emailError)} />{emailError && <small className="field-error">{emailError}</small>}</label>
          <button className="button button--primary" type="submit" disabled={!email || submitting}>{submitting ? "Sending…" : "Confirm"}</button>
        </form>
      </div>
    </main>
  );
}
