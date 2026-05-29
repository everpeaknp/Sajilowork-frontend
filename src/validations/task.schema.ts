/**
 * Task Validation Schemas
 * 
 * Zod schemas for task-related forms
 */

import { z } from 'zod';

/**
 * Base Task Schema Object (without refinements)
 */
const taskSchemaBase = z.object({
  // Title & Description
  title: z
    .string()
    .min(1, 'Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  
  // Category
  category: z
    .string()
    .min(1, 'Category is required')
    .uuid('Invalid category ID'),
  
  // Budget
  budget_type: z.enum(['fixed', 'hourly'], {
    required_error: 'Budget type is required',
  }),
  budget_amount: z
    .number({
      required_error: 'Budget amount is required',
      invalid_type_error: 'Budget amount must be a number',
    })
    .positive('Budget amount must be positive')
    .min(10, 'Minimum budget is Rs. 10')
    .max(100000, 'Maximum budget is Rs. 100,000'),
  budget_currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .default('NPR')
    .optional(),
  
  // Location
  location_type: z.enum(['remote', 'in_person', 'flexible'], {
    required_error: 'Location type is required',
  }),
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
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  
  // Scheduling
  task_type: z.enum(['one_time', 'recurring'], {
    required_error: 'Task type is required',
  }),
  due_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Due date must be in the future'
    ),
  flexible_date: z.boolean().default(false).optional(),
  estimated_duration: z
    .number()
    .positive('Duration must be positive')
    .max(1000, 'Duration must not exceed 1000 hours')
    .optional(),
  
  // Additional Options
  is_urgent: z.boolean().default(false).optional(),
  requires_verification: z.boolean().default(false).optional(),
});

/**
 * Task Creation Schema (with refinements)
 */
export const taskSchema = taskSchemaBase.refine(
  (data) => {
    // If location type is in_person, address is required
    if (data.location_type === 'in_person') {
      return !!data.address && !!data.city;
    }
    return true;
  },
  {
    message: 'Address and city are required for in-person tasks',
    path: ['address'],
  }
);

export type TaskFormData = z.infer<typeof taskSchema>;

/**
 * Task Update Schema (partial - without refinements for flexibility)
 */
export const taskUpdateSchema = taskSchemaBase.partial();

export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;

/**
 * Task Filter Schema
 */
export const taskFilterSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().uuid().optional(),
  location: z.string().max(200).optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  task_type: z.enum(['one_time', 'recurring']).optional(),
  location_type: z.enum(['remote', 'in_person', 'flexible']).optional(),
  status: z.enum(['draft', 'open', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  sort_by: z.enum(['newest', 'budget_high', 'budget_low', 'closest']).optional(),
  page: z.number().positive().default(1).optional(),
  page_size: z.number().positive().max(100).default(20).optional(),
});

export type TaskFilterFormData = z.infer<typeof taskFilterSchema>;

/**
 * Task Question Schema
 */
export const taskQuestionSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .min(10, 'Question must be at least 10 characters')
    .max(1000, 'Question must not exceed 1000 characters'),
});

export type TaskQuestionFormData = z.infer<typeof taskQuestionSchema>;

/**
 * Task Answer Schema
 */
export const taskAnswerSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .min(10, 'Answer must be at least 10 characters')
    .max(2000, 'Answer must not exceed 2000 characters'),
});

export type TaskAnswerFormData = z.infer<typeof taskAnswerSchema>;
