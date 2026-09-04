"use client";

import { EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { authApi } from "@/lib/api/auth-api";
import { apiErrorCode } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";

export function LoginForm() {
  const router = useRouter();
  const reason = useSearchParams().get("reason");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const notice = reason === "account-inactive"
    ? "Your account is inactive. Please contact a system administrator."
    : reason === "session-expired"
      ? "Your session has expired. Please sign in again."
      : "";
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authApi.login(email, password);
      router.replace("/staff");
    } catch (reason) {
      setError(apiErrorCode(reason) === "AUTH_INVALID_CREDENTIALS"
        ? "The email or password you entered is incorrect. Please try again."
        : "We couldn’t sign you in. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <Image className="login-background" src="/assets/auth/link-expired-background.svg" width={819} height={640} alt="" aria-hidden="true" priority />
      <div className="login-content">
        <Brand light />
        <form className="auth-card login-card" onSubmit={submit} noValidate>
          <h1>Login</h1>
          <div className="login-fields">
            {notice && <p className={`login-notice ${reason === "session-expired" ? "login-notice--error" : ""}`} role="status">{notice}</p>}
            <FormError message={error} />
            <label className="field">
              <span>Email <i className="required">*</i></span>
              <input type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="Email" autoComplete="email" autoFocus disabled={submitting} aria-invalid={Boolean(error)} />
            </label>
            <label className="field">
              <span>Password <i className="required">*</i></span>
              <div className="password-wrap">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Password" autoComplete="current-password" disabled={submitting} aria-invalid={Boolean(error)} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={20} /> : <Image src="/assets/auth/password-visibility-off.svg" width={20} height={20} alt="" />}
                </button>
              </div>
            </label>
          </div>
          <div className="login-actions">
            <button className="button button--primary" disabled={!email || !password || submitting} type="submit">{submitting ? "Signing in…" : "Login"}</button>
            <Link className="forgot-link" href="/forgot-password">Forgot password</Link>
          </div>
        </form>
      </div>
      <footer className="login-legal"><span>ข้อตกลงและเงื่อนไขการใช้งาน</span><i /><span>นโยบายความเป็นส่วนตัว</span></footer>
    </main>
  );
}
