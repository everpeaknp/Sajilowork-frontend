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

type BidListParams = {
  status?: string;
  page?: number;
  page_size?: number;
};

async function fetchAllBidPages(
  path: string,
  params?: BidListParams,
): Promise<ApiResponse<PaginatedResponse<Bid>>> {
  const pageSize = params?.page_size ?? 100;
  const first = await apiClient.get<PaginatedResponse<Bid>>(path, {
    params: {
      ...(params?.status ? { status: params.status } : {}),
      page: 1,
      page_size: pageSize,
    },
  });

  if (!first.success || !first.data) {
    return first;
  }

  if (Array.isArray(first.data)) {
    return first;
  }

  const all = extractBidList(first.data);
  const total = Number(first.data.count ?? all.length);
  let page = 2;

  while (all.length < total && page <= 50) {
    const next = await apiClient.get<PaginatedResponse<Bid>>(path, {
      params: {
        ...(params?.status ? { status: params.status } : {}),
        page,
        page_size: pageSize,
      },
    });
    if (!next.success || !next.data) break;
    const chunk = extractBidList(next.data);
    if (chunk.length === 0) break;
    all.push(...chunk);
    page += 1;
  }

  return {
    success: true,
    message: first.message || 'OK',
    data: {
      count: all.length,
      next: null,
      previous: null,
      results: all,
    },
  };
}

export function getBidTaskId(bid: Pick<Bid, 'task'>): string {
  const task = bid.task as string | { id?: string };
  if (task && typeof task === 'object' && 'id' in task && task.id) {
    return String(task.id);
  }
  return String(task);
}

/** Return the current user's bid on a task, if any. */
export async function getMyBidForTask(taskId: string): Promise<Bid | null> {
  const response = await bidService.getMyBids();
  if (!response.success || !response.data) return null;
  const normalizedTaskId = String(taskId);
  return (
    extractBidList(response.data).find((bid) => getBidTaskId(bid) === normalizedTaskId) ?? null
  );
}

/** Short alphanumeric bid reference for display (first UUID segment). */
export function formatBidDisplayId(id: string | null | undefined): string {
  const normalized = String(id ?? '').trim();
  if (!normalized) return '—';
  const segment = normalized.split('-')[0];
  if (segment && segment.length >= 4) {
    return segment.toUpperCase();
  }
  return normalized.replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** Sort bids (or bid rows) by display id using alphanumeric order. */
export function sortBidsByIdAlphanumeric<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    formatBidDisplayId(a.id).localeCompare(formatBidDisplayId(b.id), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );
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
  async getMyBids(
    status?: string,
    options?: { page_size?: number; fetchAll?: boolean },
  ): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    if (options?.fetchAll) {
      return fetchAllBidPages('/bids/bids/my_bids/', {
        status,
        page_size: options.page_size ?? 100,
      });
    }
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/my_bids/', {
      params: {
        ...(status ? { status } : {}),
        ...(options?.page_size ? { page_size: options.page_size } : {}),
      },
    });
  },

  /**
   * Get bids received on user's tasks
   */
  async getReceivedBids(
    status?: string,
    options?: { page_size?: number; fetchAll?: boolean },
  ): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    if (options?.fetchAll) {
      return fetchAllBidPages('/bids/bids/received_bids/', {
        status,
        page_size: options.page_size ?? 100,
      });
    }
    return apiClient.get<PaginatedResponse<Bid>>('/bids/bids/received_bids/', {
      params: {
        ...(status ? { status } : {}),
        ...(options?.page_size ? { page_size: options.page_size } : {}),
      },
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
   * Upload bid / job-application attachment (Cloudinary when configured).
   */
  async uploadBidAttachment(file: File): Promise<ApiResponse<{ url: string }>> {
    const { getCloudinaryFolder } = await import('@/lib/cloudinaryFolders');
    const { tryUploadFileToCloudinary } = await import('@/services/cloudinary.service');
    const { uploadService } = await import('./upload.service');
    const { getMediaUrl } = await import('@/lib/utils');

    const folder = await getCloudinaryFolder('uploads', 'bids');
    const cloudinary = await tryUploadFileToCloudinary(file, { folder });
    if (cloudinary?.url) {
      return {
        success: true,
        message: 'Upload successful',
        data: { url: cloudinary.url },
        errors: null,
      };
    }

    const response = await uploadService.upload(file, {
      file_type: inferUploadFileType(file.type) as 'image' | 'document' | 'video' | 'audio' | 'other',
      folder,
    });
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
