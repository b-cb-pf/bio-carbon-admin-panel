"use client";

import { EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { FormError } from "@/components/ui/form-error";
import { authApi } from "@/lib/api/auth-api";
import { apiErrorCode, apiErrorMessage } from "@/lib/api/client";

type InvitationState = "checking" | "valid" | "invalid" | "error";

export function SetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [invitationState, setInvitationState] = useState<InvitationState>(token ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    authApi.validateInvitation(token)
      .then(({ valid }) => { if (active) setInvitationState(valid ? "valid" : "invalid"); })
      .catch(() => { if (active) setInvitationState("error"); });
    return () => { active = false; };
  }, [token]);

  const rules = [
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "One number (0-9)", valid: /\d/.test(password) },
    { label: "Minimum of 12 characters", valid: password.length >= 12 },
  ];
  const passwordsMatch = confirm === password;
  const valid = invitationState === "valid" && rules.every((rule) => rule.valid) && passwordsMatch;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      await authApi.setPassword(token, password);
      setDone(true);
    } catch (reason) {
      if (apiErrorCode(reason) === "STAFF_INVITATION_INVALID") {
        setInvitationState("invalid");
      } else {
        setError(apiErrorMessage(reason, "Unable to set your password. Please try again."));
        setInvitationState("error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (invitationState === "checking") {
    return <AuthMessage title="Checking invitation…" message="Please wait while we validate your invitation link." />;
  }

  if (invitationState === "invalid") {
    return <FigmaStatusScreen icon="/assets/auth/link-expired-icon.svg" title="Link Expired" message="This link is no longer valid. Please contact the system administrator to request a new one." />;
  }

  if (invitationState === "error") {
    return <FigmaStatusScreen icon="/assets/auth/setup-password-error.svg" title="Something went wrong" message="Please try again later." />;
  }

  if (done) {
    return (
      <main className="auth-page auth-page--figma-status">
        <Image className="link-expired-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
        <div className="figma-status-content">
          <section className="figma-success-area">
            <div className="figma-status-message">
              <Image className="figma-status-icon" src="/assets/auth/account-created.svg" width={48} height={48} alt="" aria-hidden="true" />
              <div><h1>Welcome! Your account has been created successfully</h1><p>Please login to get started.</p></div>
            </div>
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
        <div className="setup-password-heading"><h1>Set up your account</h1><p>Please create a new password to get started.</p></div>
        <form className="auth-card setup-password-card" onSubmit={submit}>
          <FormError message={error} />
          <label className="field">
            <span>Password <i className="required">*</i></span>
            <div className="password-wrap">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                placeholder="Password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                autoFocus
                disabled={submitting}
                aria-invalid={Boolean(error)}
              />
              <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={20} /> : <Image src="/assets/auth/password-visibility-off.svg" width={20} height={20} alt="" />}
              </button>
            </div>
          </label>
          <ul className="password-rules">
            {rules.map((rule) => <li key={rule.label} className={rule.valid ? "valid" : ""}>{rule.label}</li>)}
          </ul>
          <label className="field">
            <span>Confirm password <i className="required">*</i></span>
            <div className="password-wrap">
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(event) => { setConfirm(event.target.value); setError(""); }}
                placeholder="Confirm password"
                autoComplete="new-password"
                maxLength={128}
                disabled={submitting}
                aria-invalid={Boolean(confirm) && !passwordsMatch}
              />
              <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide passwords" : "Show passwords"}>
                {show ? <EyeOff size={20} /> : <Image src="/assets/auth/password-visibility-off.svg" width={20} height={20} alt="" />}
              </button>
            </div>
            {confirm && !passwordsMatch && <small className="field-error">Passwords do not match.</small>}
          </label>
          <button className="button button--primary" type="submit" disabled={!valid || submitting}>
            {submitting ? "Setting password…" : "Set password"}
          </button>
        </form>
      </div>
    </main>
  );
}

function FigmaStatusScreen({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <main className="auth-page auth-page--figma-status">
      <Image className="link-expired-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
      <div className="figma-status-content">
        <section className="figma-status-message">
          <Image className="figma-status-icon" src={icon} width={48} height={48} alt="" aria-hidden="true" />
          <div><h1>{title}</h1><p>{message}</p></div>
        </section>
        <Brand light />
      </div>
    </main>
  );
}

function AuthMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="auth-page">
      <div className="auth-content">
        <Brand light />
        <section className="auth-card success-card">
          <h2>{title}</h2>
          <p>{message}</p>
        </section>
      </div>
    </main>
  );
}
