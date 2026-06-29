'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

import { cn, getMediaUrl } from '@/lib/utils';

type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
  fallbackSrc?: string;
};

/** next/image wrapper — resolves API media paths, optional fallback, lazy-loads by default. */
export default function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fallbackSrc,
  onError,
  ...props
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed && fallbackSrc ? getMediaUrl(fallbackSrc) : getMediaUrl(src);
  if (!resolved) return null;

  return (
    <Image
      src={resolved}
      alt={alt}
      className={cn(className)}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      onError={(event) => {
        if (fallbackSrc && !failed) {
          setFailed(true);
          return;
        }
        onError?.(event);
      }}
      {...props}
    />
  );
}
