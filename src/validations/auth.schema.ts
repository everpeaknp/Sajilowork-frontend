/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for authentication forms
 */

import { z } from 'zod';

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register Schema
 */
export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
  role: z.enum(['customer', 'tasker'], {
    required_error: 'Please select a role',
  }),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
      'Invalid phone number format'
    ),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  new_password_confirm: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: 'Passwords do not match',
  path: ['new_password_confirm'],
}).refine((data) => data.current_password !== data.new_password, {
  message: 'New password must be different from current password',
  path: ['new_password'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Email Update Schema
 */
export const emailUpdateSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
});

export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;

/**
 * Phone Update Schema
 */
export const phoneUpdateSchema = z.object({
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export type PhoneUpdateFormData = z.infer<typeof phoneUpdateSchema>;
