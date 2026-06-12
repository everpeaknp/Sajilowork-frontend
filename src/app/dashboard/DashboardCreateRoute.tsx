'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  buildJobFormDefaultsFromProfile,
  getEmployerPostingContext,
} from '@/lib/employerBusinessProfile';
import {
  categoryNamesForSelect,
  jobFormToTaskPayload,
  loadCategories,
  projectFormToTaskPayload,
  resolveCategoryId,
  serviceFormToTaskPayload,
  taskToJobFormData,
  taskToProjectFormData,
  taskToServiceFormData,
  uploadTaskFiles,
} from '@/lib/dashboardListingApi';
import { getMediaUrl } from '@/lib/utils';
import { jobService } from '@/services/job.service';
import { projectService } from '@/services/project.service';
import { serviceService } from '@/services/service.service';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store';
import DashboardCreateJob, {
  type CreateJobFormData,
} from './DashboardCreateJob';
import DashboardCreateService, {
  type CreateServiceFormData,
} from './DashboardCreateService';
import { type DashboardCreateTab, getDashboardListHref as listHref } from './dashboardTabs';
import type { FormUploadsPayload } from './types';
import { initialGalleryUrls, resolveAttachmentUploads, resolveGalleryUploads } from './uploadUtils';
import type { Category, Task } from '@/types';
import DashboardCreateProject, { type CreateProjectFormData } from './DashboardCreateProject';

type DashboardCreateRouteProps = {
  tab: DashboardCreateTab;
  editSlug?: string;
};

export default function DashboardCreateRoute({ tab, editSlug }: DashboardCreateRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const postingContext = useMemo(() => getEmployerPostingContext(user), [user]);
  const createJobDefaults = useMemo(() => buildJobFormDefaultsFromProfile(user), [user]);
  const isEdit = Boolean(editSlug);

  const [categories, setCategories] = useState<Category[]>([]);
  const serviceCategoryOptions = useMemo(() => categoryNamesForSelect(categories), [categories]);
  const projectCategoryOptions = serviceCategoryOptions;
  const [loadingTask, setLoadingTask] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const goBack = useCallback(() => {
    router.push(listHref(tab));
  }, [router, tab]);

  useEffect(() => {
    void loadCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!editSlug) return;

    let cancelled = false;
    setLoadingTask(true);

    const loadListing =
      tab === 'services'
        ? serviceService.getServiceBySlug(editSlug)
        : tab === 'project'
          ? projectService.getProjectBySlug(editSlug)
          : tab === 'jobs'
            ? jobService.getJobBySlug(editSlug)
            : taskService.getTaskBySlug(editSlug);

    void loadListing.then((response) => {
        if (cancelled) return;
        if (!response.success || !response.data) {
          toast.error(response.message || 'Could not load listing');
          router.push(listHref(tab));
          return;
        }
        setEditTask(response.data);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Could not load listing');
          router.push(listHref(tab));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTask(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editSlug, router, tab]);

  const handleServiceSubmit = async (data: CreateServiceFormData, uploads: FormUploadsPayload) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const categoryId = await resolveCategoryId(data.category, categories);
      const payload = serviceFormToTaskPayload(data, categoryId);

      if (isEdit && editTask?.slug) {
        const response = await serviceService.updateService(editTask.slug, payload);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update service');
        }
        const galleryFiles = uploads.galleryFiles;
        if (galleryFiles.length) {
          await uploadTaskFiles(response.data.id, galleryFiles);
        }
        toast.success('Service updated');
        router.push(listHref('services'));
        return;
      }

      const response = await serviceService.createService(payload as never);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create service');
      }

      const galleryFiles = uploads.galleryFiles;
      if (galleryFiles.length) {
        await uploadTaskFiles(response.data.id, galleryFiles);
      }

      toast.success('Service saved');
      router.push(listHref('services'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save service';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJobSubmit = async (data: CreateJobFormData) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const categoryId = await resolveCategoryId(data.category, categories);
      const payload = jobFormToTaskPayload(data, categoryId);

      if (isEdit && editTask?.slug) {
        const response = await jobService.updateJob(editTask.slug, payload);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update job');
        }
        toast.success('Job updated');
        router.push(listHref('jobs'));
        return;
      }

      const response = await jobService.createJob(payload as never);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create job');
      }

      const publicSlug = response.data.slug;
      if (publicSlug) {
        toast.success('Job posted', {
          description: `View at /jobs/${publicSlug}`,
          action: {
            label: 'Open',
            onClick: () => router.push(`/jobs/${publicSlug}`),
          },
        });
      } else {
        toast.success('Job posted');
      }
      router.push(listHref('jobs'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save job';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectSubmit = async (data: CreateProjectFormData, uploads: FormUploadsPayload) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const categoryId = await resolveCategoryId(data.category, categories);
      const payload = projectFormToTaskPayload(data, categoryId);
      const attachmentFiles = uploads.attachmentFiles;

      if (isEdit && editTask?.slug) {
        const response = await projectService.updateProject(editTask.slug, payload);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update project');
        }
        if (attachmentFiles.length) {
          await uploadTaskFiles(response.data.id, attachmentFiles);
        }
        toast.success('Project updated');
        router.push(listHref('project'));
        return;
      }

      const response = await projectService.createProject(payload as never);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create project');
      }

      if (attachmentFiles.length) {
        await uploadTaskFiles(response.data.id, attachmentFiles);
      }

      const publicSlug = response.data.slug;
      if (publicSlug) {
        toast.success('Project posted', {
          description: `View at /projects/${publicSlug}`,
          action: {
            label: 'Open',
            onClick: () => router.push(`/projects/${publicSlug}`),
          },
        });
      } else {
        toast.success('Project posted');
      }
      router.push(listHref('project'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save project';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTask) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f0efec] text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (tab === 'services') {
    const gallery = editTask
      ? initialGalleryUrls(
          undefined,
          editTask.attachments
            ?.map((item) => getMediaUrl(item.file_url))
            .filter((url): url is string => Boolean(url)),
        )
      : [];

    return (
      <DashboardCreateService
        mode={isEdit ? 'edit' : 'create'}
        onBack={goBack}
        onSubmit={handleServiceSubmit}
        initialData={editTask ? taskToServiceFormData(editTask) : undefined}
        initialGalleryUrls={gallery}
        categoryOptions={serviceCategoryOptions}
      />
    );
  }

  if (tab === 'jobs') {
    return (
      <DashboardCreateJob
        mode={isEdit ? 'edit' : 'create'}
        onBack={goBack}
        onSubmit={handleJobSubmit}
        initialData={
          editTask ? taskToJobFormData(editTask) : createJobDefaults ?? undefined
        }
        postingContext={postingContext}
      />
    );
  }

  const projectAttachments =
    editTask?.attachments?.map((item) => ({
      name: item.file_name,
      url: item.file_url,
    })) ?? [];

  return (
    <DashboardCreateProject
      mode={isEdit ? 'edit' : 'create'}
      onBack={goBack}
      onSubmit={handleProjectSubmit}
      postingContext={postingContext}
      initialData={editTask ? taskToProjectFormData(editTask) : undefined}
      initialAttachments={projectAttachments}
      categoryOptions={projectCategoryOptions}
    />
  );
}
