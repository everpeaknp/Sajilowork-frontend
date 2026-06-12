'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ServiceDetailHero from './ServiceDetailHero';
import ServiceInfoBar from './ServiceInfoBar';
import ServiceGallery from './ServiceGallery';
import ServicePlanCard from './ServicePlanCard';
import ServiceSellerCard from './ServiceSellerCard';
import ServiceAbout from './ServiceAbout';
import ServiceComparePackages from './ServiceComparePackages';
import ServiceFaq from './ServiceFaq';
import ServiceReviews from './ServiceReviews';
import ServiceShareSaveActions from './ServiceShareSaveActions';
import { getServiceMeta, type Service } from './serviceListData';

interface SingleServicePageProps {
  service: Service;
}

export default function SingleServicePage({ service }: SingleServicePageProps) {
  const meta = getServiceMeta(service);

  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black antialiased [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-end">
          <ServiceShareSaveActions service={service} />
        </div>

        <ServiceDetailHero service={service} />

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ServiceInfoBar service={service} />

            <div className="mt-8">
              <ServiceGallery images={meta.gallery} altPrefix={service.title} />
            </div>

            <ServiceAbout service={service} />
            <ServiceComparePackages service={service} />
            <ServiceFaq service={service} />
            <ServiceReviews service={service} />
          </div>

          <aside className="mx-auto w-full max-w-[19.5rem] sm:max-w-[20rem] lg:sticky lg:top-20 lg:col-span-4 lg:mx-0 lg:ml-auto lg:self-start">
            <div className="space-y-5">
              <ServicePlanCard service={service} />
              <ServiceSellerCard service={service} />
            </div>
          </aside>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-normal text-neutral-500">
            Browse more services on the full marketplace directory.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
          >
            Back to all services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
