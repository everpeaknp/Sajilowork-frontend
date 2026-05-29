/***
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';
import { useEffect, useState } from 'react';
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
import { formatTimeSlotRequirement } from '@/lib/timeSlot';
import { consumeSimilarTaskPrefill } from '@/lib/similarTask';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';

 
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
      dateType: z.enum(['specific', 'before', 'flexible'], {
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

      // Add due date if specified
      if (taskData.dateType === 'specific' && taskData.specificDate) {
        const [year, month, day] = taskData.specificDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        apiTaskData.due_date = date.toISOString();
      } else if (taskData.dateType === 'before' && taskData.beforeDate) {
        const [year, month, day] = taskData.beforeDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        apiTaskData.due_date = date.toISOString();
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/40 sm:static sm:z-auto sm:min-h-screen sm:items-center sm:justify-start sm:bg-[#eef1f6] md:py-8 lg:py-10"
      style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="flex h-full min-h-0 w-full flex-col sm:h-auto sm:min-h-[min(640px,calc(100dvh-4rem))] sm:max-h-none sm:px-4 md:px-6 lg:mx-auto lg:max-w-6xl lg:px-8 xl:max-w-7xl">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white sm:min-h-[min(640px,calc(100dvh-4rem))] sm:rounded-3xl sm:shadow-2xl lg:min-h-[min(720px,calc(100dvh-5rem))]">
          <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/60 bg-white px-4 sm:h-16 sm:px-6 md:h-20 md:px-8 lg:px-10">
            <div className="text-xl font-black leading-none tracking-tighter text-[#0066ff] select-none sm:text-[26px] md:text-[28px]">
              tasknepal
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/discover';
              }}
              className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="h-6 w-6 stroke-[2.5]" />
            </button>
          </header>

          <MobileStepProgress activeStep={activeStep} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <Sidebar activeStep={activeStep} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-8 md:px-10 lg:px-12 lg:py-10 xl:px-14">
                <div className="mx-auto w-full max-w-2xl pb-4 lg:max-w-3xl xl:max-w-[42rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>

              <footer className="z-20 shrink-0 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-5 md:px-10 lg:px-12 lg:shadow-none xl:px-14">
                <div className="mx-auto flex w-full max-w-lg justify-center gap-3 sm:max-w-xl sm:gap-4 lg:mx-0 lg:max-w-3xl lg:justify-end xl:max-w-[42rem]">
                  {currentStepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="min-h-12 flex-1 rounded-full bg-blue-50 px-4 py-3.5 text-sm font-bold text-[#0066ff] transition-all active:scale-[0.98] hover:bg-blue-100 sm:min-h-[52px] sm:max-w-[200px] sm:text-base lg:flex-none lg:px-10"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed || isLoading}
                    className={`min-h-12 sm:min-h-[52px] ${currentStepIndex > 0 ? 'flex-[1.5] lg:flex-none lg:min-w-[220px]' : 'w-full lg:min-w-[280px]'} ${
                      !canProceed || isLoading
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : 'bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/25 hover:bg-[#0052cc]'
                    } flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold transition-all active:scale-[0.98] sm:text-base`}
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
    </div>
  );
}