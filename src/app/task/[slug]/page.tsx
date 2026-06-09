'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import TaskDetails from '@/components/task/TaskDetails';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskSlug = params.slug as string;

  const [apiTask, setApiTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTaskDetails = useCallback(async () => {
    if (!taskSlug) return;

    try {
      setLoading(true);
      const response = await taskService.getTaskBySlug(taskSlug);

      if (response.success && response.data) {
        setApiTask(response.data);
        setError(null);
      } else {
        setApiTask(null);
        setError(response.message || 'Failed to load task details');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to load task details';
      setApiTask(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [taskSlug]);

  useEffect(() => {
    void loadTaskDetails();
  }, [loadTaskDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-on-surface-variant font-medium">Loading task…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !apiTask) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-error mb-2">Task not found</h2>
            <p className="text-on-surface-variant mb-6">{error || 'This task may have been removed.'}</p>
            <button
              type="button"
              onClick={() => router.push('/task')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-full font-semibold hover:bg-brand-emerald/90"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to browse tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <TaskDetails
          variant="page"
          task={apiTask}
          onClose={() => router.push('/task')}
          onTaskUpdated={() => void loadTaskDetails()}
        />
      </main>
    </div>
  );
}
