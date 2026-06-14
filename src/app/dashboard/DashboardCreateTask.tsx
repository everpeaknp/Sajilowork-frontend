'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import PostTaskForm from '@/components/post-task/PostTaskForm';
import type { TaskData } from '@/components/post-task/TitleDateStep';
import { rulesService } from '@/services/rules.service';
import { createPostTaskValidator } from '@/lib/postTaskValidation';
import { consumeSimilarTaskPrefill } from '@/lib/similarTask';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { Category } from '@/types';

const EMPTY_TASK_DATA: TaskData = {
  title: '',
  categoryId: '',
  categoryName: '',
  dateType: '',
  specificDate: '',
  beforeDate: '',
  timeOfDayRequired: false,
  timeSlot: null,
  location: '',
  locationType: 'in-person',
  latitude: undefined,
  longitude: undefined,
  details: '',
  budgetType: 'total',
  budgetAmount: 0,
  images: [],
};

type DashboardCreateTaskProps = {
  mode?: 'create' | 'edit';
  initialData?: Partial<TaskData>;
  postingContext?: EmployerPostingContext | null;
  categories?: Category[];
  categoriesLoaded?: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: TaskData) => void | Promise<void>;
};

export default function DashboardCreateTask({
  mode = 'create',
  initialData,
  postingContext,
  categories = [],
  categoriesLoaded = false,
  isLoading = false,
  onBack,
  onSubmit,
}: DashboardCreateTaskProps) {
  const isEdit = mode === 'edit';
  const searchParams = useSearchParams();
  const [taskData, setTaskData] = useState<TaskData>(() => ({
    ...EMPTY_TASK_DATA,
    ...initialData,
  }));
  const [showErrors, setShowErrors] = useState(false);
  const [budgetLimits, setBudgetLimits] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    setTaskData((prev) => ({
      ...EMPTY_TASK_DATA,
      ...initialData,
      images: initialData?.images ?? prev.images ?? [],
    }));
  }, [initialData]);

  useEffect(() => {
    if (isEdit) return;

    const fromSimilar = searchParams.get('from') === 'similar';
    if (fromSimilar) {
      const prefill = consumeSimilarTaskPrefill();
      if (prefill) {
        setTaskData((prev) => ({
          ...prev,
          ...prefill,
          images: [],
        }));
        return;
      }
    }

    const title = searchParams.get('title')?.trim();
    if (title) {
      setTaskData((prev) => (prev.title ? prev : { ...prev, title }));
    }
  }, [isEdit, searchParams]);

  useEffect(() => {
    if (isEdit || !categoriesLoaded) return;

    const categoryParam = searchParams.get('category')?.trim();
    if (!categoryParam) return;

    setTaskData((prev) => {
      if (prev.categoryId) return prev;
      const match = flattenCategoriesForSelect(categories).find(
        (category) =>
          category.name.toLowerCase() === categoryParam.toLowerCase() ||
          category.id === categoryParam,
      );
      if (!match) {
        return { ...prev, categoryName: categoryParam };
      }
      return {
        ...prev,
        categoryId: match.id,
        categoryName: match.name,
      };
    });
  }, [isEdit, categoriesLoaded, categories, searchParams]);

  useEffect(() => {
    let cancelled = false;
    rulesService
      .getPublicLimits()
      .then((res) => {
        if (cancelled) return;
        const min = res.data?.task_budget?.min;
        const max = res.data?.task_budget?.max;
        if (typeof min === 'number' && typeof max === 'number') {
          setBudgetLimits({ min, max });
        }
      })
      .catch(() => {
        if (!cancelled) setBudgetLimits(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validator = useMemo(() => createPostTaskValidator(budgetLimits), [budgetLimits]);

  const formErrors = useMemo(() => {
    if (!showErrors) return {};
    return validator.validate(taskData).errors;
  }, [showErrors, taskData, validator]);

  const handleSubmit = async () => {
    setShowErrors(true);
    const validation = validator.validate(taskData);
    if (!validation.success) {
      toast.error('Please complete the required fields.');
      return;
    }
    await onSubmit(taskData);
  };

  return (
    <PostTaskForm
      data={taskData}
      updateData={(updates) => setTaskData((prev) => ({ ...prev, ...updates }))}
      categories={categories}
      categoriesLoaded={categoriesLoaded}
      onBack={onBack}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      showErrors={showErrors}
      errors={formErrors}
      postingContext={postingContext}
      minBudget={budgetLimits?.min}
      maxBudget={budgetLimits?.max}
      title={isEdit ? 'Edit Task' : 'Post a Task'}
      description={
        isEdit
          ? 'Update your task details and save changes.'
          : 'Describe what you need done and get quotes from local taskers.'
      }
      backLabel="Back to tasks"
      submitLabel={isEdit ? 'Save Changes' : 'Get quotes'}
      embedded
    />
  );
}
