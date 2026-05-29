"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';

// Lazy load components to identify which one is causing issues
const Navbar = dynamic(() => import('@/components/common/navbar'), {
  loading: () => <div>Loading navbar...</div>,
  ssr: false
});

const Footer = dynamic(() => import('@/components/common/footer'), {
  loading: () => <div>Loading footer...</div>,
  ssr: false
});

import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/validations';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'customer',
        phone_number: '',
        terms_accepted: false,
      },
    });

  const password = watch('password');
  const selectedRole = watch('role') as 'customer' | 'tasker';

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'tasker' || roleParam === 'customer') {
      setValue('role', roleParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        role: data.role,
        phone_number: data.phone_number,
      });

      if (result.success) {
        toast.success('Account created successfully! Welcome to tasknepal.');
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
              'Failed to create account';

        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg =
        typeof error === 'string'
          ? error
          : error?.message || 'An error occurred during registration';
      toast.error(errorMsg);
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="flex-1 bg-white flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#000d45] mb-2">Create your account</h2>
            <p className="text-on-surface-variant">Get started with tasknepal</p>
          </div>

          {/* Sign Up Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-outline-variant">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#000d45] mb-2">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      type="text"
                      {...register('first_name')}
                      placeholder="John"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.first_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#000d45] mb-2">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      type="text"
                      {...register('last_name')}
                      placeholder="Doe"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.last_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-[#000d45] mb-2">
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
                      : 'border-outline-variant focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-[#000d45] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Create a strong password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-outline-variant focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-[#000d45] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('password_confirm')}
                  placeholder="Re-enter your password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.password_confirm 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-outline-variant focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-red-500">{errors.password_confirm.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#000d45] mb-2">
                I want to
              </label>
              <select
                {...register('role')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                  errors.role 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-outline-variant focus:border-primary'
                }`}
              >
                <option value="customer">Post tasks and hire taskers</option>
                <option value="tasker">Complete tasks and earn money</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-surface-dim/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-[#000d45] mb-2">Password must contain:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <CheckCircle className={`w-4 h-4 ${password?.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <CheckCircle className={`w-4 h-4 ${/[A-Z]/.test(password || '') ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <CheckCircle className={`w-4 h-4 ${/[a-z]/.test(password || '') ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <CheckCircle className={`w-4 h-4 ${/[0-9]/.test(password || '') ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>One number</span>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms_accepted')}
                  className="w-5 h-5 mt-0.5 rounded border-2 border-outline-variant text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-on-surface-variant">
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms_accepted && (
                <p className="mt-1 text-sm text-red-500">{errors.terms_accepted.message}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-bold text-lg rounded-full hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
              <span className="px-4 bg-white text-on-surface-variant">Or sign up with</span>
            </div>
          </div>

          <SocialAuthButtons
            mode="signup"
            role={selectedRole === 'tasker' ? 'tasker' : 'customer'}
            nextPath={
              searchParams.get('redirect')?.startsWith('/') &&
              !searchParams.get('redirect')!.startsWith('//')
                ? searchParams.get('redirect')!
                : '/discover'
            }
          />

          {/* Sign In Link */}
          <p className="text-center mt-6 text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/signin" className="font-bold text-primary hover:underline">
              Sign in
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
