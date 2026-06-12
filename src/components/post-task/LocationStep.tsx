
"use client";
import React from 'react';
import LocationFields from '@/components/post-task/LocationFields';
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

interface LocationStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  showErrors?: boolean;
  errors?: Partial<Record<'location', string>>;
}

export const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, showErrors, errors }) => {
  return (
    <div className="w-full">
      <h1 className={`${landingHeadline} mb-1 text-xl leading-tight text-[#000d45] sm:text-2xl`}>
        Tell us where
      </h1>
      <p className="mb-4 font-body text-xs text-[#6a719a] sm:mb-5 sm:text-sm">
        Choose whether the tasker needs to be on-site or can work remotely.
      </p>

      <div className="w-full max-w-md sm:max-w-lg">
        <LocationFields
          variant="post-task"
          data={{
            location: data.location,
            locationType: data.locationType,
            latitude: data.latitude,
            longitude: data.longitude,
          }}
          onChange={updateData}
          showErrors={showErrors}
          locationError={errors?.location}
        />
      </div>
    </div>
  );
};
