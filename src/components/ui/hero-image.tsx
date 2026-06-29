import Image from 'next/image';

import { cn } from '@/lib/utils';

type HeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** LCP-optimized hero image — AVIF/WebP via next/image, priority preload. */
export default function HeroImage({
  src,
  alt,
  className,
  width = 600,
  height = 700,
  priority = true,
}: HeroImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes="(max-width: 768px) 50vw, 38vw"
      className={cn(className)}
      draggable={false}
    />
  );
}
