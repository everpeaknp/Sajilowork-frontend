'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleFreelancerPage from '@/components/freelancers/SingleFreelancerPage';
import { useAuth } from '@/hooks/useAuth';
import type { FreelancerProfileBundle } from '@/lib/freelancerProfileFromApi';
import { loadFreelancerPageData, resolveEmployerRedirectForSlug } from '@/lib/freelancerApi';
import { chatService } from '@/services/chat.service';
import { dashboardMessageConversationHref } from '@/lib/dashboardChat';

export default function FreelancerSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [bundle, setBundle] = useState<FreelancerProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setNotFoundState(false);
    setLoadError(null);
    setBundle(null);

    try {
      const loaded = await loadFreelancerPageData(slug);
      if (!loaded) {
        const employerPath = await resolveEmployerRedirectForSlug(slug);
        if (employerPath) {
          router.replace(employerPath);
          return;
        }
        setNotFoundState(true);
        return;
      }

      const profileUsername = loaded.freelancer.username?.trim();
      if (
        slug &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) &&
        profileUsername &&
        profileUsername.toLowerCase() !== slug.toLowerCase()
      ) {
        router.replace(`/freelancers/${encodeURIComponent(profileUsername)}`);
        return;
      }

      setBundle(loaded);
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? Number((error as { status?: number }).status)
          : 0;
      if (status === 404) {
        setNotFoundState(true);
      } else {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Could not load this profile. Check that the API is running and try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleContact = async (name: string, message?: string) => {
    if (!bundle?.extras.userId || !message?.trim()) {
      return;
    }

    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/freelancers/${slug}`)}`);
      return;
    }

    if (currentUser.id === bundle.extras.userId) {
      triggerNotification('You cannot message your own profile.');
      return;
    }

    try {
      const conversationRes = await chatService.findOrCreateDirectConversation(
        bundle.extras.userId,
      );
      if (!conversationRes.success || !conversationRes.data) {
        triggerNotification('Could not start a conversation. Please try again.');
        return;
      }

      const sendRes = await chatService.sendMessage(conversationRes.data.id, {
        content: message.trim(),
      });
      if (!sendRes.success) {
        triggerNotification('Message could not be sent. Please try again.');
        return;
      }

      router.push(dashboardMessageConversationHref(conversationRes.data.id));
    } catch {
      triggerNotification(`Could not send your message to ${name}. Please try again.`);
    }
  };

  if (!slug) {
    notFound();
  }

  if (!loading && notFoundState) {
    notFound();
  }

  return (
    <div
      className={`${discoverDmSans} discover-page subpixel-antialiased mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <AnimatePresence>
          {notification ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 mx-auto mb-6 flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-normal text-emerald-800 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="cursor-pointer rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {loadError ? (
          <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-24 text-center">
            <p className="text-sm text-neutral-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="rounded-full bg-[#52C47F] px-5 py-2 text-sm text-white"
            >
              Try again
            </button>
          </div>
        ) : loading || !bundle ? (
          <div className="flex min-h-[50vh] items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" aria-label="Loading profile" />
          </div>
        ) : (
          <SingleFreelancerPage
            freelancer={bundle.freelancer}
            profileExtras={bundle.extras}
            isProfileConfigured={bundle.isProfileConfigured}
            isOwnProfile={currentUser?.id === bundle.extras.userId}
            onInquire={handleContact}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
