import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function SetupPasswordPage() {
  return <Suspense fallback={null}><SetPasswordForm /></Suspense>;
}
