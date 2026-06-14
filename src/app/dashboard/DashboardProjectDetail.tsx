'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { mapTaskStatusToDashboard } from '@/lib/dashboardListingApi';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import {
  canConfirmWorkComplete,
  getCompletionStatusMessage,
} from '@/lib/taskUtils';
import { taskService } from '@/services/task.service';
import type { Task, TaskStatus } from '@/types';
import {
  getDashboardEditHref,
  getDashboardHref,
  getDashboardProposalProjectHref,
} from './dashboardTabs';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

interface DashboardProjectDetailProps {
  projectSlug: string;
}

function formatDisplayDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="text-sm text-black sm:col-span-2">{value}</dd>
    </div>
  );
}

function resolveOwnerId(task: Task): string | undefined {
  if (typeof task.owner === 'string') return task.owner;
  if (task.owner && typeof task.owner === 'object' && task.owner.id) {
    return String(task.owner.id);
  }
  return undefined;
}

function resolveTaskerId(task: Task): string | undefined {
  if (typeof task.assigned_tasker === 'string') return task.assigned_tasker;
  if (task.assigned_tasker && typeof task.assigned_tasker === 'object' && task.assigned_tasker.id) {
    return String(task.assigned_tasker.id);
  }
  return undefined;
}

function statusBadgeClass(dashboardStatus: string): string {
  switch (dashboardStatus) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700';
    case 'Ongoing':
      return 'bg-blue-50 text-blue-700';
    case 'Completed':
      return 'bg-violet-50 text-violet-700';
    case 'Canceled':
      return 'bg-neutral-100 text-neutral-600';
    default:
      return 'bg-amber-50 text-amber-700';
  }
}

export default function DashboardProjectDetail({ projectSlug }: DashboardProjectDetailProps) {
  const { user, isCustomer, isTasker } = useAuth();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.getTaskBySlug(projectSlug);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Project not found');
      }
      setTask(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load project';
      toast.error(message);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const project = useMemo(() => (task ? mapTaskToPublicProject(task) : null), [task]);

  const ownerId = task ? resolveOwnerId(task) : undefined;
  const taskerId = task ? resolveTaskerId(task) : undefined;
  const isOwner = Boolean(user?.id && ownerId && String(user.id) === String(ownerId));
  const isAssignedTasker = Boolean(user?.id && taskerId && String(user.id) === String(taskerId));
  const dashboardStatus = task ? mapTaskStatusToDashboard(task.status) : 'Pending';
  const rawStatus = task?.status ?? 'draft';

  const canEdit = isOwner && (rawStatus === 'draft' || rawStatus === 'open');
  const canCancel = isOwner && !['completed', 'cancelled'].includes(rawStatus);
  const canStartWork =
    (isAssignedTasker || isOwner) && ['assigned', 'funded'].includes(rawStatus);
  const canCompleteOpenListing = isOwner && rawStatus === 'open' && !taskerId;
  const canConfirmWorkCompleteAction = task
    ? canConfirmWorkComplete(task, user?.id)
    : false;
  const completionStatusMessage = task
    ? getCompletionStatusMessage(task, user?.id)
    : null;
  const showMarkCompleted = canCompleteOpenListing || canConfirmWorkCompleteAction;

  const applyStatusUpdate = async (newStatus: TaskStatus) => {
    if (!task?.slug) return;
    const response = await taskService.updateTaskStatus(task.slug, newStatus);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update status');
    }
    if (response.data?.task) {
      setTask(response.data.task);
    } else {
      await loadProject();
    }
  };

  const confirmWorkComplete = async () => {
    if (!task?.slug) return;
    const response = await apiClient.post<{
      task?: Task;
      message?: string;
      error?: string;
    }>(`/tasks/${task.slug}/confirm_work_complete/`);
    if (response.data?.error) {
      throw new Error(response.data.error);
    }
    if (response.data?.task) {
      setTask(response.data.task);
    } else {
      await loadProject();
    }
    toast.success(
      response.data?.message ||
        'Completion recorded. Waiting for the other party to confirm if needed.',
    );
  };

  const handleCancel = async () => {
    if (!task?.slug) return;
    setActionLoading(true);
    try {
      const response = await taskService.cancelTask(task.slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel project');
      }
      toast.success('Project cancelled');
      await loadProject();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      await applyStatusUpdate('in_progress');
      toast.success('Project marked as in progress');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmComplete = async () => {
    setActionLoading(true);
    try {
      await confirmWorkComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm completion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleteOpen = async () => {
    setActionLoading(true);
    try {
      await applyStatusUpdate('completed');
      toast.success('Project marked as completed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark project as completed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading project…
      </div>
    );
  }

  if (!task || !project) {
    return (
      <div className={`${DASHBOARD_PAGE_ROOT} space-y-4`}>
        <Link
          href={getDashboardHref('project')}
          className="inline-flex w-fit items-center gap-2 text-sm text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <p className="text-sm text-neutral-600">Project not found or you do not have access.</p>
      </div>
    );
  }

  if (!isOwner && !isAssignedTasker) {
    return (
      <div className={`${DASHBOARD_PAGE_ROOT} space-y-4`}>
        <Link
          href={getDashboardHref('project')}
          className="inline-flex w-fit items-center gap-2 text-sm text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <p className="text-sm text-neutral-600">You do not have permission to view this project.</p>
      </div>
    );
  }

  const locationLabel = project.locationLabel || project.location || 'Remote';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div className="flex flex-col gap-4">
        <Link
          href={getDashboardHref('project')}
          className="inline-flex w-fit items-center gap-2 text-sm font-normal text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadgeClass(dashboardStatus)}`}
              >
                {dashboardStatus}
              </span>
              <span className="text-xs text-neutral-500">
                {isOwner ? 'Posted by you' : 'Assigned to you'}
              </span>
            </div>
            <h2 className="font-sans text-3xl font-normal tracking-tight text-black">{project.title}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-700">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                {locationLabel}
              </span>
              <span className="text-neutral-300">|</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                Posted {project.postedDate || formatDisplayDate(task.created_at)}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
            {canStartWork ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleStartWork()}
                className="rounded-lg bg-[#52C47F] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
              >
                {actionLoading ? 'Processing…' : 'Start work'}
              </button>
            ) : null}
            {showMarkCompleted ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  void (canCompleteOpenListing
                    ? handleMarkCompleteOpen()
                    : handleConfirmComplete())
                }
                className="rounded-lg bg-[#52C47F] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
              >
                {actionLoading
                  ? 'Processing…'
                  : canCompleteOpenListing
                    ? 'Mark as completed'
                    : isOwner
                      ? 'Confirm work complete'
                      : 'Mark as completed'}
              </button>
            ) : null}
            {canCancel ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleCancel()}
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Cancel project
              </button>
            ) : null}
            </div>
            {completionStatusMessage ? (
              <p className="max-w-md text-sm text-neutral-600">{completionStatusMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8">
          <h3 className="mb-4 text-lg font-normal text-black">Project details</h3>
          <dl>
            <InfoRow label="Category" value={project.category} />
            <InfoRow label="Budget" value={project.budgetLabel} />
            <InfoRow label="Type" value={project.type} />
            <InfoRow label="Experience" value={project.experienceLevel} />
            <InfoRow label="Duration" value={project.duration} />
            <InfoRow label="Location" value={locationLabel} />
            <InfoRow label="Proposals" value={String(task.bids_count ?? 0)} />
            <InfoRow label="Status" value={dashboardStatus} />
          </dl>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8">
          <h3 className="mb-4 text-lg font-normal text-black">Description</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {project.description || 'No description provided.'}
          </p>
          {project.skills.length > 0 ? (
            <div className="mt-6 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-sm text-neutral-500">Skills</p>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        {isCustomer && isOwner ? (
          <Link
            href={getDashboardProposalProjectHref(projectSlug)}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            View proposals
          </Link>
        ) : null}
        {canEdit ? (
          <Link
            href={getDashboardEditHref('project', projectSlug)}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            Edit project
          </Link>
        ) : null}
        <Link
          href={`/projects/${projectSlug}`}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
        >
          View public page
        </Link>
        {isTasker && isAssignedTasker ? (
          <Link
            href={`/task/${projectSlug}`}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            Open full task workspace
          </Link>
        ) : null}
      </div>
    </div>
  );
}
