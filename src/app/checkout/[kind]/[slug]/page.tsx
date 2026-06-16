'use client';

import { notFound, useParams } from 'next/navigation';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';
import { isCheckoutKind } from '@/lib/checkout';

export default function CheckoutPage() {
  const params = useParams();
  const kind = typeof params.kind === 'string' ? params.kind : '';
  const slug = typeof params.slug === 'string' ? params.slug : '';

  if (!isCheckoutKind(kind) || !slug) {
    notFound();
  }

  return <CheckoutPageClient kind={kind} slug={slug} />;
}
