'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleFreelancerPage from '@/components/freelancers/SingleFreelancerPage';
import { useAuth } from '@/hooks/useAuth';
import type { FreelancerProfileBundle } from '@/lib/freelancerProfileFromApi';
import { chatService } from '@/services/chat.service';
import { dashboardMessageConversationHref } from '@/lib/dashboardChat';

type FreelancerSlugPageClientProps = {
  bundle: FreelancerProfileBundle;
  slug: string;
};

export default function FreelancerSlugPageClient({
  bundle,
  slug,
}: FreelancerSlugPageClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleContact = async (name: string, message?: string) => {
    if (!bundle.extras.userId || !message?.trim()) {
      return;
    }

    if (!currentUser) {
      router.push(`/signin?redirect=${encodeURIComponent(`/freelancers/${slug}`)}`);
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

  return (
    <div
      className={`${discoverDmSans} discover-page subpixel-antialiased mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white dark:bg-neutral-950 dark:text-stone-100 dark:selection:bg-brand-emerald [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <AnimatePresence>
          {notification ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 mx-auto mb-6 flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-normal text-emerald-800 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="cursor-pointer rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <SingleFreelancerPage
          freelancer={bundle.freelancer}
          profileExtras={bundle.extras}
          isProfileConfigured={bundle.isProfileConfigured}
          isOwnProfile={currentUser?.id === bundle.extras.userId}
          onInquire={handleContact}
          onNotification={triggerNotification}
        />
      </main>
      <Footer />
    </div>
  );
}
