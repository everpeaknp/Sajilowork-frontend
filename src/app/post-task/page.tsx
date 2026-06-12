/***
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { MobileStepProgress, Sidebar, STEPS, StepId } from '@/components/post-task/Sidebar';
import { TitleDateStep, TaskData } from '@/components/post-task/TitleDateStep';
import { LocationStep } from '@/components/post-task/LocationStep';
import { DetailsStep } from '@/components/post-task/DetailsStep';
import { BudgetStep } from '@/components/post-task/BudgetStep';
import { useTaskStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import { rulesService } from '@/services/rules.service';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  BUDGET_VALIDATION_MESSAGE,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  withNepalGeocodeQuery,
} from '@/lib/nepalLocale';
import { scheduleToDueDateIso } from '@/lib/scheduleUtils';
import { formatTimeSlotRequirement } from '@/lib/timeSlot';
import { consumeSimilarTaskPrefill } from '@/lib/similarTask';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import {
  POST_TASK_TYPO,
  postTaskBtnPrimary,
  postTaskBtnSecondary,
} from '@/components/post-task/postTaskStyles';
import { PostTaskShell } from '@/components/post-task/PostTaskShell';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import { getEmployerPostingContext } from '@/lib/employerBusinessProfile';

export default function App() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isCustomer, user } = useAuth();
  const { createTask, isLoading, fetchCategories, categories, categoriesLoaded } =
    useTaskStore();
  
  const [activeStep, setActiveStep] = useState<StepId>('title-date');
  const [attemptedNext, setAttemptedNext] = useState<Record<StepId, boolean>>({
    'title-date': false,
    location: false,
    details: false,
    budget: false,
  });
  const [taskData, setTaskData] = useState<TaskData>({
    title: '',
    categoryId: '',
    categoryName: '',
    dateType: '', // No initial selection
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
  });

  const [budgetLimits, setBudgetLimits] = useState<{ min: number; max: number } | null>(null);
  const postingContext = isCustomer ? getEmployerPostingContext(user) : null;

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

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
        } else {
          setBudgetLimits(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBudgetLimits(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
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

    const title = searchParams.get('title');
    if (title && title.trim()) {
      setTaskData((prev) => (prev.title ? prev : { ...prev, title: title.trim() }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!categoriesLoaded) return;
    const categoryParam = searchParams.get('category')?.trim();
    if (!categoryParam) return;

    setTaskData((prev) => {
      if (prev.categoryId) return prev;
      const match = flattenCategoriesForSelect(categories).find(
        (c) =>
          c.name.toLowerCase() === categoryParam.toLowerCase() ||
          c.id === categoryParam
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
  }, [categoriesLoaded, categories, searchParams]);

  const updateTaskData = (updates: Partial<TaskData>) => {
    setTaskData((prev) => ({ ...prev, ...updates }));
  };

  const titleDateSchema = z
    .object({
      title: z
        .string()
        .trim()
        .min(10, 'Must be at least 10 characters'),
      categoryId: z.string().trim().min(1, 'Please select a category'),
      dateType: z.enum(['specific', 'before', 'both', 'flexible'], {
        errorMap: () => ({ message: 'Please select when you need this done' }),
      }),
      specificDate: z.string(),
      beforeDate: z.string(),
      timeOfDayRequired: z.boolean(),
      timeSlot: z.enum(['morning', 'midday', 'afternoon', 'evening']).nullable(),
    })
    .superRefine((value, ctx) => {
      if (value.dateType === 'specific' && !value.specificDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['specificDate'],
          message: 'Please choose a date',
        });
      }
      if (value.dateType === 'before' && !value.beforeDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['beforeDate'],
          message: 'Please choose a date',
        });
      }
      if (value.dateType === 'both') {
        if (!value.specificDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['specificDate'],
            message: 'Please choose an on date',
          });
        }
        if (!value.beforeDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['beforeDate'],
            message: 'Please choose a before date',
          });
        }
      }
      if (value.timeOfDayRequired && !value.timeSlot) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeSlot'],
          message: 'Please select a time of day',
        });
      }
    });

  const locationSchema = z
    .object({
      locationType: z.enum(['in-person', 'remote']),
      location: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.locationType === 'in-person' && !value.location.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['location'],
          message: 'Please enter a location',
        });
      }
    });

  const detailsSchema = z.object({
    details: z
      .string()
      .trim()
      .min(25, 'Must be at least 25 characters'),
  });

  const budgetSchema = z.object({
    budgetAmount: z
      .number({ invalid_type_error: BUDGET_VALIDATION_MESSAGE })
      .min(budgetLimits?.min ?? BUDGET_MIN_NPR, BUDGET_VALIDATION_MESSAGE)
      .max(budgetLimits?.max ?? BUDGET_MAX_NPR, BUDGET_VALIDATION_MESSAGE),
  });

  const getStepErrors = (step: StepId) => {
    const build = (issues: z.ZodIssue[]) => {
      const map: Record<string, string> = {};
      for (const issue of issues) {
        const key = issue.path.join('.') || 'form';
        if (!map[key]) map[key] = issue.message;
      }
      return map;
    };

    if (step === 'title-date') {
      const result = titleDateSchema.safeParse(taskData);
      return result.success ? {} : build(result.error.issues);
    }
    if (step === 'location') {
      const result = locationSchema.safeParse(taskData);
      return result.success ? {} : build(result.error.issues);
    }
    if (step === 'details') {
      const result = detailsSchema.safeParse(taskData);
      return result.success ? {} : build(result.error.issues);
    }
    const result = budgetSchema.safeParse(taskData);
    return result.success ? {} : build(result.error.issues);
  };

  const isStepValid = (step: StepId) => Object.keys(getStepErrors(step)).length === 0;

  const getPostTaskErrorMessage = (error: any, fallback = 'Failed to post task') => {
    const extractString = (candidate: any): string | null => {
      if (!candidate) return null;
      if (typeof candidate === 'string') return candidate.trim() || null;
      if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
      if (typeof candidate === 'object') {
        if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) return candidate.message.trim();
        if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) return candidate.detail.trim();
        if (candidate.message && typeof candidate.message !== 'string') {
          const nested = extractString(candidate.message);
          if (nested) return nested;
        }
        if (candidate.detail && typeof candidate.detail !== 'string') {
          const nested = extractString(candidate.detail);
          if (nested) return nested;
        }
        if (Array.isArray(candidate)) {
          for (const item of candidate) {
            const nested = extractString(item);
            if (nested) return nested;
          }
        }
        for (const key of Object.keys(candidate)) {
          const nested = extractString(candidate[key]);
          if (nested) return nested;
        }
      }
      return null;
    };

    if (!error) return fallback;
    if (typeof error === 'string') return error;
    const fromError = extractString(error);
    if (fromError) return fromError;
    if (typeof error?.toString === 'function') {
      const toStringValue = error.toString();
      if (typeof toStringValue === 'string' && toStringValue.trim().length > 0 && toStringValue !== '[object Object]') {
        return toStringValue;
      }
    }
    return fallback;
  };

  const handleNext = async () => {
    setAttemptedNext((prev) => ({ ...prev, [activeStep]: true }));
    if (!isStepValid(activeStep)) return;
    const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
    if (currentIndex < STEPS.length - 1) {
      setActiveStep(STEPS[currentIndex + 1].id);
    } else {
      // Submit task
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Please sign in to post a task');
      router.push('/signin?redirect=/post-task');
      return;
    }

    // Backend gates POST /api/v1/tasks/ with IsCustomer(). If the user is
    // authenticated as something other than 'customer' (e.g. a tasker
    // account), the backend would respond with a confusing 403 — fail fast
    // with a clear message instead.
    if (user && !isCustomer) {
      toast.error(
        'Only customer accounts can post tasks. Switch to a customer account to continue.'
      );
      return;
    }

    const orderedSteps: StepId[] = ['title-date', 'location', 'details', 'budget'];
    for (const step of orderedSteps) {
      setAttemptedNext((prev) => ({ ...prev, [step]: true }));
      if (!isStepValid(step)) {
        setActiveStep(step);
        return;
      }
    }

    try {
      // Prepare task data for API. Backend constraints:
      //   - title: CharField(max_length=255) — required, non-empty
      //   - description: TextField — required, non-empty
      //   - budget_amount: DecimalField, must be > 0 (TaskCreateSerializer)
      //   - location_type: 'remote' | 'physical'
      //   - work_type:     'remote' | 'in_person' | 'flexible'
      const apiTaskData: any = {
        title: taskData.title.trim().slice(0, 255),
        description: taskData.details.trim(),
        budget_amount: Number(taskData.budgetAmount).toFixed(2),
        budget_currency: DEFAULT_CURRENCY,
        budget_type: taskData.budgetType === 'total' ? 'fixed' : 'hourly',
        location_type: taskData.locationType === 'in-person' ? 'physical' : 'remote',
        work_type: taskData.locationType === 'in-person' ? 'in_person' : 'remote',
        urgency: 'medium',
        is_public: true,
        allow_bids: true,
        tags: [],
      };

      if (taskData.categoryId) {
        apiTaskData.category = taskData.categoryId;
      }

      // Add location data for in-person tasks
      if (taskData.locationType === 'in-person') {
        const rawLocation = taskData.location.trim();
        apiTaskData.address = rawLocation;
        // Backend `city` is CharField(max_length=100). The location box often
        // contains a full address string ("House 12, Kalimati, Kathmandu, Nepal"),
        // so derive a short city-ish value: take the last comma-separated chunk
        // when present, then hard-cap to 100 chars.
        const cityCandidate = rawLocation.includes(',')
          ? rawLocation.split(',').map((s) => s.trim()).filter(Boolean).slice(-1)[0] || rawLocation
          : rawLocation;
        apiTaskData.city = cityCandidate.slice(0, 100);
        apiTaskData.country = DEFAULT_COUNTRY;

        // Backend `latitude` / `longitude` are DecimalField(max_digits=9,
        // decimal_places=6). Browser geolocation and Nominatim both return
        // floats with 7+ decimal places, which DRF rejects with
        // "Ensure that there are no more than 6 decimal places." Always
        // round to 6 dp before sending.
        const toFixed6 = (n: number) => Number(n.toFixed(6));

        // Use stored coordinates if available (from auto-detect)
        if (taskData.latitude && taskData.longitude) {
          apiTaskData.latitude = toFixed6(taskData.latitude);
          apiTaskData.longitude = toFixed6(taskData.longitude);
          console.log('✅ Using stored coordinates:', {
            location: taskData.location,
            lat: apiTaskData.latitude,
            lng: apiTaskData.longitude,
          });
        } else {
          // Geocode the location to get coordinates
          try {
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(withNepalGeocodeQuery(taskData.location))}&limit=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                },
              }
            );

            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData && geocodeData.length > 0) {
                apiTaskData.latitude = toFixed6(parseFloat(geocodeData[0].lat));
                apiTaskData.longitude = toFixed6(parseFloat(geocodeData[0].lon));
                console.log('✅ Geocoded location:', {
                  location: taskData.location,
                  lat: apiTaskData.latitude,
                  lng: apiTaskData.longitude,
                });
              } else {
                console.warn('⚠️ No geocoding results for location:', taskData.location);
              }
            }
          } catch (geocodeError) {
            console.error('❌ Geocoding error:', geocodeError);
            // Continue without coordinates - task will still be created
          }
        }
      }

      const dueDateIso = scheduleToDueDateIso(
        taskData.dateType,
        taskData.specificDate,
        taskData.beforeDate,
      );
      if (dueDateIso) {
        apiTaskData.due_date = dueDateIso;
      }

      // Add time slot as requirement if specified
      if (taskData.timeOfDayRequired && taskData.timeSlot) {
        apiTaskData.requirements = [formatTimeSlotRequirement(taskData.timeSlot)];
      }

      console.log('📤 Sending task data to API:', apiTaskData);
      const createdTask = await createTask(apiTaskData);

      const createdTaskId = String((createdTask as any)?.id || '');
      if (taskData.images?.length && !createdTaskId) {
        toast.warning('Task posted, but images could not be uploaded. Try editing the task to add them.');
      } else if (createdTaskId && taskData.images && taskData.images.length > 0) {
        const images = taskData.images.slice(0, 10); // safety cap
        const uploadResults = await Promise.allSettled(
          images.map((file) => taskService.uploadAttachment(createdTaskId, file))
        );
        const failedCount = uploadResults.filter(
          (r) =>
            r.status === 'rejected' ||
            (r.status === 'fulfilled' && !r.value.success)
        ).length;
        if (failedCount > 0) {
          toast.warning(
            failedCount === images.length
              ? 'Task posted, but images could not be uploaded. Edit the task to add them again.'
              : `Task posted, but ${failedCount} image(s) failed to upload.`
          );
        }
      }

      const target = (createdTask as any)?.slug || (createdTask as any)?.id;
      toast.success('Task posted successfully!');
      if (target) {
        router.push(`/task/${target}`);
      } else {
        router.push('/tasker-dashboard');
      }
    } catch (error: any) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      console.error('❌ Error errors:', error?.errors);
      console.error('❌ Error status:', error?.status);

      // Map specific server validation failures back to the step that owns
      // that field so the user is sent to the right place to fix it.
      const fieldToStep: Record<string, StepId> = {
        title: 'title-date',
        category: 'title-date',
        due_date: 'title-date',
        address: 'location',
        city: 'location',
        state: 'location',
        country: 'location',
        postal_code: 'location',
        location_type: 'location',
        work_type: 'location',
        latitude: 'location',
        longitude: 'location',
        description: 'details',
        requirements: 'details',
        tags: 'details',
        budget_amount: 'budget',
        budget_type: 'budget',
        budget_currency: 'budget',
      };

      const fieldErrors = error?.errors as Record<string, string[]> | undefined;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const [firstField] = Object.keys(fieldErrors);
        const firstMsg = fieldErrors[firstField]?.[0] || 'Invalid value';
        const pretty = firstField.replace(/_/g, ' ');
        toast.error(`${pretty}: ${firstMsg}`);
        const targetStep = fieldToStep[firstField];
        if (targetStep) {
          setActiveStep(targetStep);
        }
        console.error('Task creation field errors:', fieldErrors);
        return;
      }

      const errorMessage = getPostTaskErrorMessage(error, 'Failed to post task');
      const isThrottled = error?.status === 429 || /throttled/i.test(errorMessage);
      if (error?.status === 401) {
        toast.error('Please sign in to post a task');
        router.push('/signin?redirect=/post-task');
      } else if (error?.status === 403) {
        toast.error(
          errorMessage && !/request failed/i.test(errorMessage)
            ? errorMessage
            : 'Only customer accounts can post tasks. Switch to a customer account to continue.'
        );
      } else if (isThrottled) {
        toast.warning('Task creation is rate limited. Please wait and try again later.');
        console.warn('Task creation throttled:', errorMessage, error);
      } else {
        toast.error(errorMessage);
        console.error('Task creation error:', errorMessage, error);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(STEPS[currentIndex - 1].id);
    }
  };

  const renderStep = () => {
    const showErrors = attemptedNext[activeStep];
    const errors = getStepErrors(activeStep);
    switch (activeStep) {
      case 'title-date':
        return (
          <TitleDateStep
            data={taskData}
            updateData={updateTaskData}
            categories={categories}
            categoriesLoaded={categoriesLoaded}
            showErrors={showErrors}
            errors={{
              title: errors.title,
              categoryId: errors.categoryId,
              dateType: errors.dateType,
              specificDate: errors.specificDate,
              beforeDate: errors.beforeDate,
              timeSlot: errors.timeSlot,
            }}
          />
        );
      case 'location':
        return (
          <LocationStep
            data={taskData}
            updateData={updateTaskData}
            showErrors={showErrors}
            errors={{ location: errors.location }}
          />
        );
      case 'details':
        return (
          <DetailsStep
            data={taskData}
            updateData={updateTaskData}
            showErrors={showErrors}
            error={errors.details}
          />
        );
      case 'budget':
        return (
          <BudgetStep
            {...({
              data: taskData,
              updateData: updateTaskData,
              showErrors,
              error: errors.budgetAmount,
              minBudget: budgetLimits?.min,
              maxBudget: budgetLimits?.max,
            } as any)}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);
  const isBudgetStep = activeStep === 'budget';
  const canProceed = isStepValid(activeStep);

  const handleClose = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/discover');
    }
  }, [router]);

  return (
    <PostTaskShell onClose={handleClose}>
      <div
        className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-white ${POST_TASK_TYPO}`}
      >
          <header className="z-20 flex h-14 shrink-0 items-center justify-between bg-white px-4 sm:h-16 sm:px-6 md:h-[4.5rem] md:px-8 lg:px-10 xl:px-12">
            <button
              type="button"
              onClick={handleClose}
              className="font-formula text-xl font-bold leading-none tracking-tight text-primary select-none sm:text-[26px] md:text-[28px]"
            >
              tasknepal
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2.5 text-[#6a719a] transition-all hover:bg-[#eef2fa] hover:text-[#000d45]"
              aria-label="Close"
            >
              <X className="h-5 w-5 stroke-[2.5] sm:h-6 sm:w-6" />
            </button>
          </header>

          <div className="shrink-0 px-5 sm:px-8 md:px-12 lg:hidden lg:px-16 xl:px-20">
            <div className="mx-auto w-full max-w-5xl lg:max-w-6xl">
              <MobileStepProgress activeStep={activeStep} />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
            <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden lg:max-w-6xl lg:flex-row lg:gap-10 xl:gap-12">
              <Sidebar activeStep={activeStep} />

              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch] py-5 sm:py-8 lg:py-10">
                  <div className="w-full pb-4">
                    {postingContext ? (
                      <EmployerPostingBanner context={postingContext} className="mb-5" />
                    ) : null}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        {renderStep()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </main>

                <footer className="z-20 shrink-0 bg-white py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-5">
                  <div className="flex w-full max-w-md gap-3 sm:max-w-lg sm:gap-4">
                  {currentStepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`${postTaskBtnSecondary} flex min-h-12 flex-1 items-center justify-center px-6 py-3.5 text-sm sm:min-h-[52px] sm:text-base`}
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed || isLoading}
                    className={`${postTaskBtnPrimary} flex min-h-12 flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm sm:min-h-[52px] sm:text-base ${
                      currentStepIndex === 0 ? 'w-full' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Posting...
                      </>
                    ) : isBudgetStep ? (
                      'Get quotes'
                    ) : (
                      'Next'
                    )}
                  </button>
                  </div>
                </footer>
              </div>
            </div>
          </div>
      </div>
    </PostTaskShell>
  );
}