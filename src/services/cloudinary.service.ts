/**
 * Cloudinary image uploads — credentials and secrets stay in backend .env.
 * @see https://cloudinary.com/
 */

import { apiClient } from '@/lib/api/client';
import { DEFAULT_CLOUDINARY_ROOT } from '@/lib/cloudinaryConstants';
import type { ApiResponse } from '@/types';

export type CloudinaryConfig = {
  enabled: boolean;
  browser_upload?: boolean;
  server_upload?: boolean;
  cloud_name: string;
  upload_preset: string;
  folder: string;
};

export type CloudinaryUploadResult = {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
};

let cachedConfig: CloudinaryConfig | null = null;
let configPromise: Promise<CloudinaryConfig> | null = null;

const DEFAULT_CONFIG: CloudinaryConfig = {
  enabled: false,
  browser_upload: false,
  server_upload: false,
  cloud_name: '',
  upload_preset: '',
  folder: DEFAULT_CLOUDINARY_ROOT,
};

export function isImageFile(file: File): boolean {
  if (file.type?.startsWith('image/')) return true;
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/.test(name);
}

export async function getCloudinaryConfig(force = false): Promise<CloudinaryConfig> {
  if (!force && cachedConfig) return cachedConfig;
  if (!force && configPromise) return configPromise;

  configPromise = (async () => {
    try {
      const response = await apiClient.get<CloudinaryConfig>('/uploads/cloudinary-config/', {
        skipAuth: true,
      });
      if (response.success && response.data) {
        cachedConfig = response.data;
        return response.data;
      }
    } catch {
      /* fallback below */
    }
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  })();

  return configPromise;
}

async function uploadImageDirect(
  file: File,
  config: CloudinaryConfig,
  folder?: string,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.upload_preset);
  const targetFolder = folder || config.folder;
  if (targetFolder) formData.append('folder', targetFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    let message = 'Cloudinary upload failed';
    try {
      const errorBody = await response.json();
      message =
        (typeof errorBody?.error?.message === 'string' && errorBody.error.message) ||
        (typeof errorBody?.error === 'string' && errorBody.error) ||
        (typeof errorBody?.message === 'string' && errorBody.message) ||
        JSON.stringify(errorBody);
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) message = errorText;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as {
    secure_url?: string;
    url?: string;
    public_id?: string;
    width?: number;
    height?: number;
  };

  const url = data.secure_url || data.url;
  if (!url) throw new Error('Cloudinary upload succeeded but no URL was returned');

  return {
    url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}

async function uploadImageViaBackend(
  file: File,
  folder?: string,
  onProgress?: (progress: number) => void,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  const response = await apiClient.upload<CloudinaryUploadResult>(
    '/uploads/cloudinary-upload/',
    formData,
    onProgress,
  );

  if (!response.success || !response.data?.url) {
    throw new Error(response.message || 'Cloudinary upload failed');
  }

  return response.data;
}

/**
 * Upload an image to Cloudinary using backend env credentials.
 * 1. Unsigned preset (browser → Cloudinary) when CLOUDINARY_UPLOAD_PRESET is set
 * 2. Server-side upload (browser → Django → Cloudinary) otherwise
 */
export async function uploadImageToCloudinary(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void },
): Promise<CloudinaryUploadResult> {
  const config = await getCloudinaryConfig();
  if (!config.enabled) {
    throw new Error('Cloudinary is not configured on the server');
  }

  if (config.upload_preset && config.browser_upload !== false) {
    return uploadImageDirect(file, config, options?.folder);
  }

  if (config.server_upload) {
    return uploadImageViaBackend(file, options?.folder, options?.onProgress);
  }

  throw new Error(
    'Cloudinary browser upload preset is missing or server credentials are invalid. ' +
      'Create an unsigned upload preset in Cloudinary and set CLOUDINARY_UPLOAD_PRESET.',
  );
}

export async function tryUploadImageToCloudinary(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void },
): Promise<CloudinaryUploadResult | null> {
  try {
    const config = await getCloudinaryConfig();
    if (!config.enabled) return null;
    return await uploadImageToCloudinary(file, options);
  } catch {
    return null;
  }
}

export const cloudinaryService = {
  getConfig: getCloudinaryConfig,
  isImageFile,
  uploadImage: uploadImageToCloudinary,
  tryUploadImage: tryUploadImageToCloudinary,
};

export default cloudinaryService;
