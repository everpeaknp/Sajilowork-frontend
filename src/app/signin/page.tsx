"use client";

import { Suspense, useEffect, useState } from 'react';
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
import { tokenManager } from '@/lib/api/client';
import { persistSessionCookies, clearSessionCookies } from '@/lib/authSession';
import { isJwtNotExpired } from '@/lib/jwt';
import { loginSchema, type LoginFormData } from '@/validations';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { oauthErrorMessage } from '@/lib/socialAuth';
import { userService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { normalizeUserFromApi, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import { cn } from '@/lib/utils';

const LOGIN_ROLE_OPTIONS: {
  value: 'customer' | 'tasker';
  label: string;
}[] = [
  {
    value: 'customer',
    label: 'Employer',
  },
  {
    value: 'tasker',
    label: 'Freelancer',
  },
];

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const redirectAfterAuth =
    searchParams.get('redirect')?.startsWith('/') &&
    !searchParams.get('redirect')!.startsWith('//')
      ? searchParams.get('redirect')!
      : '/dashboard';

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      toast.error(oauthErrorMessage(oauthError));
    }
  }, [searchParams]);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    const access = tokenManager.getAccessToken();
    const refresh = tokenManager.getRefreshToken();
    if (!redirect || !access || !refresh) return;

    if (!isJwtNotExpired(access) && !isJwtNotExpired(refresh)) {
      tokenManager.clearTokens();
      void clearSessionCookies();
      return;
    }

    void persistSessionCookies(access, refresh).then(() => {
      window.location.assign(redirect);
    });
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'customer',
      remember: false,
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'tasker' || roleParam === 'customer') {
      setValue('role', roleParam);
    }
    const emailParam = searchParams.get('email');
    if (emailParam?.trim()) {
      setValue('email', emailParam.trim());
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        email: data.email.trim(),
        password: data.password,
      });

      if (result.success) {
        const currentUser = useAuthStore.getState().user;
        if (
          currentUser &&
          data.role &&
          currentUser.role !== data.role &&
          currentUser.role !== 'admin'
        ) {
          try {
            const roleRes = await userService.updateProfile({ role: data.role });
            if (roleRes.success && roleRes.data) {
              setUser(
                normalizeUserFromApi(roleRes.data as unknown as Record<string, unknown>),
              );
              notifyUserProfileUpdated();
            }
          } catch {
            toast.message(
              `Signed in, but could not switch to ${data.role === 'tasker' ? 'Freelancer' : 'Employer'} mode. You can switch from the dashboard.`,
            );
          }
        } else if (currentUser && data.role && currentUser.role === data.role) {
          notifyUserProfileUpdated();
        }

        toast.success(
          data.role === 'tasker'
            ? 'Welcome back — signed in as Freelancer'
            : 'Welcome back — signed in as Employer',
        );
        const redirect = searchParams.get('redirect');
        const target =
          redirect && redirect.startsWith('/') && !redirect.startsWith('//')
            ? redirect
            : '/dashboard';
        await new Promise((resolve) => setTimeout(resolve, 50));
        window.location.assign(target);
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

      <div className="flex flex-1 items-center justify-center bg-white p-4 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-2">Welcome back</h2>
            <p className="text-on-surface-variant">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
            <h2 className="text-3xl font-bold text-brand-dark mb-6">Sign In</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Password</label>
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

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-sm font-semibold text-brand-dark">
                    Sign in as
                  </label>
                  <span className="text-xs text-on-surface-variant">
                    You can switch later
                  </span>
                </div>
                <input type="hidden" {...register('role')} />
                <div
                  className="grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Sign in role"
                >
                  {LOGIN_ROLE_OPTIONS.map((option) => {
                    const isActive = selectedRole === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setValue('role', option.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        aria-pressed={isActive}
                        className={cn(
                          'rounded-2xl border-2 px-3.5 py-3 text-center text-sm font-bold transition-all',
                          isActive
                            ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald shadow-[0_0_0_1px_rgba(82,196,127,0.25)]'
                            : 'border-outline-variant bg-white text-brand-dark hover:border-brand-emerald/50 hover:bg-surface-dim',
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="w-4 h-4 rounded border-2 border-outline-variant text-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
                  />
                  <span className="text-sm text-on-surface-variant">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-brand-emerald hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-emerald text-white font-bold text-base rounded-2xl hover:bg-brand-emerald/90 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in as {selectedRole === 'tasker' ? 'Freelancer' : 'Employer'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-on-surface-variant">Or continue with</span>
              </div>
            </div>

            <SocialAuthButtons
              mode="signin"
              role={selectedRole === 'tasker' ? 'tasker' : 'customer'}
              nextPath={redirectAfterAuth}
            />

            <p className="text-center mt-6 text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link
                href={`/signup?role=${encodeURIComponent(selectedRole || 'customer')}`}
                className="font-bold text-brand-emerald hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-on-surface-variant">
          Loading…
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
