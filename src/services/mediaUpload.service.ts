/**
 * Unified media upload — images go to Cloudinary (backend env), other files use /uploads/.
 */

import { getMediaUrl } from '@/lib/utils';
import { cloudinaryService, isImageFile } from '@/services/cloudinary.service';
import { uploadService, type UploadFileType, type UploadRecord } from '@/services/upload.service';
import type { ApiResponse } from '@/types';

export type MediaUploadOptions = {
  file_type?: UploadFileType;
  folder?: string;
  is_public?: boolean;
  onProgress?: (progress: number) => void;
};

export type MediaUploadResult = {
  url: string;
  storage: 'cloudinary' | 'backend';
  upload?: UploadRecord;
  public_id?: string;
};

function inferFileType(file: File): UploadFileType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Upload a file. Images prefer Cloudinary when backend CLOUDINARY_* env is configured.
 */
export async function uploadMediaFile(
  file: File,
  options?: MediaUploadOptions,
): Promise<MediaUploadResult> {
  if (isImageFile(file)) {
    const cloudinaryResult = await cloudinaryService.tryUploadImage(file, {
      folder: options?.folder,
      onProgress: options?.onProgress,
    });

    if (cloudinaryResult?.url) {
      return {
        url: cloudinaryResult.url,
        storage: 'cloudinary',
        public_id: cloudinaryResult.public_id,
      };
    }
  }

  const response = await uploadService.upload(
    file,
    {
      file_type: options?.file_type ?? inferFileType(file),
      is_public: options?.is_public,
    },
    options?.onProgress,
  );

  if (!response.success || !response.data?.file) {
    throw new Error(response.message || 'Upload failed');
  }

  return {
    url: getMediaUrl(response.data.file),
    storage: 'backend',
    upload: response.data,
  };
}

export async function uploadMediaFileResponse(
  file: File,
  options?: MediaUploadOptions,
): Promise<ApiResponse<MediaUploadResult>> {
  const data = await uploadMediaFile(file, options);
  return { success: true, message: 'Upload successful', data, errors: null };
}

export const mediaUploadService = {
  upload: uploadMediaFile,
  uploadResponse: uploadMediaFileResponse,
  isImageFile,
};

export default mediaUploadService;
