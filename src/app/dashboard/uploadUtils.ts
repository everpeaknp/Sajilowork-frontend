import type { FormUploadsPayload, UploadAttachment } from './types';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';

export function resolveFormUploads(
  uploads: FormUploadsPayload,
  fallbackImage = DEFAULT_IMAGE,
): { gallery: string[]; attachments: UploadAttachment[]; image: string } {
  const gallery = [
    ...uploads.keptGalleryUrls,
    ...uploads.galleryFiles.map((file) => URL.createObjectURL(file)),
  ];
  const attachments: UploadAttachment[] = [
    ...uploads.keptAttachments,
    ...uploads.attachmentFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })),
  ];

  return {
    gallery,
    attachments,
    image: gallery[0] ?? fallbackImage,
  };
}

export function initialGalleryUrls(image?: string, gallery?: string[]): string[] {
  if (gallery?.length) return gallery;
  if (image) return [image];
  return [];
}

export function resolveGalleryUploads(
  galleryFiles: File[],
  keptGalleryUrls: string[],
  fallbackImage = DEFAULT_IMAGE,
): { gallery: string[]; image: string } {
  const gallery = [...keptGalleryUrls, ...galleryFiles.map((file) => URL.createObjectURL(file))];
  return {
    gallery,
    image: gallery[0] ?? fallbackImage,
  };
}

export function resolveAttachmentUploads(
  attachmentFiles: File[],
  keptAttachments: UploadAttachment[],
): UploadAttachment[] {
  return [
    ...keptAttachments,
    ...attachmentFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })),
  ];
}
