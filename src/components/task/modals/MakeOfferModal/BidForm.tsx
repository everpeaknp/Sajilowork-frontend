"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Calendar, FileText, Paperclip, Send, X } from 'lucide-react';
import { bidSchema, type BidFormData } from '@/validations/bid.schema';
import { bidService, extractBidList } from '@/services/bid.service';
import { tokenManager } from '@/lib/api/client';

import { Task } from '@/types';
import { formatNPR } from '@/lib/nepalLocale';
import { canSubmitOfferOnTask } from '@/lib/taskUtils';
import { useAuthStore } from '@/store/auth.store';

interface BidFormProps {
  task: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BidForm({ task, onSuccess, onCancel }: BidFormProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isCheckingExistingBid, setIsCheckingExistingBid] = useState(true);

  // Check if user is authenticated and if they already have a bid
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        toast.error('Please sign in to submit an offer');
        onCancel();
        return;
      }

      try {
        const response = await bidService.getMyBids('pending');
        if (response.success && response.data) {
          const pendingBids = extractBidList(response.data);
          const existingBid = pendingBids.find((bid) => String(bid.task) === String(task.id));

          if (existingBid) {
            toast.error(
              'You already have a pending offer on this task. Withdraw it first if you want to submit a new one.'
            );
            onCancel();
            return;
          }
        }
      } catch {
        // Backend will reject duplicate bids if this check fails
      } finally {
        setIsCheckingExistingBid(false);
      }
    };

    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      task: task.id,
      amount: task.budget_amount || 0,
      proposal: '',
      terms_accepted: false,
    },
  });

  const proposalLength = watch('proposal')?.length || 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name}: File size exceeds 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploadingAttachment(true);
    try {
      const uploadPromises = validFiles.map(file => bidService.uploadBidAttachment(file));
      const responses = await Promise.all(uploadPromises);
      
      const urls = responses.map(res => res.data.url);
      setUploadedUrls(prev => [...prev, ...urls]);
      setAttachments(prev => [...prev, ...validFiles]);
      
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload attachments');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BidFormData) => {
    setIsSubmitting(true);
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        toast.error('Please sign in to submit an offer');
        onCancel();
        return;
      }

      if (!canSubmitOfferOnTask(task, user?.id)) {
        toast.error('You cannot submit an offer on this task.');
        onCancel();
        return;
      }

      const response = await bidService.createBid({
        task: String(data.task),
        amount: Number(data.amount),
        proposal: data.proposal.trim(),
        currency: 'NPR',
        attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit offer');
      }

      toast.success('Offer submitted successfully!');
      onSuccess();
    } catch (error: any) {
      let errorMessage = 'Failed to submit offer. Please try again.';
      
      // Check for authentication errors first
      if (error?.status === 401 || error?.message?.toLowerCase().includes('authentication') || error?.message?.toLowerCase().includes('credentials')) {
        errorMessage = 'You must be logged in to submit an offer. Please sign in and try again.';
        toast.error(errorMessage);
        // Optionally redirect to login
        // window.location.href = '/signin';
        return;
      }
      
      if (error?.message && typeof error.message === 'string' && error.message.trim() !== '') {
        errorMessage = error.message;
      } else if (error?.errors) {
        // Handle Django validation errors
        if (typeof error.errors === 'object') {
          // Check for non_field_errors first
          if (error.errors.non_field_errors && Array.isArray(error.errors.non_field_errors)) {
            errorMessage = error.errors.non_field_errors.join('; ');
          } else {
            // Check for specific field errors
            const fieldErrors = [];
            
            for (const [field, messages] of Object.entries(error.errors)) {
              if (Array.isArray(messages)) {
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                fieldErrors.push(`${fieldName}${messages.join(', ')}`);
              } else if (typeof messages === 'string') {
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                fieldErrors.push(`${fieldName}${messages}`);
              }
            }
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            }
          }
        } else if (typeof error.errors === 'string') {
          errorMessage = error.errors;
        }
      }
      
      // Check for specific error cases
      if (errorMessage.toLowerCase().includes('already have') && errorMessage.toLowerCase().includes('bid')) {
        errorMessage = 'You have already submitted an offer for this task. Please withdraw your existing offer first if you want to submit a new one.';
      } else if (errorMessage.toLowerCase().includes('not open')) {
        errorMessage = 'This task is no longer accepting offers.';
      } else if (errorMessage.toLowerCase().includes('cannot bid on your own')) {
        errorMessage = 'You cannot submit an offer on your own task.';
      } else if (error?.status === 401) {
        errorMessage = 'Please sign in to submit an offer.';
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else if (error?.status === 403) {
        errorMessage = 'You do not have permission to submit offers. Please verify your account.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {isCheckingExistingBid ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking your existing offers...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
          if (validationErrors.terms_accepted) {
            toast.error('Please accept the terms and conditions');
          } else if (validationErrors.proposal) {
            toast.error('Please provide a detailed proposal (minimum 50 characters)');
          } else if (validationErrors.amount) {
            toast.error('Please enter a valid offer amount');
          } else if (validationErrors.task) {
            toast.error('Invalid task selected');
          } else {
            toast.error('Please fix the form errors before submitting');
          }
        })} className="space-y-6">
        <div className="mb-2">
          <h2 className="text-4xl font-bold text-[#000d45] mb-3">Make an offer</h2>
          <p className="text-on-surface-variant text-base">
            Submit your price and proposal for this task.
          </p>
        </div>

        {/* Task Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-500">Rs.</span>
              Budget: {formatNPR(task.budget_amount)}
            </span>
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due: {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Offer Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Offer Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-sm font-semibold text-gray-500">Rs.</span>
            </div>
            <input
              type="number"
              min={1}
              step={1}
              {...register('amount', { valueAsNumber: true })}
              className={`block w-full pl-12 pr-14 py-3 border ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">NPR</span>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Task budget: {formatNPR(task.budget_amount)}
          </p>
        </div>

        {/* Proposal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('proposal')}
            rows={6}
            className={`block w-full px-4 py-3 border ${
              errors.proposal ? 'border-red-300' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
            placeholder="Describe how you'll complete this task, your relevant experience, and why you're the best fit..."
          />
          <div className="mt-1 flex justify-between items-center">
            {errors.proposal ? (
              <p className="text-sm text-red-600">{errors.proposal.message}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Minimum 50 characters required
              </p>
            )}
            <span className={`text-xs ${proposalLength < 50 ? 'text-red-500' : 'text-gray-500'}`}>
              {proposalLength} / 5000
            </span>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments <span className="text-gray-400">(Optional, max 5)</span>
          </label>
          
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {isUploadingAttachment ? 'Uploading...' : 'Choose files'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploadingAttachment || attachments.length >= 5}
              />
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX (max 10MB each)
          </p>
        </div>

        {/* Terms Acceptance */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('terms_accepted')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Terms & Conditions</p>
              <p>
                I understand that by submitting this offer, I agree to complete the task as described
                if accepted. I also agree to the platform's{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
          {errors.terms_accepted && (
            <p className="mt-2 text-sm text-red-600">{errors.terms_accepted.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingAttachment}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Offer
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </motion.div>
  );
}
