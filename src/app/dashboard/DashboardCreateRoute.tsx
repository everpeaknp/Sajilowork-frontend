'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  buildJobFormDefaultsFromProfile,
  employerPostingContextFromProfile,
  getEmployerPostingContext,
  type EmployerPostingContext,
} from '@/lib/employerBusinessProfile';
import { mapEmployerProfileDtoToBusinessProfile } from '@/lib/employerApi';
import { employerService } from '@/services';
import {
  categoryNamesForSelect,
  getListingKind,
  jobFormToTaskPayload,
  ensureMarketplaceSkill,
  loadCategories,
  loadAllCategories,
  loadLanguages,
  loadSkills,
  languageNamesForSelect,
  projectFormToTaskPayload,
  resolveCategoryId,
  serviceFormToTaskPayload,
  skillNamesForSelect,
  taskToJobFormData,
  taskToProjectFormData,
  taskToServiceFormData,
  uploadTaskFiles,
  syncTaskGallery,
} from '@/lib/dashboardListingApi';
import {
  buildPostTaskApiPayload,
  enrichPostTaskPayloadWithGeocode,
} from '@/lib/postTaskPayload';
import { taskToSimilarPrefill } from '@/lib/similarTask';
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
import type { Category, MarketplaceLanguage, MarketplaceSkill, Task } from '@/types';
import DashboardCreateProject, { type CreateProjectFormData } from './DashboardCreateProject';
import DashboardCreateTask from './DashboardCreateTask';
import type { TaskData } from '@/components/post-task/TitleDateStep';

type DashboardCreateRouteProps = {
  tab: DashboardCreateTab;
  editSlug?: string;
};

export default function DashboardCreateRoute({ tab, editSlug }: DashboardCreateRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [postingContext, setPostingContext] = useState<EmployerPostingContext | null>(() =>
    getEmployerPostingContext(user),
  );
  const createJobDefaults = useMemo(() => buildJobFormDefaultsFromProfile(user), [user]);
  const isEdit = Boolean(editSlug);

  const [categories, setCategories] = useState<Category[]>([]);
  const [jobCategories, setJobCategories] = useState<Category[]>([]);
  const [jobSkills, setJobSkills] = useState<MarketplaceSkill[]>([]);
  const [projectSkills, setProjectSkills] = useState<MarketplaceSkill[]>([]);
  const [serviceSkills, setServiceSkills] = useState<MarketplaceSkill[]>([]);
  const [projectLanguages, setProjectLanguages] = useState<MarketplaceLanguage[]>([]);
  const [serviceLanguages, setServiceLanguages] = useState<MarketplaceLanguage[]>([]);
  const serviceCategoryOptions = useMemo(() => categoryNamesForSelect(categories), [categories]);
  const jobCategoryOptions = useMemo(() => categoryNamesForSelect(jobCategories), [jobCategories]);
  const projectCategoryOptions = serviceCategoryOptions;
  const jobSkillOptions = useMemo(() => skillNamesForSelect(jobSkills), [jobSkills]);
  const projectSkillOptions = useMemo(() => skillNamesForSelect(projectSkills), [projectSkills]);
  const serviceSkillOptions = useMemo(() => skillNamesForSelect(serviceSkills), [serviceSkills]);
  const projectLanguageOptions = useMemo(() => languageNamesForSelect(projectLanguages), [projectLanguages]);
  const serviceLanguageOptions = useMemo(() => languageNamesForSelect(serviceLanguages), [serviceLanguages]);
  const [loadingTask, setLoadingTask] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskCategoriesLoaded, setTaskCategoriesLoaded] = useState(false);

  const goBack = useCallback(() => {
    router.push(listHref(tab));
  }, [router, tab]);

  const persistJobSkill = useCallback(async (skillName: string) => {
    const created = await ensureMarketplaceSkill(skillName, 'job');
    if (!created?.name) return null;
    const refreshed = await loadSkills('job');
    setJobSkills(refreshed);
    return created.name;
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPostingContext(null);
      return;
    }

    let cancelled = false;

    void employerService
      .getMyEmployerProfile()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setPostingContext(
            employerPostingContextFromProfile(
              mapEmployerProfileDtoToBusinessProfile(response.data),
            ),
          );
          return;
        }
        setPostingContext(getEmployerPostingContext(user));
      })
      .catch(() => {
        if (!cancelled) setPostingContext(getEmployerPostingContext(user));
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    void loadCategories('task').then((rows) => {
      setCategories(rows);
      setTaskCategoriesLoaded(true);
    });
    void loadAllCategories().then(setJobCategories);
    void loadSkills('job').then(setJobSkills);
    void loadSkills('project').then(setProjectSkills);
    void loadSkills('service').then(setServiceSkills);
    void loadLanguages('project').then(setProjectLanguages);
    void loadLanguages('service').then(setServiceLanguages);
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
        if (tab === 'task' && getListingKind(response.data) !== 'task') {
          toast.error('This listing is not a marketplace task.');
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
        await syncTaskGallery(
          {
            id: response.data.id,
            attachments: response.data.attachments ?? editTask.attachments,
          },
          uploads.keptGalleryUrls,
          uploads.galleryFiles,
          'service',
        );
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
        await uploadTaskFiles(response.data.id, galleryFiles, 'service');
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
      const categoryId = await resolveCategoryId(data.category, jobCategories);
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
      const galleryFiles = uploads.galleryFiles;
      const attachmentFiles = uploads.attachmentFiles;
      const allNewFiles = [...galleryFiles, ...attachmentFiles];

      if (isEdit && editTask?.slug) {
        const response = await projectService.updateProject(editTask.slug, payload);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update project');
        }
        await syncTaskGallery(
          {
            id: response.data.id,
            attachments: response.data.attachments ?? editTask.attachments,
          },
          uploads.keptGalleryUrls,
          galleryFiles,
          'project',
        );
        if (attachmentFiles.length) {
          await uploadTaskFiles(response.data.id, attachmentFiles, 'project');
        }
        toast.success('Project updated');
        router.push(listHref('project'));
        return;
      }

      const response = await projectService.createProject(payload as never);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create project');
      }

      if (allNewFiles.length) {
        await uploadTaskFiles(response.data.id, allNewFiles, 'project');
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

  const handleTaskSubmit = async (data: TaskData) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let payload = buildPostTaskApiPayload(data, data.categoryId);
      payload = await enrichPostTaskPayloadWithGeocode(data, payload);

      if (isEdit && editTask?.slug) {
        const response = await taskService.updateTask(editTask.slug, payload as never);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update task');
        }
        if (data.images.length) {
          await uploadTaskFiles(response.data.id, data.images, 'task');
        }
        toast.success('Task updated');
        router.push(listHref('task'));
        return;
      }

      const response = await taskService.createTask(payload as never);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create task');
      }

      if (data.images.length) {
        await uploadTaskFiles(response.data.id, data.images, 'task');
      }

      const publicSlug = response.data.slug;
      if (publicSlug) {
        toast.success('Task posted', {
          description: `View at /task/${publicSlug}`,
          action: {
            label: 'Open',
            onClick: () => router.push(`/task/${publicSlug}`),
          },
        });
      } else {
        toast.success('Task posted');
      }
      router.push(listHref('task'));
    } catch (error: unknown) {
      const fieldErrors = (error as { errors?: Record<string, string[]> })?.errors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const [firstField] = Object.keys(fieldErrors);
        const firstMsg = fieldErrors[firstField]?.[0] || 'Invalid value';
        toast.error(`${firstField.replace(/_/g, ' ')}: ${firstMsg}`);
      } else {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message: unknown }).message === 'string'
              ? (error as { message: string }).message
              : 'Failed to save task';
        toast.error(message);
      }
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
        skillOptions={serviceSkillOptions}
        languageOptions={serviceLanguageOptions}
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
        categoryOptions={jobCategoryOptions}
        skillOptions={jobSkillOptions}
        onPersistCustomSkill={persistJobSkill}
      />
    );
  }

  if (tab === 'task') {
    return (
      <DashboardCreateTask
        mode={isEdit ? 'edit' : 'create'}
        onBack={goBack}
        onSubmit={handleTaskSubmit}
        postingContext={postingContext}
        initialData={editTask ? taskToSimilarPrefill(editTask) : undefined}
        categories={categories}
        categoriesLoaded={taskCategoriesLoaded}
        isLoading={submitting}
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
      skillOptions={projectSkillOptions}
      languageOptions={projectLanguageOptions}
    />
  );
}
