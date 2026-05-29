/**
 * Review Validation Schemas
 * 
 * Zod schemas for review and rating forms
 */

import { z } from 'zod';

/**
 * Review Schema
 */
export const reviewSchema = z.object({
  task: z
    .string()
    .min(1, 'Task ID is required')
    .uuid('Invalid task ID'),
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a number',
    })
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must not exceed 5 stars')
    .int('Rating must be a whole number'),
  comment: z
    .string()
    .min(20, 'Comment must be at least 20 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .optional(),
  
  // Detailed ratings
  communication_rating: z
    .number()
    .min(1, 'Communication rating must be at least 1 star')
    .max(5, 'Communication rating must not exceed 5 stars')
    .int('Communication rating must be a whole number')
    .optional(),
  quality_rating: z
    .number()
    .min(1, 'Quality rating must be at least 1 star')
    .max(5, 'Quality rating must not exceed 5 stars')
    .int('Quality rating must be a whole number')
    .optional(),
  professionalism_rating: z
    .number()
    .min(1, 'Professionalism rating must be at least 1 star')
    .max(5, 'Professionalism rating must not exceed 5 stars')
    .int('Professionalism rating must be a whole number')
    .optional(),
  timeliness_rating: z
    .number()
    .min(1, 'Timeliness rating must be at least 1 star')
    .max(5, 'Timeliness rating must not exceed 5 stars')
    .int('Timeliness rating must be a whole number')
    .optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Review Update Schema
 */
export const reviewUpdateSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must not exceed 5 stars')
    .int('Rating must be a whole number')
    .optional(),
  comment: z
    .string()
    .min(20, 'Comment must be at least 20 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .optional(),
  communication_rating: z
    .number()
    .min(1, 'Communication rating must be at least 1 star')
    .max(5, 'Communication rating must not exceed 5 stars')
    .int('Communication rating must be a whole number')
    .optional(),
  quality_rating: z
    .number()
    .min(1, 'Quality rating must be at least 1 star')
    .max(5, 'Quality rating must not exceed 5 stars')
    .int('Quality rating must be a whole number')
    .optional(),
  professionalism_rating: z
    .number()
    .min(1, 'Professionalism rating must be at least 1 star')
    .max(5, 'Professionalism rating must not exceed 5 stars')
    .int('Professionalism rating must be a whole number')
    .optional(),
  timeliness_rating: z
    .number()
    .min(1, 'Timeliness rating must be at least 1 star')
    .max(5, 'Timeliness rating must not exceed 5 stars')
    .int('Timeliness rating must be a whole number')
    .optional(),
});

export type ReviewUpdateFormData = z.infer<typeof reviewUpdateSchema>;

/**
 * Review Response Schema
 */
export const reviewResponseSchema = z.object({
  response: z
    .string()
    .min(1, 'Response is required')
    .min(20, 'Response must be at least 20 characters')
    .max(500, 'Response must not exceed 500 characters'),
});

export type ReviewResponseFormData = z.infer<typeof reviewResponseSchema>;

/**
 * Review Filter Schema
 */
export const reviewFilterSchema = z.object({
  task: z.string().uuid().optional(),
  reviewer: z.string().uuid().optional(),
  reviewee: z.string().uuid().optional(),
  min_rating: z.number().min(1).max(5).optional(),
  max_rating: z.number().min(1).max(5).optional(),
  is_verified: z.boolean().optional(),
  sort_by: z.enum(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful']).optional(),
  page: z.number().positive().default(1).optional(),
  page_size: z.number().positive().max(100).default(20).optional(),
});

export type ReviewFilterFormData = z.infer<typeof reviewFilterSchema>;
