'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleTaskPage from '@/components/task/page/SingleTaskPage';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';

export default function TaskDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const loadTask = useCallback(async () => {
    if (!slug) return;

    try {
      const response = await taskService.getTaskBySlug(slug);
      if (response.success && response.data) {
        setTask(response.data);
        setNotFoundState(false);
      } else {
        setTask(null);
        setNotFoundState(true);
      }
    } catch {
      setTask(null);
      setNotFoundState(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFoundState(false);

    void taskService
      .getTaskBySlug(slug)
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setTask(response.data);
          return;
        }
        setNotFoundState(true);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFoundState(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug || notFoundState) {
    notFound();
  }

  if (loading || !task) {
    return (
      <div
        className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500`}
      >
        Loading task…
      </div>
    );
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleTaskPage
          task={task}
          onTaskUpdated={() => void loadTask()}
          makeOfferPresentation="modal"
        />
      </main>
      <Footer />
    </div>
  );
}
