/**
 * Upload Service — /api/v1/uploads/uploads/
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export type UploadFileType = 'image' | 'document' | 'video' | 'audio' | 'other';

export interface UploadRecord {
  id: string;
  file: string;
  file_name: string;
  file_type: UploadFileType;
  file_size: number;
  mime_type: string;
  status: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

class UploadService {
  private readonly BASE = '/uploads/uploads';

  async upload(
    file: File,
    options?: { file_type?: UploadFileType; is_public?: boolean },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadRecord>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.file_type) formData.append('file_type', options.file_type);
    if (options?.is_public != null) formData.append('is_public', String(options.is_public));

    const inferredType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
          ? 'audio'
          : 'document';

    if (!options?.file_type) {
      formData.set('file_type', inferredType);
    }

    return apiClient.upload<UploadRecord>(`${this.BASE}/`, formData, onProgress);
  }

  async list(): Promise<ApiResponse<UploadRecord[]>> {
    const res = await apiClient.get<UploadRecord[] | { results: UploadRecord[] }>(`${this.BASE}/`);
    if (!res.success || !res.data) return res as ApiResponse<UploadRecord[]>;
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw.results ?? [];
    return { ...res, data: list };
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}/`);
  }

  /** Public URL from upload record */
  fileUrl(upload: UploadRecord): string {
    return upload.file;
  }
}

export const uploadService = new UploadService();
export default uploadService;
