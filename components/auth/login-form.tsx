"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { authApi } from "@/lib/api/auth-api";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await authApi.login(email, password); router.push("/staff"); }
  return <main className="auth-page"><div className="auth-content"><Brand light /><form className="auth-card" onSubmit={submit}><h2>Login</h2><label className="field"><span>Email <i className="required">*</i></span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" autoFocus /></label><label className="field"><span>Password <i className="required">*</i></span><div className="password-wrap"><input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label><button className="button button--primary" disabled={!email || !password} type="submit">Login</button><Link className="forgot-link" href="/forgot-password">Forgot password</Link></form><p className="auth-footer">CarbonProfile administration portal</p></div></main>;
}
