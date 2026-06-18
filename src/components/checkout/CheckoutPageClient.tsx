'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';
import CheckoutWalletSummary from '@/components/checkout/CheckoutWalletSummary';
import { useCheckoutWalletPreview } from '@/hooks/useCheckoutWalletPreview';
import BidForm from '@/components/task/modals/MakeOfferModal/BidForm';
import JobApplyForm from '@/components/task/modals/MakeOfferModal/JobApplyForm';
import ServicePurchaseModal from '@/components/services/ServicePurchaseModal';
import { projectToOfferTask } from '@/components/projects/projectSlug';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import '@/components/LangingHome/landing-home.css';
import type { Project } from '@/components/projects/projectListData';
import type { Job } from '@/components/jobs/jobListData';
import type { Service, ServicePackage } from '@/components/services/serviceListData';
import { getServicePackages } from '@/components/services/serviceListData';
import { fetchPublicProjectBySlug } from '@/lib/projectApi';
import { fetchPublicJobBySlug } from '@/lib/jobApi';
import { fetchPublicServiceBySlug } from '@/lib/serviceApi';
import { taskService } from '@/services/task.service';
import { useAuth } from '@/hooks/useAuth';
import { formatNPR } from '@/lib/nepalLocale';
import {
  getCheckoutActionLabel,
  getCheckoutPageTitle,
  getCheckoutSuccessRedirect,
  getListingDetailHref,
  type CheckoutKind,
} from '@/lib/checkout';
import type { Task, Bid } from '@/types';

type CheckoutPageClientProps = {
  kind: CheckoutKind;
  slug: string;
};

type CheckoutListingSummary = {
  title: string;
  subtitle?: string;
  priceLabel?: string;
  detailHref: string;
};

export default function CheckoutPageClient({ kind, slug }: CheckoutPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const packageId = searchParams.get('package') ?? undefined;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  const detailHref = getListingDetailHref(kind, slug);
  const pageTitle = getCheckoutPageTitle(kind);
  const actionLabel = getCheckoutActionLabel(kind);

  useEffect(() => {
    if (!user) {
      const redirect = `/checkout/${kind}/${encodeURIComponent(slug)}${packageId ? `?package=${encodeURIComponent(packageId)}` : ''}`;
      router.replace(`/signin?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (kind === 'task') {
          const response = await taskService.getTaskBySlug(slug);
          if (!cancelled && response.success && response.data) {
            setTask(response.data);
          }
        } else if (kind === 'project') {
          const data = await fetchPublicProjectBySlug(slug);
          if (!cancelled) setProject(data);
        } else if (kind === 'job') {
          const data = await fetchPublicJobBySlug(slug);
          if (!cancelled) setJob(data);
        } else if (kind === 'service') {
          const data = await fetchPublicServiceBySlug(slug);
          if (!cancelled) {
            setService(data);
            if (data) {
              const packages = getServicePackages(data);
              const match =
                packages.find((pkg) => pkg.id === packageId) ?? packages[0] ?? null;
              setSelectedPackage(match);
            }
          }
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not load checkout details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [kind, packageId, router, slug, user]);

  const summary = useMemo<CheckoutListingSummary | null>(() => {
    if (kind === 'task' && task) {
      return {
        title: task.title,
        subtitle: 'Marketplace task',
        priceLabel: task.budget_amount ? formatNPR(task.budget_amount) : undefined,
        detailHref,
      };
    }
    if (kind === 'project' && project) {
      return {
        title: project.title,
        subtitle: 'Project listing',
        priceLabel: project.budgetLabel || undefined,
        detailHref,
      };
    }
    if (kind === 'job' && job) {
      return {
        title: job.title,
        subtitle: 'Job listing',
        priceLabel: job.budgetLabel || undefined,
        detailHref,
      };
    }
    if (kind === 'service' && service && selectedPackage) {
      return {
        title: service.title,
        subtitle: `${selectedPackage.name} package`,
        priceLabel: formatNPR(selectedPackage.price),
        detailHref,
      };
    }
    return null;
  }, [detailHref, job, kind, project, selectedPackage, service, task]);

  const handleOfferSuccess = useCallback(
    (payload?: { bid?: Bid } | Bid) => {
      const resolvedBid = payload && 'id' in payload ? (payload as Bid) : (payload as { bid?: Bid })?.bid;
      const redirect = getCheckoutSuccessRedirect(kind, {
        bid: resolvedBid,
        bidId: resolvedBid?.id != null ? String(resolvedBid.id) : undefined,
        orderTaskSlug: resolvedBid?.task_slug ?? slug,
      });
      router.push(redirect);
    },
    [kind, router, slug],
  );

  const handleServiceSuccess = useCallback(
    (result: { order_task_slug: string; bid_id: string; conversation_id?: string }) => {
      router.push(
        getCheckoutSuccessRedirect('service', {
          orderTaskSlug: result.order_task_slug,
          bidId: result.bid_id,
          conversationId: result.conversation_id,
        }),
      );
    },
    [router],
  );

  const offerTask = useMemo(() => {
    if (kind === 'task' && task) return task;
    if (kind === 'project' && project) return projectToOfferTask(project);
    return null;
  }, [kind, project, task]);

  const hasListing =
    (kind === 'task' && task) ||
    (kind === 'project' && project) ||
    (kind === 'job' && job) ||
    (kind === 'service' && service && selectedPackage);

  const holdAmount = useMemo(() => {
    if (kind === 'task' && task?.budget_amount) {
      return Number(task.budget_amount) || 0;
    }
    if (kind === 'project' && project) {
      return Number(project.budgetMax || project.budgetMin || 0);
    }
    if (kind === 'service' && selectedPackage) {
      return Number(selectedPackage.price) || 0;
    }
    return 0;
  }, [kind, project, selectedPackage, task]);

  // Hide wallet "Available balance" / "Add funds to wallet" section on task + project checkouts.
  // (The wallet summary is still shown for `service` purchases.)
  const showWalletSummary = kind === 'service';

  const walletPreview = useCheckoutWalletPreview({
    kind,
    enabled: Boolean(hasListing && showWalletSummary),
    holdAmount,
    serviceSlug: service?.slug,
    packageId: selectedPackage?.id,
  });

  return (
    <div
      className={`${discoverDmSans} discover-page mobile-bottom-nav-offset min-h-screen bg-white font-normal text-neutral-900 antialiased`}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={detailHref}
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : !hasListing || !summary ? (
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm text-neutral-600">This listing could not be loaded.</p>
            <Link
              href={detailHref}
              className="mt-4 inline-block text-sm text-neutral-900 underline-offset-2 hover:underline"
            >
              Return to listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
            <section className="lg:col-span-3">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{pageTitle}</h1>
              <p className="mt-1 text-sm text-neutral-500">{actionLabel}</p>

              <div className="mt-8">
                {kind === 'service' && service && selectedPackage ? (
                  <ServicePurchaseModal
                    presentation="page"
                    embedded
                    service={service}
                    package={selectedPackage}
                    onClose={() => router.push(detailHref)}
                    onSuccess={handleServiceSuccess}
                  />
                ) : kind === 'job' && job ? (
                  <JobApplyForm
                    embedded
                    job={job}
                    onSuccess={handleOfferSuccess}
                    onCancel={() => router.push(detailHref)}
                  />
                ) : offerTask ? (
                  <BidForm
                    embedded
                    task={offerTask}
                    listingKind={kind === 'project' ? 'project' : 'task'}
                    onSuccess={handleOfferSuccess}
                    onCancel={() => router.push(detailHref)}
                  />
                ) : null}
              </div>
            </section>

            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-20">
                <CheckoutOrderSummary kind={kind} summary={summary} />
                {showWalletSummary && walletPreview ? (
                  <CheckoutWalletSummary kind={kind} {...walletPreview} />
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
