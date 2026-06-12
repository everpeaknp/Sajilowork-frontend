"use client";
import React, { useState } from 'react';
import ScheduleFields from '@/components/post-task/ScheduleFields';

import type { Category } from '@/types';
import { CategorySelect } from '@/components/post-task/CategorySelect';
import {
  postTaskLabel,
  postTaskInputMd,
  postTaskInputError,
  postTaskErrorText,
} from '@/components/post-task/postTaskStyles';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

export interface TaskData {
  title: string;
  categoryId: string;
  categoryName: string;
  dateType: 'specific' | 'before' | 'both' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | null;
  location: string;
  locationType: 'in-person' | 'remote';
  latitude?: number;
  longitude?: number;
  details: string;
  budgetType: 'total' | 'hourly';
  budgetAmount: number;
  images: File[];
}

interface TitleDateStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  categories: Category[];
  categoriesLoaded: boolean;
  showErrors?: boolean;
  errors?: Partial<
    Record<
      'title' | 'categoryId' | 'dateType' | 'specificDate' | 'beforeDate' | 'timeSlot',
      string
    >
  >;
}

export const TitleDateStep: React.FC<TitleDateStepProps> = ({
  data,
  updateData,
  categories,
  categoriesLoaded,
  showErrors,
  errors,
}) => {
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const titleError = errors?.title && (showErrors || isTitleTouched) ? errors.title : null;
  const categoryError = errors?.categoryId && showErrors ? errors.categoryId : null;
  const dateError = errors?.dateType && showErrors ? errors.dateType : null;
  const timeSlotError = errors?.timeSlot && showErrors ? errors.timeSlot : null;

  return (
    <div className="w-full">
      <h1 className={`${landingHeadline} mb-1 text-xl text-[#000d45] leading-tight sm:text-2xl`}>
        Let's start with the basics
      </h1>
      <p className="mb-4 font-body text-xs text-[#6a719a] sm:mb-5 sm:text-sm">
        Tell us what you need and when you'd like it done.
      </p>

      <div className="space-y-4 sm:space-y-5">
        <div className="w-full max-w-md space-y-4 sm:max-w-lg sm:space-y-5">
          <CategorySelect
            categories={categories}
            categoriesLoaded={categoriesLoaded}
            value={data.categoryId}
            onChange={(categoryId, categoryName) =>
              updateData({ categoryId, categoryName })
            }
            showError={showErrors}
            error={categoryError ?? undefined}
          />

          <div className="w-full">
            <label className={`${postTaskLabel} mb-2 block`}>
              In a few words, what do you need done?
            </label>
            <input
              type="text"
              className={`${postTaskInputMd} w-full ${titleError ? postTaskInputError : ''}`}
              placeholder="e.g. Help move my sofa"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              onBlur={() => setIsTitleTouched(true)}
            />
            {titleError && <p className={postTaskErrorText}>{titleError}</p>}
          </div>
        </div>

        <ScheduleFields
          variant="post-task"
          data={{
            dateType: data.dateType,
            specificDate: data.specificDate,
            beforeDate: data.beforeDate,
            timeOfDayRequired: data.timeOfDayRequired,
            timeSlot: data.timeSlot,
          }}
          onChange={updateData}
          showErrors={showErrors}
          dateError={dateError ?? undefined}
          timeSlotError={timeSlotError ?? undefined}
        />
      </div>
    </div>
  );
};
