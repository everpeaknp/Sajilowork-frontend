'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { getServiceMeta, getServicePackages, type Service, type ServicePackage } from './serviceListData';

interface SingleServicePageProps {
  service: Service;
}

export default function SingleServicePage({ service }: SingleServicePageProps) {
  const meta = getServiceMeta(service);
  const packages = getServicePackages(service);
  const [selectedPackageId, setSelectedPackageId] = useState(
    packages[0]?.id ?? 'basic',
  );
  const planCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextPackages = getServicePackages(service);
    setSelectedPackageId(nextPackages[0]?.id ?? 'basic');
  }, [service]);

  const handleSelectPackage = useCallback((packageId: ServicePackage['id']) => {
    setSelectedPackageId(packageId);
    planCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end sm:mb-5">
          <ServiceShareSaveActions service={service} />
        </div>

        <ServiceDetailHero service={service} />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ServiceInfoBar service={service} />

            <div className="mt-8">
              <ServiceGallery images={meta.gallery} altPrefix={service.title} />
            </div>

            <ServiceAbout service={service} />
            <ServiceComparePackages
              service={service}
              selectedPackageId={selectedPackageId}
              onSelectPackage={handleSelectPackage}
            />
            <ServiceFaq service={service} />
            <ServiceReviews service={service} />
          </div>

          <aside className="mx-auto w-full max-w-none sm:max-w-[20rem] lg:sticky lg:top-20 lg:col-span-4 lg:mx-0 lg:ml-auto lg:max-w-[19.5rem] lg:self-start">
            <div className="space-y-5">
              <div ref={planCardRef} className="scroll-mt-24">
                <ServicePlanCard
                  service={service}
                  selectedPackageId={selectedPackageId}
                  onSelectPackage={handleSelectPackage}
                />
              </div>
              <ServiceSellerCard service={service} />
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
