'use client';

import { Suspense } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';
import { isCheckoutKind } from '@/lib/checkout';

export default function CheckoutPage() {
  const params = useParams();
  const kind = typeof params.kind === 'string' ? params.kind : '';
  const slug = typeof params.slug === 'string' ? params.slug : '';

  if (!isCheckoutKind(kind) || !slug) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#005fff]" />
        </div>
      }
    >
      <CheckoutPageClient kind={kind} slug={slug} />
    </Suspense>
  );
}
