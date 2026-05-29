"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import authService from "@/services/auth.service";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await authService.requestPasswordReset(data.email);
      // Backend intentionally returns success even if email doesn't exist.
      toast.success(res?.message || "Check your email for a reset link.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send reset email. Please try again.");
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
            <h1 className="text-3xl font-bold text-[#000d45] mb-2">Forgot password?</h1>
            <p className="text-on-surface-variant">
              Enter your email and we’ll send you a reset link.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#000d45] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-outline-variant focus:border-primary"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white font-bold text-lg rounded-full hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Remembered?{" "}
                <Link href="/signin" className="font-bold text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}

