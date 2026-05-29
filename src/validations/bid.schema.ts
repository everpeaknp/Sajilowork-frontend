/**
 * Bid/Offer Validation Schemas
 * Zod schemas for bid form validation
 */

import { z } from 'zod';

// ============================================================================
// BID CREATION SCHEMA
// ============================================================================

export const bidSchema = z.object({
  // Required fields
  task: z.string().uuid('Invalid task ID'),
  
  amount: z
    .number({
      required_error: 'Offer amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .min(5, 'Minimum offer amount is Rs. 5')
    .max(100000, 'Maximum offer amount is Rs. 100,000'),
  
  proposal: z
    .string({
      required_error: 'Proposal is required',
    })
    .min(50, 'Proposal must be at least 50 characters')
    .max(5000, 'Proposal cannot exceed 5000 characters')
    .trim(),
  
  // Optional fields
  cover_letter: z
    .string()
    .max(2000, 'Cover letter cannot exceed 2000 characters')
    .optional(),
  
  estimated_duration: z
    .number()
    .int('Duration must be a whole number')
    .positive('Duration must be positive')
    .max(720, 'Duration cannot exceed 720 hours (30 days)')
    .optional(),
  
  estimated_completion_date: z
    .string()
    .optional()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      'Completion date must be in the future'
    ),
  
  attachments: z
    .array(
      z.object({
        file_url: z.string().url('Invalid file URL'),
        file_name: z.string().min(1, 'File name is required'),
        file_size: z.number().max(10485760, 'File size cannot exceed 10MB'),
        file_type: z.string(),
      })
    )
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
  
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
});

export type BidFormData = z.infer<typeof bidSchema>;

// ============================================================================
// BID UPDATE SCHEMA (Partial)
// ============================================================================

export const bidUpdateSchema = bidSchema.partial().omit({
  task: true,
  terms_accepted: true,
});

export type BidUpdateData = z.infer<typeof bidUpdateSchema>;

// ============================================================================
// COUNTER OFFER SCHEMA
// ============================================================================

export const counterOfferSchema = z.object({
  amount: z
    .number({
      required_error: 'Counter offer amount is required',
    })
    .positive('Amount must be greater than 0')
    .min(5, 'Minimum amount is Rs. 5')
    .max(100000, 'Maximum amount is Rs. 100,000'),
  
  proposal: z
    .string({
      required_error: 'Proposal is required for counter offer',
    })
    .min(50, 'Proposal must be at least 50 characters')
    .max(5000, 'Proposal cannot exceed 5000 characters'),
  
  estimated_duration: z
    .number()
    .int()
    .positive()
    .max(720)
    .optional(),
  
  estimated_completion_date: z
    .string()
    .datetime()
    .refine(
      (date) => new Date(date) > new Date(),
      'Completion date must be in the future'
    )
    .optional(),
  
  counter_offer_reason: z
    .string()
    .min(20, 'Please explain why you are making a counter offer (min 20 characters)')
    .max(1000, 'Reason cannot exceed 1000 characters')
    .optional(),
});

export type CounterOfferData = z.infer<typeof counterOfferSchema>;

// ============================================================================
// BID REJECTION SCHEMA
// ============================================================================

export const bidRejectionSchema = z.object({
  rejection_reason: z
    .string()
    .min(10, 'Please provide a reason for rejection (min 10 characters)')
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
});

export type BidRejectionData = z.infer<typeof bidRejectionSchema>;

// ============================================================================
// BID WITHDRAWAL SCHEMA
// ============================================================================

export const bidWithdrawalSchema = z.object({
  withdrawal_reason: z
    .string()
    .min(10, 'Please provide a reason for withdrawal (min 10 characters)')
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
});

export type BidWithdrawalData = z.infer<typeof bidWithdrawalSchema>;

// ============================================================================
// BID MESSAGE SCHEMA
// ============================================================================

export const bidMessageSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required',
    })
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
  
  attachments: z
    .array(
      z.object({
        file_url: z.string().url(),
        file_name: z.string(),
        file_size: z.number().max(10485760),
        file_type: z.string(),
      })
    )
    .max(3, 'Maximum 3 attachments per message')
    .optional(),
});

export type BidMessageData = z.infer<typeof bidMessageSchema>;

// ============================================================================
// BID REVIEW SCHEMA
// ============================================================================

export const bidReviewSchema = z.object({
  rating: z
    .number({
      required_error: 'Rating is required',
    })
    .int('Rating must be a whole number')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  
  comment: z
    .string({
      required_error: 'Review comment is required',
    })
    .min(20, 'Review must be at least 20 characters')
    .max(1000, 'Review cannot exceed 1000 characters')
    .trim(),
  
  // Optional detailed ratings
  communication_rating: z.number().int().min(1).max(5).optional(),
  quality_rating: z.number().int().min(1).max(5).optional(),
  professionalism_rating: z.number().int().min(1).max(5).optional(),
  timeliness_rating: z.number().int().min(1).max(5).optional(),
});

export type BidReviewData = z.infer<typeof bidReviewSchema>;

// ============================================================================
// BID FILTER SCHEMA
// ============================================================================

export const bidFilterSchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'rejected', 'withdrawn', 'expired'])
    .optional(),
  
  task: z.string().uuid().optional(),
  
  tasker: z.string().uuid().optional(),
  
  min_amount: z.number().positive().optional(),
  
  max_amount: z.number().positive().optional(),
  
  is_counter_offer: z.boolean().optional(),
  
  sort_by: z
    .enum(['amount', '-amount', 'created_at', '-created_at', 'rating', '-rating'])
    .optional(),
  
  page: z.number().int().positive().optional(),
  
  page_size: z.number().int().positive().max(100).optional(),
});

export type BidFilterData = z.infer<typeof bidFilterSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate bid amount against task budget
 */
export const validateBidAmount = (
  bidAmount: number,
  taskBudget: number,
  taskBudgetType: 'fixed' | 'hourly'
): { valid: boolean; message?: string } => {
  if (taskBudgetType === 'fixed') {
    if (bidAmount > taskBudget * 1.5) {
      return {
        valid: false,
        message: `Bid amount cannot exceed 150% of task budget ($${taskBudget * 1.5})`,
      };
    }
  }
  
  return { valid: true };
};

/**
 * Validate estimated completion date
 */
export const validateCompletionDate = (
  completionDate: string,
  taskDeadline?: string
): { valid: boolean; message?: string } => {
  const completion = new Date(completionDate);
  const now = new Date();
  
  if (completion <= now) {
    return {
      valid: false,
      message: 'Completion date must be in the future',
    };
  }
  
  if (taskDeadline) {
    const deadline = new Date(taskDeadline);
    if (completion > deadline) {
      return {
        valid: false,
        message: 'Completion date cannot be after task deadline',
      };
    }
  }
  
  return { valid: true };
};

/**
 * Calculate estimated completion date from duration
 */
export const calculateCompletionDate = (durationHours: number): string => {
  const now = new Date();
  const completionDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
  return completionDate.toISOString();
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File
): { valid: boolean; message?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File size cannot exceed 10MB',
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'File type not allowed. Allowed: images, PDF, Word, Excel',
    };
  }
  
  return { valid: true };
};
