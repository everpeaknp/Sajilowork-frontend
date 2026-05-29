'use client';

import { useParams } from 'next/navigation';
import PublicUserProfile from '@/components/users/PublicUserProfile';

export default function UserProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  return <PublicUserProfile slug={slug} />;
}
