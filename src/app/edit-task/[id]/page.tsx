/***
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar, STEPS, StepId } from '@/components/post-task/Sidebar';
import { TitleDateStep, TaskData } from '@/components/post-task/TitleDateStep';
import { LocationStep } from '@/components/post-task/LocationStep';
import { DetailsStep } from '@/components/post-task/DetailsStep';
import { BudgetStep } from '@/components/post-task/BudgetStep';
import { useTaskStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  BUDGET_VALIDATION_MESSAGE,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  formatTaskLocation,
} from '@/lib/nepalLocale';
import { formatTimeSlotRequirement } from '@/lib/timeSlot';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { isAuthenticated } = useAuth();
  const { updateTask, isLoading, fetchCategories, categories, categoriesLoaded } =
    useTaskStore();
  
  const [activeStep, setActiveStep] = useState<StepId>('title-date');
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [taskData, setTaskData] = useState<TaskData>({
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
    details: '',
    budgetType: 'total',
    budgetAmount: 0,
    images: [],
  });

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Load existing task data
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      
      try {
        setIsLoadingTask(true);
        // Use getTaskBySlug since backend uses lookup_field='slug'
        const response = await taskService.getTaskBySlug(taskId);
        const task = response.data;

        // Parse due date
        let dateType: '' | 'flexible' | 'specific' | 'before' = '';
        let specificDate = '';
        let beforeDate = '';
        
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          const formattedDate = dueDate.toISOString().split('T')[0];
          dateType = 'specific';
          specificDate = formattedDate;
        }

        // Parse location type
        const locationType = task.location_type === 'remote' || task.work_type === 'remote' 
          ? 'remote' 
          : 'in-person';

        const categoryId =
          typeof task.category === 'object' && task.category?.id
            ? String(task.category.id)
            : '';
        const categoryName =
          typeof task.category === 'object' && task.category?.name
            ? task.category.name
            : task.category_name || '';

        setTaskData({
          title: task.title || '',
          categoryId,
          categoryName,
          dateType,
          specificDate,
          beforeDate,
          timeOfDayRequired: false,
          timeSlot: null,
          location:
            locationType === 'remote'
              ? 'Remote'
              : formatTaskLocation(task, task.address || task.city || ''),
          locationType,
          details: task.description || '',
          budgetType: task.budget_type === 'hourly' ? 'hourly' : 'total',
          budgetAmount: task.budget_amount || 0,
          images: Array.isArray((task as any)?.images) ? (task as any).images : [],
        });
      } catch (error: any) {
        console.error('Failed to load task:', error);
        toast.error('Failed to load task details');
        router.push('/my-tasks');
      } finally {
        setIsLoadingTask(false);
      }
    };

    loadTask();
  }, [taskId, router]);

  const updateTaskData = (updates: Partial<TaskData>) => {
    setTaskData((prev) => ({ ...prev, ...updates }));
  };

  const getErrorMessage = (error: any, fallback = 'Failed to update task') => {
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
    const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
    if (currentIndex < STEPS.length - 1) {
      setActiveStep(STEPS[currentIndex + 1].id);
    } else {
      // Submit task update
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Please sign in to edit tasks');
      router.push('/signin?redirect=/my-tasks');
      return;
    }

    // Validate required fields
    if (!taskData.title.trim()) {
      toast.error('Please enter a task title');
      setActiveStep('title-date');
      return;
    }

    if (!taskData.categoryId) {
      toast.error('Please select a category');
      setActiveStep('title-date');
      return;
    }

    if (!taskData.dateType) {
      toast.error('Please select when you need this done');
      setActiveStep('title-date');
      return;
    }

    // Only validate location for in-person tasks
    if (taskData.locationType === 'in-person' && !taskData.location.trim()) {
      toast.error('Please enter a location');
      setActiveStep('location');
      return;
    }

    if (!taskData.details.trim()) {
      toast.error('Please provide task details');
      setActiveStep('details');
      return;
    }

    if (taskData.budgetAmount < BUDGET_MIN_NPR || taskData.budgetAmount > BUDGET_MAX_NPR) {
      toast.error(BUDGET_VALIDATION_MESSAGE);
      setActiveStep('budget');
      return;
    }

    try {
      // Prepare task data for API
      const apiTaskData: any = {
        title: taskData.title,
        description: taskData.details,
        budget_amount: taskData.budgetAmount,
        budget_currency: DEFAULT_CURRENCY,
        budget_type: taskData.budgetType === 'total' ? 'fixed' : 'hourly',
        location_type: taskData.locationType === 'in-person' ? 'physical' : 'remote',
        work_type: taskData.locationType === 'in-person' ? 'in_person' : 'remote',
        category: taskData.categoryId,
      };

      // Add location data for in-person tasks
      if (taskData.locationType === 'in-person') {
        const rawLocation = taskData.location.trim();
        apiTaskData.address = rawLocation;
        const cityCandidate = rawLocation.includes(',')
          ? rawLocation.split(',').map((s) => s.trim()).filter(Boolean).slice(-1)[0] || rawLocation
          : rawLocation;
        apiTaskData.city = cityCandidate.slice(0, 100);
        apiTaskData.country = DEFAULT_COUNTRY;
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

      await updateTask(taskId, apiTaskData);
      
      toast.success('Task updated successfully!');
      router.push('/my-tasks');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Failed to update task');
      toast.error(errorMessage);
      console.error('Task update error:', errorMessage, error);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(STEPS[currentIndex - 1].id);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 'title-date':
        return (
          <TitleDateStep
            data={taskData}
            updateData={updateTaskData}
            categories={categories}
            categoriesLoaded={categoriesLoaded}
          />
        );
      case 'location':
        return <LocationStep data={taskData} updateData={updateTaskData} />;
      case 'details':
        return <DetailsStep data={taskData} updateData={updateTaskData} />;
      case 'budget':
        return <BudgetStep data={taskData} updateData={updateTaskData} />;
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep);
  const isBudgetValid =
    taskData.budgetAmount >= BUDGET_MIN_NPR && taskData.budgetAmount <= BUDGET_MAX_NPR;
  const isBudgetStep = activeStep === 'budget';

  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-semibold">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center" style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' }}>
      {/* Header Container */}
      <header className="w-full max-w-7xl h-24 flex items-center justify-between px-8 md:px-16 sticky top-0 bg-white z-20">
        <div className="flex items-center">
          <div className="text-[#0066ff] font-black text-[28px] tracking-tighter leading-none select-none">
            tasknepal
          </div>
        </div>
        <button 
          onClick={() => {
            if (currentStepIndex > 0) {
              handleBack();
            } else {
              // Navigate back to my tasks
              router.push('/my-tasks');
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-800"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-7xl flex flex-1 px-8 md:px-16">
        {/* Left Sidebar */}
        <Sidebar activeStep={activeStep} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pt-16 pl-20 pb-40">
          <div className="w-full max-w-2xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#000d45] mb-2">Edit Task</h1>
              <p className="text-on-surface-variant">Update your task details</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Navigation - Locked to width of main content area if possible, or centered */}
      <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent z-10">
        <div className="flex justify-center gap-4 w-full max-w-lg">
          {currentStepIndex > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-[#0066ff] font-bold py-4 px-8 rounded-full transition-all active:scale-95"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={(isBudgetStep && !isBudgetValid) || isLoading}
            className={`${currentStepIndex > 0 ? 'flex-[1.5]' : 'w-full'} ${
              (isBudgetStep && !isBudgetValid) || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-xl shadow-[#0066ff]/25'
            } font-bold py-4 px-8 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              isBudgetStep ? 'Update task' : 'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
