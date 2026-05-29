/**
 * Bid Service
 *
 * Handles all bid/offer-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { getMediaUrl } from '@/lib/utils';
import {
  Bid,
  BidFormData,
  BidMessage,
  BidReview,
  BidStats,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export type CreateBidPayload = {
  task: string;
  amount: number;
  proposal: string;
  currency?: string;
  attachments?: string[];
};

/** Normalize DRF paginated or plain-array bid list responses */
export function extractBidList<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

function inferUploadFileType(mimeType: string): 'image' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet')
  ) {
    return 'document';
  }
  return 'other';
}

export const bidService = {
  /**
   * Get all bids with filters
   */
  async getBids(filters?: {
    status?: string;
    task?: string;
    tasker?: string;
    is_counter_offer?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/', { params: filters });
  },

  /**
   * Get bid by ID
   */
  async getBidById(bidId: string): Promise<ApiResponse<Bid>> {
    return apiClient.get<Bid>(`/bids/bids/${bidId}/`);
  },

  /**
   * Create new bid/offer
   */
  async createBid(data: CreateBidPayload): Promise<ApiResponse<Bid>> {
    const payload = {
      task: String(data.task),
      amount: Number(data.amount),
      proposal: data.proposal.trim(),
      currency: data.currency ?? 'NPR',
      ...(data.attachments?.length ? { attachments: data.attachments } : {}),
    };

    return apiClient.post<Bid>('/bids/bids/', payload);
  },

  /**
   * Update bid (only pending bids)
   */
  async updateBid(bidId: string, data: Partial<BidFormData>): Promise<ApiResponse<Bid>> {
    return apiClient.patch<Bid>(`/bids/bids/${bidId}/`, data);
  },

  /**
   * Delete bid (only pending bids)
   */
  async deleteBid(bidId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/bids/bids/${bidId}/`);
  },

  /**
   * Accept bid (task owner only)
   */
  async acceptBid(bidId: string): Promise<ApiResponse<Bid>> {
    return apiClient.post<Bid>(`/bids/bids/${bidId}/accept/`);
  },

  /**
   * Reject bid (task owner only)
   */
  async rejectBid(bidId: string, reason?: string): Promise<ApiResponse<Bid>> {
    return apiClient.post<Bid>(`/bids/bids/${bidId}/reject/`, { rejection_reason: reason });
  },

  /**
   * Withdraw bid (bid owner only)
   */
  async withdrawBid(bidId: string, reason?: string): Promise<ApiResponse<Bid>> {
    return apiClient.post<Bid>(`/bids/bids/${bidId}/withdraw/`, { withdrawal_reason: reason });
  },

  /**
   * Create counter offer (task owner only)
   */
  async createCounterOffer(
    bidId: string,
    data: {
      amount: number;
      proposal: string;
      estimated_duration?: number;
      estimated_completion_date?: string;
    }
  ): Promise<ApiResponse<Bid>> {
    return apiClient.post<Bid>(`/bids/bids/${bidId}/counter_offer/`, data);
  },

  /**
   * Get current user's bids
   */
  async getMyBids(status?: string): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/my_bids/', {
      params: status ? { status } : undefined,
    });
  },

  /**
   * Get bids received on user's tasks
   */
  async getReceivedBids(status?: string): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/received_bids/', {
      params: status ? { status } : undefined,
    });
  },

  /**
   * Get bid statistics
   */
  async getBidStats(): Promise<ApiResponse<BidStats>> {
    return apiClient.get<BidStats>('/bids/bids/stats/');
  },

  /**
   * Get bids for a specific task
   */
  async getTaskBids(taskId: string): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/', {
      params: { task: taskId, page_size: 100 },
    });
  },

  /**
   * Send message on bid (negotiation thread)
   */
  async sendBidMessage(bidId: string, message: string): Promise<ApiResponse<BidMessage>> {
    return apiClient.post<BidMessage>('/bids/bid-messages/', { bid: bidId, message });
  },

  /**
   * Get messages for a bid
   */
  async getBidMessages(bidId: string): Promise<ApiResponse<PaginatedResponse<BidMessage>>> {
    return apiClient.get<PaginatedResponse<BidMessage>>('/bids/bid-messages/', {
      params: { bid: bidId },
    });
  },

  /**
   * Mark a bid message as read
   */
  async markBidMessageRead(messageId: string): Promise<ApiResponse<BidMessage>> {
    return apiClient.post<BidMessage>(`/bids/bid-messages/${messageId}/mark_read/`);
  },

  /**
   * Submit bid review
   */
  async submitBidReview(
    bidId: string,
    data: { rating: number; comment: string }
  ): Promise<ApiResponse<BidReview>> {
    return apiClient.post<BidReview>(`/bids/bids/${bidId}/review/`, data);
  },

  /**
   * Upload bid attachment via the uploads API
   */
  async uploadBidAttachment(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', inferUploadFileType(file.type));

    const response = await apiClient.upload<{ file: string }>('/uploads/uploads/', formData);
    const filePath = response.data?.file;

    if (!filePath) {
      throw new Error('Upload succeeded but no file URL was returned');
    }

    return {
      ...response,
      data: { url: getMediaUrl(filePath) },
    };
  },
};
