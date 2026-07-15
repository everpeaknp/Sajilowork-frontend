'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ClipboardList, ImageIcon, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import FormAccordionSection from '@/app/dashboard/FormAccordionSection';
import { SearchableSelectField } from '@/app/dashboard/listingFormFields';
import ScheduleFields from '@/components/post-task/ScheduleFields';
import LocationFields from '@/components/post-task/LocationFields';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import {
  dashboardErrorClass,
  dashboardFieldClass,
  dashboardLabelClass,
} from '@/lib/dashboardFormStyles';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  CURRENCY_INPUT_PREFIX,
  formatNPR,
} from '@/lib/nepalLocale';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import type { Category } from '@/types';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { TaskData } from '@/components/post-task/TitleDateStep';

type TaskGalleryItem = {
  id: string;
  preview: string;
  name: string;
  file: File;
};

function isImageUploadFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

function galleryItemId(file: File): string {
  return `task-img-${file.name}-${file.size}-${file.lastModified}`;
}

function filesToGalleryItems(files: File[]): TaskGalleryItem[] {
  return files.map((file) => ({
    id: galleryItemId(file),
    preview: URL.createObjectURL(file),
    name: file.name,
    file,
  }));
}

export type PostTaskFormErrors = Partial<
  Record<
    | 'title'
    | 'categoryId'
    | 'dateType'
    | 'specificDate'
    | 'beforeDate'
    | 'timeSlot'
    | 'location'
    | 'details'
    | 'budgetAmount',
    string
  >
>;

type PostTaskFormProps = {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  categories: Category[];
  categoriesLoaded: boolean;
  categoryOptions?: string[];
  onPersistCustomCategory?: (categoryName: string) => Promise<string | null>;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
  showErrors?: boolean;
  errors?: PostTaskFormErrors;
  postingContext?: EmployerPostingContext | null;
  minBudget?: number;
  maxBudget?: number;
  title?: string;
  description?: string;
  backLabel?: string;
  submitLabel?: string;
  /** When true, breaks out of dashboard shell padding (same as other dashboard create forms). */
  embedded?: boolean;
};

export default function PostTaskForm({
  data,
  updateData,
  categories,
  categoriesLoaded,
  categoryOptions = [],
  onPersistCustomCategory,
  onBack,
  onSubmit,
  isLoading = false,
  showErrors = false,
  errors = {},
  postingContext,
  minBudget,
  maxBudget,
  title = 'Post a Task',
  description = 'Describe what you need done and get quotes from local taskers.',
  backLabel = 'Back',
  submitLabel = 'Get quotes',
  embedded = false,
}: PostTaskFormProps) {
  const min = typeof minBudget === 'number' ? minBudget : BUDGET_MIN_NPR;
  const max = typeof maxBudget === 'number' ? maxBudget : BUDGET_MAX_NPR;
  const categoryOptionsFlat = useMemo(
    () => flattenCategoriesForSelect(categories),
    [categories],
  );
  const baseCategoryNames = useMemo(() => {
    if (categoryOptions.length > 0) return categoryOptions;
    return categoryOptionsFlat.map((option) => option.name);
  }, [categoryOptions, categoryOptionsFlat]);
  const categoryNames = useMemo(() => {
    const name = data.categoryName.trim();
    if (name && !baseCategoryNames.some((item) => item.toLowerCase() === name.toLowerCase())) {
      return [name, ...baseCategoryNames];
    }
    return baseCategoryNames;
  }, [baseCategoryNames, data.categoryName]);

  useEffect(() => {
    const name = data.categoryName.trim();
    if (!name || data.categoryId) return;
    const match = categoryOptionsFlat.find(
      (option) => option.name.toLowerCase() === name.toLowerCase(),
    );
    if (match?.id) {
      updateData({ categoryId: match.id });
    }
  }, [categoryOptionsFlat, data.categoryId, data.categoryName]);

  const [openSection, setOpenSection] = useState<string | null>('basic');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryItems, setGalleryItems] = useState<TaskGalleryItem[]>(() =>
    filesToGalleryItems(data.images || []),
  );
  const galleryItemsRef = useRef(galleryItems);
  galleryItemsRef.current = galleryItems;

  useEffect(() => {
    const files = data.images || [];
    setGalleryItems((prev) => {
      if (
        prev.length === files.length &&
        prev.every((item, index) => item.file === files[index])
      ) {
        return prev;
      }
      prev.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
      return filesToGalleryItems(files);
    });
  }, [data.images]);

  useEffect(() => {
    return () => {
      galleryItemsRef.current.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!showErrors) return;
    if (
      errors.title ||
      errors.categoryId ||
      errors.dateType ||
      errors.specificDate ||
      errors.beforeDate ||
      errors.timeSlot ||
      errors.budgetAmount
    ) {
      setOpenSection('basic');
      return;
    }
    if (errors.location || errors.details) {
      setOpenSection('details');
    }
  }, [showErrors, errors]);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    void onSubmit();
  };

  const onGallerySelected = (list: FileList | null) => {
    if (!list?.length) return;

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const allowedExtensions = /\.(jpe?g|png|webp|gif)$/i;

    const validFiles = Array.from(list).filter((file) => {
      const typeOk = file.type ? allowedTypes.has(file.type) : allowedExtensions.test(file.name);
      const extOk = allowedExtensions.test(file.name);
      return (typeOk || extOk) && isImageUploadFile(file);
    });

    if (!validFiles.length) {
      toast.error('Only JPG, PNG, WEBP, and GIF images are allowed.');
      return;
    }

    const existing = new Set((data.images || []).map(galleryItemId));
    const nextItems: TaskGalleryItem[] = [];
    for (const file of validFiles) {
      const id = galleryItemId(file);
      if (existing.has(id)) continue;
      existing.add(id);
      nextItems.push({
        id,
        preview: URL.createObjectURL(file),
        name: file.name,
        file,
      });
    }

    if (!nextItems.length) return;

    const merged = [...galleryItems, ...nextItems];
    setGalleryItems(merged);
    updateData({ images: merged.map((item) => item.file) });
  };

  const removeGalleryItem = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      const next = prev.filter((item) => item.id !== id);
      updateData({ images: next.map((item) => item.file) });
      return next;
    });
  };

  const firstImageIndex = galleryItems.findIndex((item) => Boolean(item.preview));

  const showFieldError = (key: keyof PostTaskFormErrors) =>
    showErrors && errors[key] ? errors[key] : null;

  return (
    <div
      className={
        embedded
          ? 'animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8 lg:-mx-10 lg:-my-10 lg:p-10 dark:bg-neutral-950 dark:text-stone-100'
          : 'min-h-screen select-none bg-[#f0efec] px-4 py-6 font-sans text-black sm:px-6 md:px-8 md:py-8 dark:bg-neutral-950 dark:text-stone-100'
      }
    >
      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-stone-100"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900 dark:text-stone-100">
            {title}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={isLoading}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-none bg-[#222222] px-6 py-4 text-sm font-normal text-white shadow-md transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Posting...
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
          {postingContext ? (
            <EmployerPostingBanner context={postingContext} className="mb-6" />
          ) : null}

          <FormAccordionSection
            title="Basic Information"
            icon={ClipboardList}
            description="Title, category, schedule, and budget"
            isOpen={openSection === 'basic'}
            onToggle={() => toggleSection('basic')}
          >
            <div>
              <label className={dashboardLabelClass}>Task title</label>
              <input
                value={data.title}
                onChange={(event) => updateData({ title: event.target.value })}
                placeholder="e.g. Help move my sofa"
                className={dashboardFieldClass}
              />
              {showFieldError('title') ? (
                <p className={dashboardErrorClass}>{showFieldError('title')}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <SearchableSelectField
                  label="Category"
                  value={data.categoryName}
                  onChange={(categoryName) => {
                    const match = categoryOptionsFlat.find(
                      (option) => option.name.toLowerCase() === categoryName.toLowerCase(),
                    );
                    updateData({
                      categoryName,
                      categoryId: match?.id ?? '',
                    });
                  }}
                  placeholder={categoriesLoaded ? 'Select a category' : 'Loading categories…'}
                  options={categoryNames}
                  searchPlaceholder="Search categories..."
                  emptySearchLabel="No categories match your search."
                  emptyListLabel="No categories available."
                  customSectionTitle="Category not listed? Add it manually (only if it is not in the list above)."
                  customPlaceholder="Type a custom category"
                  allowCustom
                  disabled={!categoriesLoaded}
                  onPersistCustom={onPersistCustomCategory}
                />
                <p className="mt-1.5 text-xs font-normal text-neutral-500">
                  Search the list or add a custom category only when it is not already available.
                </p>
                {showFieldError('categoryId') ? (
                  <p className={dashboardErrorClass}>{showFieldError('categoryId')}</p>
                ) : null}
              </div>

              <div>
                <label className={dashboardLabelClass}>Budget</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    {CURRENCY_INPUT_PREFIX}
                  </span>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={data.budgetAmount || ''}
                    onChange={(event) =>
                      updateData({ budgetAmount: Number(event.target.value) || 0 })
                    }
                    placeholder="0"
                    className={`${dashboardFieldClass} pl-8`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-normal text-neutral-400">
                  Between {formatNPR(min)} and {formatNPR(max)}
                </p>
                {showFieldError('budgetAmount') ? (
                  <p className={dashboardErrorClass}>{showFieldError('budgetAmount')}</p>
                ) : null}
              </div>
            </div>

            <ScheduleFields
              variant="dashboard"
              data={{
                dateType: data.dateType,
                specificDate: data.specificDate,
                beforeDate: data.beforeDate,
                timeOfDayRequired: data.timeOfDayRequired,
                timeSlot: data.timeSlot,
              }}
              onChange={updateData}
              showErrors={showErrors}
              dateError={
                showFieldError('dateType') ||
                showFieldError('specificDate') ||
                showFieldError('beforeDate') ||
                undefined
              }
              timeSlotError={showFieldError('timeSlot') ?? undefined}
            />
          </FormAccordionSection>

          <FormAccordionSection
            title="Task Details"
            icon={MapPin}
            description="Location and description"
            isOpen={openSection === 'details'}
            onToggle={() => toggleSection('details')}
          >
            <LocationFields
              variant="dashboard"
              data={{
                locationType: data.locationType,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
              }}
              onChange={(updates) => {
                updateData({
                  location: updates.location,
                  latitude: updates.latitude,
                  longitude: updates.longitude,
                  ...(updates.locationType === 'remote' || updates.locationType === 'in-person'
                    ? { locationType: updates.locationType }
                    : {}),
                });
              }}
              showErrors={showErrors}
              locationError={showFieldError('location') ?? undefined}
            />

            <div>
              <label className={dashboardLabelClass}>What are the details?</label>
              <textarea
                value={data.details}
                onChange={(event) => updateData({ details: event.target.value })}
                placeholder="Write a summary of the key details — what's involved, any tools needed, access instructions, etc."
                rows={6}
                className={`${dashboardFieldClass} min-h-[140px] resize-y`}
              />
              {showFieldError('details') ? (
                <p className={dashboardErrorClass}>{showFieldError('details')}</p>
              ) : null}
            </div>
          </FormAccordionSection>

          <FormAccordionSection
            title="Attachment"
            icon={ImageIcon}
            description="Upload photos to help taskers understand the job (optional)"
            isOpen={openSection === 'attachments'}
            onToggle={() => toggleSection('attachments')}
          >
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                onGallerySelected(event.target.files);
                event.target.value = '';
              }}
            />
            <div className="flex flex-wrap gap-3">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  {index === firstImageIndex ? (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Main
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(item.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] text-xs font-normal text-neutral-600 transition-colors hover:bg-[#ffede8] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <ImageIcon className="h-5 w-5 text-neutral-400" />
                Upload
              </button>
            </div>
            <p className="max-w-xl text-xs font-normal leading-relaxed text-neutral-500">
              Upload multiple images — the first image is used as the main cover. JPG, PNG, WEBP, or
              GIF — max 10 MB per file.
            </p>
          </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
