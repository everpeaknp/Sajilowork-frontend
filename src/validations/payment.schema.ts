/**
 * Payment Validation Schemas
 * 
 * Zod schemas for payment-related forms
 */

import { z } from 'zod';

/**
 * Payment Method Schema
 */
export const paymentMethodSchema = z.object({
  method_type: z.enum(['card', 'bank_transfer', 'wallet', 'paypal', 'stripe'], {
    required_error: 'Payment method type is required',
  }),
  is_default: z.boolean().default(false).optional(),
  
  // Card specific fields
  card_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{13,19}$/.test(val.replace(/\s/g, '')),
      'Invalid card number'
    ),
  card_holder_name: z
    .string()
    .max(100, 'Card holder name must not exceed 100 characters')
    .optional(),
  expiry_month: z
    .number()
    .min(1, 'Invalid month')
    .max(12, 'Invalid month')
    .optional(),
  expiry_year: z
    .number()
    .min(new Date().getFullYear(), 'Card has expired')
    .max(new Date().getFullYear() + 20, 'Invalid expiry year')
    .optional(),
  cvv: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{3,4}$/.test(val),
      'CVV must be 3 or 4 digits'
    ),
  
  // Bank transfer specific fields
  account_number: z
    .string()
    .max(50, 'Account number must not exceed 50 characters')
    .optional(),
  routing_number: z
    .string()
    .max(50, 'Routing number must not exceed 50 characters')
    .optional(),
  account_holder_name: z
    .string()
    .max(100, 'Account holder name must not exceed 100 characters')
    .optional(),
  bank_name: z
    .string()
    .max(100, 'Bank name must not exceed 100 characters')
    .optional(),
  
  // PayPal specific fields
  paypal_email: z
    .string()
    .email('Invalid PayPal email')
    .optional(),
}).refine(
  (data) => {
    // If method is card, card fields are required
    if (data.method_type === 'card') {
      return !!(
        data.card_number &&
        data.card_holder_name &&
        data.expiry_month &&
        data.expiry_year &&
        data.cvv
      );
    }
    return true;
  },
  {
    message: 'All card details are required for card payment method',
    path: ['card_number'],
  }
).refine(
  (data) => {
    // If method is bank_transfer, bank fields are required
    if (data.method_type === 'bank_transfer') {
      return !!(
        data.account_number &&
        data.routing_number &&
        data.account_holder_name &&
        data.bank_name
      );
    }
    return true;
  },
  {
    message: 'All bank details are required for bank transfer',
    path: ['account_number'],
  }
).refine(
  (data) => {
    // If method is paypal, paypal email is required
    if (data.method_type === 'paypal') {
      return !!data.paypal_email;
    }
    return true;
  },
  {
    message: 'PayPal email is required for PayPal payment method',
    path: ['paypal_email'],
  }
);

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

/**
 * Payment Creation Schema
 */
export const paymentSchema = z.object({
  task: z
    .string()
    .min(1, 'Task ID is required')
    .uuid('Invalid task ID'),
  payment_method: z.enum(['card', 'bank_transfer', 'wallet', 'paypal', 'stripe'], {
    required_error: 'Payment method is required',
  }),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .min(1, 'Minimum payment is Rs. 1')
    .max(100000, 'Maximum payment is Rs. 100,000'),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .default('NPR')
    .optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * Refund Request Schema
 */
export const refundSchema = z.object({
  payment_id: z
    .string()
    .min(1, 'Payment ID is required')
    .uuid('Invalid payment ID'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .min(20, 'Reason must be at least 20 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .optional(), // If not provided, full refund
});

export type RefundFormData = z.infer<typeof refundSchema>;

/**
 * Wallet Transaction Schema
 */
export const walletTransactionSchema = z.object({
  transaction_type: z.enum(['credit', 'debit'], {
    required_error: 'Transaction type is required',
  }),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .min(1, 'Minimum amount is Rs. 1')
    .max(100000, 'Maximum amount is Rs. 100,000'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export type WalletTransactionFormData = z.infer<typeof walletTransactionSchema>;

/**
 * Withdrawal Request Schema
 */
export const withdrawalSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .min(10, 'Minimum withdrawal is Rs. 10')
    .max(100000, 'Maximum withdrawal is Rs. 100,000'),
  payment_method_id: z
    .string()
    .min(1, 'Payment method is required')
    .uuid('Invalid payment method ID'),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;
