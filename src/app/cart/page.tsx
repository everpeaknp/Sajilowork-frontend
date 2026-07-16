import { redirect } from 'next/navigation';

/**
 * Legacy / marketing alias — purchase flow lives under /checkout/[kind]/[slug].
 * Browse services when someone hits /cart without a listing context.
 */
export default function CartRedirectPage() {
  redirect('/services');
}
