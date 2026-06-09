"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/validations';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { oauthErrorMessage } from '@/lib/socialAuth';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const redirectAfterAuth =
    searchParams.get('redirect')?.startsWith('/') &&
    !searchParams.get('redirect')!.startsWith('//')
      ? searchParams.get('redirect')!
      : '/discover';

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      toast.error(oauthErrorMessage(oauthError));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({ 
        email: data.email, 
        password: data.password 
      });

      if (result.success) {
        toast.success('Welcome back!');
        const redirect = searchParams.get('redirect');
        router.push(redirect && redirect.startsWith('/') ? redirect : '/discover');
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : result.error?.message ||
              (typeof result.error === 'object' && result.error !== null
                ? JSON.stringify(result.error)
                : null) ||
              'Invalid email or password';

        toast.error(errorMsg);
      }
    } catch (error: any) {
      // Extract the most specific error message
      const errorMessage = 
        typeof error === 'string'
          ? error
          : error?.message ||
            error?.error ||
            error?.detail ||
            'An error occurred. Please try again.';
      
      toast.error(errorMessage);
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
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-2">Welcome back</h2>
            <p className="text-on-surface-variant">Sign in to your account</p>
          </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-outline-variant focus:border-brand-emerald'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-outline-variant focus:border-brand-emerald'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-brand-emerald transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded border-2 border-outline-variant text-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
                />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-semibold text-brand-emerald hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-emerald text-white font-bold text-lg rounded-full hover:bg-brand-emerald/90 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-on-surface-variant">Or continue with</span>
            </div>
          </div>

          <SocialAuthButtons mode="signin" nextPath={redirectAfterAuth} />

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-brand-emerald hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}
