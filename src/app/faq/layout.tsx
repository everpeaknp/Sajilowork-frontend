import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import { buildFaqPageSchema, buildPageMetadata, fetchPublicJson } from '@/lib/seo';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqResponse = {
  results?: FaqItem[];
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'FAQ',
    description:
      'Answers about posting tasks, secure payments, cancellations, and using Sajilowork in Nepal.',
    path: '/faq',
  });
}

export default async function FaqLayout({ children }: { children: React.ReactNode }) {
  const data = await fetchPublicJson<FaqResponse>('/faq/', { revalidate: 3600 });
  const items = data?.results || [];
  const schema = items.length
    ? buildFaqPageSchema(
        items.map((item) => ({ question: item.question, answer: item.answer })),
      )
    : null;

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
