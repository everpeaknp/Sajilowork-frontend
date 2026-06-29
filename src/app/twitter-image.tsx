import { ImageResponse } from 'next/og';

import { BrandMark } from '@/lib/seo/brand-image';

export const runtime = 'edge';
export const alt = 'Sajilowork — hire skilled taskers and freelancers in Nepal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <BrandMark
        subtitle="Hire skilled taskers, find jobs, and book local services across Nepal."
      />
    ),
    { ...size },
  );
}
