"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import authService from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const hasParams = useMemo(() => Boolean(uid && token), [uid, token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasParams) {
      toast.error("Invalid reset link.");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(uid, token, password);
      toast.success(res?.message || "Password reset successfully.");
      router.push("/signin");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-[#000d45] mb-2">Reset password</h1>
            <p className="text-on-surface-variant">Choose a new password for your account.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
            {!hasParams ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">
                  This reset link is missing required parameters. Please request a new one.
                </p>
                <Link href="/forgot-password" className="font-bold text-primary hover:underline">
                  Go to forgot password
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#000d45] mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a new password"
                      className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all border-outline-variant focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#000d45] mb-2">
                    Confirm password
                  </label>
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all border-outline-variant focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white font-bold text-lg rounded-full hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}

