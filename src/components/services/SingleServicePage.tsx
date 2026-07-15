'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { chatService } from '@/services/chat.service';
import { dashboardMessageConversationHref } from '@/lib/dashboardChat';
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
import { getCheckoutHref } from '@/lib/checkout';
import { useCheckoutProfileGate } from '@/hooks/useCheckoutProfileGate';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import { getServiceMeta, getServicePackages, type Service, type ServicePackage } from './serviceListData';
import { getServiceDetailPath } from './serviceSlug';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface SingleServicePageProps {
  service: Service;
  variant?: 'page' | 'overlay';
  backLink?: { href: string; label: string };
  footerHint?: string;
}

export default function SingleServicePage({
  service,
  variant = 'page',
  backLink,
  footerHint,
}: SingleServicePageProps) {
  const isOverlay = variant === 'overlay';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const meta = getServiceMeta(service);
  const packages = getServicePackages(service);
  const [selectedPackageId, setSelectedPackageId] = useState(
    packages[0]?.id ?? 'basic',
  );
  const planCardRef = useRef<HTMLDivElement>(null);
  const { showProfilePopup, goToCheckout, completeProfileGate, cancelProfileGate } =
    useCheckoutProfileGate();

  useEffect(() => {
    const nextPackages = getServicePackages(service);
    setSelectedPackageId(nextPackages[0]?.id ?? 'basic');
  }, [service]);

  const handleSelectPackage = useCallback((packageId: ServicePackage['id']) => {
    setSelectedPackageId(packageId);
    planCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handlePurchasePackage = useCallback(
    (pkg: ServicePackage) => {
      if (!user) {
        toast.message('Sign in to purchase this service');
        router.push(`/login?redirect=${encodeURIComponent(`/services/${service.slug ?? ''}`)}`);
        return;
      }

      if (service.ownerId && user.id === service.ownerId) {
        toast.error('You cannot purchase your own service.');
        return;
      }

      if (!service.slug) {
        toast.error('This service is not available for purchase yet.');
        return;
      }

      goToCheckout(getCheckoutHref('service', service.slug, { packageId: pkg.id }));
    },
    [goToCheckout, service.ownerId, service.slug, user],
  );

  const handleContactSeller = useCallback(
    async (name: string, message: string): Promise<boolean> => {
      if (!message.trim()) {
        return false;
      }

      if (!user) {
        toast.message('Sign in to message this seller');
        router.push(`/login?redirect=${encodeURIComponent(`/services/${service.slug ?? ''}`)}`);
        return false;
      }

      if (service.ownerId && user.id === service.ownerId) {
        toast.error('You cannot message your own service.');
        return false;
      }

      if (!service.ownerId) {
        toast.error('This seller is not available for messaging yet.');
        return false;
      }

      const serviceContext = `Re: ${service.title}\n\n${message.trim()}`;

      try {
        const conversationRes = await chatService.findOrCreateDirectConversation(service.ownerId);
        if (!conversationRes.success || !conversationRes.data) {
          toast.error('Could not start a conversation. Please try again.');
          return false;
        }

        const sendRes = await chatService.sendMessage(conversationRes.data.id, {
          content: serviceContext,
        });
        if (!sendRes.success) {
          toast.error('Message could not be sent. Please try again.');
          return false;
        }

        router.push(dashboardMessageConversationHref(conversationRes.data.id));
        return true;
      } catch {
        toast.error(`Could not send your message to ${name}. Please try again.`);
        return false;
      }
    },
    [router, service.ownerId, service.slug, service.title, user],
  );

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 dark:bg-neutral-950 dark:text-stone-100 [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className={`mx-auto w-full max-w-7xl ${isOverlay ? 'px-4 py-2 sm:px-6' : 'px-4 sm:px-6 lg:px-8'}`}>
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
                  onPurchase={handlePurchasePackage}
                />
              </div>
              <ServiceSellerCard service={service} onContact={handleContactSeller} />
              <div className="px-1">
                <ServiceShareSaveActions
                  service={service}
                  className="justify-center sm:justify-center"
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-normal text-neutral-500">
            {footerHint ??
              (isOverlay
                ? 'Browse more services on the service map.'
                : 'Browse more services on the full marketplace directory.')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {isOverlay ? (
              <Link
                href={getServiceDetailPath(service)}
                className="inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] transition-opacity hover:opacity-80"
              >
                Open full page
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href={backLink?.href ?? '/services'}
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80 dark:text-stone-200"
            >
              {backLink?.label ?? 'Back to all services'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {showProfilePopup ? (
        <MakeOfferModal
          presentation="modal"
          profileGateOnly
          profileGateListingKind="service"
          isOpen={showProfilePopup}
          onClose={cancelProfileGate}
          onProfileGateComplete={completeProfileGate}
        />
      ) : null}
    </div>
  );
}
