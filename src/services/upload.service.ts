/**
 * Upload Service — prefers Cloudinary for all file types when configured.
 * Falls back to /api/v1/uploads/uploads/ (local media) if Cloudinary is unavailable.
 */

import { apiClient } from '@/lib/api/client';
import { getCloudinaryFolder } from '@/lib/cloudinaryFolders';
import { getMediaUrl } from '@/lib/utils';
import { tryUploadFileToCloudinary } from '@/services/cloudinary.service';
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

function inferUploadFileType(file: File, override?: UploadFileType): UploadFileType {
  if (override) return override;
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
}

function cloudinaryAsUploadRecord(
  file: File,
  url: string,
  publicId: string | undefined,
  fileType: UploadFileType,
): UploadRecord {
  return {
    id: publicId || url,
    file: url,
    file_name: file.name,
    file_type: fileType,
    file_size: file.size,
    mime_type: file.type || 'application/octet-stream',
    status: 'completed',
    is_public: true,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

class UploadService {
  private readonly BASE = '/uploads/uploads';

  async upload(
    file: File,
    options?: { file_type?: UploadFileType; is_public?: boolean; folder?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadRecord>> {
    const fileType = inferUploadFileType(file, options?.file_type);
    const folder =
      options?.folder ??
      (await getCloudinaryFolder('uploads').catch(() => undefined));

    const cloudinaryResult = await tryUploadFileToCloudinary(file, {
      folder,
      onProgress,
    });

    if (cloudinaryResult?.url) {
      return {
        success: true,
        message: 'Upload successful',
        data: cloudinaryAsUploadRecord(
          file,
          cloudinaryResult.url,
          cloudinaryResult.public_id,
          fileType,
        ),
        errors: null,
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    if (options?.is_public != null) formData.append('is_public', String(options.is_public));

    const response = await apiClient.upload<UploadRecord>(`${this.BASE}/`, formData, onProgress);
    if (response.success && response.data?.file) {
      return {
        ...response,
        data: {
          ...response.data,
          file: getMediaUrl(response.data.file),
        },
      };
    }
    return response;
  }

  async list(): Promise<ApiResponse<UploadRecord[]>> {
    const res = await apiClient.get<UploadRecord[] | { results: UploadRecord[] }>(`${this.BASE}/`);
    if (!res.success || !res.data) return res as ApiResponse<UploadRecord[]>;
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw.results ?? [];
    return {
      ...res,
      data: list.map((item) => ({ ...item, file: getMediaUrl(item.file) })),
    };
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}/`);
  }

  /** Public URL from upload record */
  fileUrl(upload: UploadRecord): string {
    return getMediaUrl(upload.file);
  }
}

export const uploadService = new UploadService();
export default uploadService;
