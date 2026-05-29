/**
 * Profile Validation Schemas
 * 
 * Zod schemas for user profile forms
 */

import { z } from 'zod';

/**
 * Profile Update Schema
 */
export const profileSchema = z.object({
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
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
      'Invalid phone number format'
    ),
  bio: z
    .string()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional(),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return age >= 18 && age <= 120;
      },
      'You must be at least 18 years old'
    ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  
  // Location
  address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  city: z
    .string()
    .max(100, 'City must not exceed 100 characters')
    .optional(),
  state: z
    .string()
    .max(100, 'State must not exceed 100 characters')
    .optional(),
  country: z
    .string()
    .max(100, 'Country must not exceed 100 characters')
    .optional(),
  postal_code: z
    .string()
    .max(20, 'Postal code must not exceed 20 characters')
    .optional(),
  
  // Tasker specific
  hourly_rate: z
    .number()
    .positive('Hourly rate must be positive')
    .min(10, 'Minimum hourly rate is Rs. 10')
    .max(1000, 'Maximum hourly rate is Rs. 1,000')
    .optional(),
  service_radius: z
    .number()
    .positive('Service radius must be positive')
    .max(500, 'Maximum service radius is 500 km')
    .optional(),
  availability_status: z.enum(['available', 'busy', 'offline']).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Profile Image Upload Schema
 */
export const profileImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPG, PNG, and WebP images are allowed'
    ),
});

export type ProfileImageFormData = z.infer<typeof profileImageSchema>;

/**
 * Skill Schema
 */
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .min(2, 'Skill name must be at least 2 characters')
    .max(100, 'Skill name must not exceed 100 characters'),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    required_error: 'Proficiency level is required',
  }),
  years_of_experience: z
    .number()
    .nonnegative('Years of experience cannot be negative')
    .max(50, 'Years of experience must not exceed 50')
    .optional(),
});

export type SkillFormData = z.infer<typeof skillSchema>;

/**
 * Badge Schema
 */
export const badgeSchema = z.object({
  badge_type: z.enum([
    'police_check',
    'payment_verified',
    'mobile_verified',
    'electrical_licence',
    'plumbing_licence',
    'identity_verified',
  ], {
    required_error: 'Badge type is required',
  }),
  verification_document: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Document must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'Only JPG, PNG, and PDF files are allowed'
    )
    .optional(),
});

export type BadgeFormData = z.infer<typeof badgeSchema>;

/**
 * Portfolio Item Schema
 */
export const portfolioSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
      ].includes(file.type),
      'Only JPG, PNG, PDF, and TXT files are allowed'
    ),
  is_featured: z.boolean().default(false).optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

/**
 * Availability Update Schema
 */
export const availabilitySchema = z.object({
  availability_status: z.enum(['available', 'busy', 'offline'], {
    required_error: 'Availability status is required',
  }),
});

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
