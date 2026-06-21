"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import authService from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type VerifyState = "pending" | "verifying" | "success" | "error";

const SETTINGS_VERIFY_PATH = "/dashboard/settings?tab=verify";

function safeRedirectPath(raw: string | null): string | null {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return null;
}

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = searchParams.get("token") || "";
  const pending = searchParams.get("pending") === "1";
  const email = searchParams.get("email") || "";
  const redirectParam = searchParams.get("redirect");

  const [state, setState] = useState<VerifyState>(token ? "verifying" : pending ? "pending" : "error");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const canResend = useMemo(() => Boolean(email.trim()), [email]);

  const skipDestination = useMemo(() => {
    return safeRedirectPath(redirectParam) ?? "/dashboard";
  }, [redirectParam]);
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void authService
      .verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setState("success");
        setMessage(res.message || res.data?.message || "Email verified successfully.");
        toast.success("Email verified!");
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return;
        setState("error");
        setMessage(err?.message || "Verification link is invalid or expired.");
        toast.error(err?.message || "Verification failed.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      const res = await authService.resendVerificationEmail(email.trim());
      toast.success(res.message || "Verification email sent.");
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: string }).message)
          : "Could not resend verification email.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleSkipForNow = () => {
    if (isAuthenticated) {
      router.push(skipDestination);
      return;
    }

    router.push(`/signin?redirect=${encodeURIComponent(SETTINGS_VERIFY_PATH)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">Verify your email</h1>
            <p className="text-on-surface-variant">
              {state === "pending"
                ? "We sent a verification link to your inbox."
                : state === "verifying"
                  ? "Confirming your email address…"
                  : state === "success"
                    ? "Your email is verified."
                    : "We could not verify your email."}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
            {state === "pending" ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <Mail className="h-7 w-7" />
                </div>
                <p className="text-sm text-on-surface-variant">
                  {email ? (
                    <>
                      Check <span className="font-semibold text-brand-dark">{email}</span> and open
                      the verification link to activate your account.
                    </>
                  ) : (
                    "Check your inbox and open the verification link to activate your account."
                  )}
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={isResending}
                    className="w-full py-3 bg-brand-emerald text-white font-bold text-lg rounded-full hover:bg-brand-emerald/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? "Sending…" : "Resend verification email"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSkipForNow}
                  className="w-full py-3 rounded-full border-2 border-outline-variant bg-white font-bold text-lg text-brand-dark transition-all hover:border-brand-emerald/40 hover:bg-brand-emerald/5"
                >
                  Skip for now
                </button>
                <p className="text-xs text-on-surface-variant">
                  You can verify later from{" "}
                  <span className="font-semibold text-brand-dark">Dashboard → Settings → Verify Account</span>{" "}
                  and resend the verification email from there.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 font-bold text-brand-emerald hover:underline"
                >
                  Back to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            {state === "verifying" ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-emerald" />
                <p className="text-sm text-on-surface-variant">Please wait…</p>
              </div>
            ) : null}

            {state === "success" ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="text-sm text-on-surface-variant">{message}</p>
                <Link
                  href="/signin"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-emerald py-3 font-bold text-lg text-white shadow-lg transition-all hover:bg-brand-emerald/90"
                >
                  Continue to sign in
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : null}

            {state === "error" && !pending ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <p className="text-sm text-on-surface-variant">{message || "Invalid or expired verification link."}</p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={isResending}
                    className="w-full py-3 bg-brand-emerald text-white font-bold text-lg rounded-full hover:bg-brand-emerald/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? "Sending…" : "Resend verification email"}
                  </button>
                ) : null}
                <Link href="/signin" className="font-bold text-brand-emerald hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-emerald" />
        </div>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
