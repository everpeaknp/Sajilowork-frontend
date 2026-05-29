import { redirect } from 'next/navigation';

/** Legacy URL — list lives at /blog */
export default function BlogPostsRedirectPage() {
  redirect('/blog');
}
