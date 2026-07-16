/**
 * Chat Service
 *
 * Handles all chat and messaging API calls
 */

import { apiClient } from '@/lib/api/client';
import {
  Conversation,
  Message,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

function extractList<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

function matchesParticipant(conv: Conversation, otherParticipantId: string): boolean {
  const otherId = String(otherParticipantId);
  if (conv.other_participant && String(conv.other_participant.id) === otherId) {
    return true;
  }
  return conv.participants?.some((p) => String(p.id) === otherId) ?? false;
}

function findConversation(
  conversations: Conversation[],
  opts: { bidId?: string; taskId?: string; otherParticipantId?: string }
): Conversation | undefined {
  return conversations.find((c) => {
    if (opts.bidId && String(c.bid) !== String(opts.bidId)) {
      return false;
    }
    if (opts.taskId && String(c.task) !== String(opts.taskId)) {
      return false;
    }
    if (opts.otherParticipantId && !matchesParticipant(c, opts.otherParticipantId)) {
      return false;
    }
    return true;
  });
}

export const chatService = {
  /**
   * Get all conversations for current user
   */
  async getConversations(params?: {
    page?: number;
    page_size?: number;
    task?: string;
    bid?: string;
    archived?: boolean;
    /** employer = listing owner inbox; tasker = freelancer inbox */
    view?: 'employer' | 'tasker';
  }): Promise<ApiResponse<PaginatedResponse<Conversation>>> {
    return apiClient.get<PaginatedResponse<Conversation>>('/chat/conversations/', { params });
  },

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get<Conversation>(`/chat/conversations/${conversationId}/`);
  },

  /**
   * Create new conversation
   */
  async createConversation(data: {
    participant_ids?: string[];
    task?: string;
    bid?: string;
  }): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>('/chat/conversations/', data);
  },

  /**
   * Find existing conversation for a bid, or create one with the other party.
   */
  async findOrCreateConversationForBid(
    bidId: string,
    otherParticipantId: string
  ): Promise<ApiResponse<Conversation>> {
    const existing = await apiClient.get<PaginatedResponse<Conversation>>('/chat/conversations/', {
      params: { bid: bidId, page_size: 50 },
    });

    if (existing.success && existing.data) {
      const match = findConversation(extractList(existing.data), {
        bidId,
        otherParticipantId,
      });
      if (match) {
        return { success: true, data: match, message: 'OK' };
      }
    }

    const created = await this.createConversation({
      bid: bidId,
      participant_ids: [otherParticipantId],
    });

    if (created.success && created.data) {
      return created;
    }

    // Workflow may have created the thread without bid filter visibility — scan inbox
    const all = await this.getConversations({ page_size: 100 });
    if (all.success && all.data) {
      const match = findConversation(extractList(all.data), {
        bidId,
        otherParticipantId,
      });
      if (match) {
        return { success: true, data: match, message: 'OK' };
      }
    }

    return created;
  },

  /**
   * Find existing conversation for a task with another user, or create one.
   */
  async findOrCreateConversationForTask(
    taskId: string,
    otherParticipantId: string
  ): Promise<ApiResponse<Conversation>> {
    const existing = await apiClient.get<PaginatedResponse<Conversation>>('/chat/conversations/', {
      params: { task: taskId, page_size: 50 },
    });

    if (existing.success && existing.data) {
      const match = findConversation(extractList(existing.data), {
        taskId,
        otherParticipantId,
      });
      if (match) {
        return { success: true, data: match, message: 'OK' };
      }
    }

    const created = await this.createConversation({
      task: taskId,
      participant_ids: [otherParticipantId],
    });

    if (created.success && created.data) {
      return created;
    }

    const all = await this.getConversations({ page_size: 100 });
    if (all.success && all.data) {
      const match = findConversation(extractList(all.data), {
        taskId,
        otherParticipantId,
      });
      if (match) {
        return { success: true, data: match, message: 'OK' };
      }
    }

    return created;
  },

  /**
   * Find an existing direct conversation with a user, or create one.
   */
  async findOrCreateDirectConversation(
    otherParticipantId: string,
  ): Promise<ApiResponse<Conversation>> {
    const existing = await apiClient.get<PaginatedResponse<Conversation>>('/chat/conversations/', {
      params: { page_size: 100 },
    });

    if (existing.success && existing.data) {
      const match = findConversation(extractList(existing.data), {
        otherParticipantId,
      });
      if (match && !match.task && !match.bid) {
        return { success: true, data: match, message: 'OK' };
      }
      const anyMatch = findConversation(extractList(existing.data), {
        otherParticipantId,
      });
      if (anyMatch) {
        return { success: true, data: anyMatch, message: 'OK' };
      }
    }

    return this.createConversation({
      participant_ids: [otherParticipantId],
    });
  },

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(`/chat/conversations/${conversationId}/archive/`);
  },

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(`/chat/conversations/${conversationId}/unarchive/`);
  },

  /**
   * Get messages in a conversation (nested route on conversation)
   */
  async getMessages(
    conversationId: string,
    params?: { page?: number; page_size?: number }
  ): Promise<ApiResponse<PaginatedResponse<Message> | Message[]>> {
    return apiClient.get<PaginatedResponse<Message> | Message[]>(
      `/chat/conversations/${conversationId}/messages/`,
      { params: { page_size: 100, ...params } }
    );
  },

  /**
   * Send message in a conversation
   */
  async sendMessage(
    conversationId: string,
    data: {
      content: string;
      message_type?: 'text' | 'image' | 'file';
      attachment?: File;
    }
  ): Promise<ApiResponse<Message>> {
    if (data.attachment) {
      try {
        const { getCloudinaryFolder } = await import('@/lib/cloudinaryFolders');
        const { tryUploadFileToCloudinary } = await import('@/services/cloudinary.service');
        const folder = await getCloudinaryFolder('chat');
        const cloudinary = await tryUploadFileToCloudinary(data.attachment, { folder });
        if (cloudinary?.url) {
          return apiClient.post<Message>(`/chat/conversations/${conversationId}/messages/`, {
            content: data.content,
            message_type: data.message_type || (data.attachment.type.startsWith('image/') ? 'image' : 'file'),
            attachment_url: cloudinary.url,
            attachment_name: data.attachment.name,
            attachment_size: data.attachment.size,
          });
        }
      } catch {
        // Fall back to multipart upload (backend may still push to Cloudinary).
      }

      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('message_type', data.message_type || 'text');
      formData.append('attachment', data.attachment);

      return apiClient.upload<Message>(
        `/chat/conversations/${conversationId}/messages/`,
        formData
      );
    }

    return apiClient.post<Message>(`/chat/conversations/${conversationId}/messages/`, {
      content: data.content,
      message_type: data.message_type || 'text',
    });
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markAllAsRead(conversationId: string): Promise<ApiResponse<{ status: string }>> {
    return apiClient.post<{ status: string }>(
      `/chat/conversations/${conversationId}/mark_as_read/`
    );
  },

  /**
   * Get total unread message count (optional employer/tasker inbox view)
   */
  async getUnreadCount(params?: {
    view?: 'employer' | 'tasker';
  }): Promise<ApiResponse<{ unread_count: number }>> {
    return apiClient.get<{ unread_count: number }>('/chat/conversations/unread_count/', {
      params,
    });
  },

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/chat/messages/${messageId}/`);
  },

  /**
   * Search messages
   */
  async searchMessages(
    query: string,
    params?: {
      conversation?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return apiClient.get<PaginatedResponse<Message>>('/chat/messages/', {
      params: { search: query, ...params },
    });
  },
};

export default chatService;
