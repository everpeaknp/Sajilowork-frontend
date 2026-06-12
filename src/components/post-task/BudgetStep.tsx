"use client";
import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  formatNPR,
} from '@/lib/nepalLocale';
import {
  postTaskStepTitle,
  postTaskStepSubtitle,
  postTaskLabel,
  postTaskInput,
  postTaskInputError,
  postTaskErrorText,
} from '@/components/post-task/postTaskStyles';

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
  details: string;
  budgetType: 'total' | 'hourly';
  budgetAmount: number;
  images: File[];
}

export type BudgetStepPropsV2 = {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  showErrors?: boolean;
  error?: string;
  minBudget?: number;
  maxBudget?: number;
};

export const BudgetStep: React.FC<BudgetStepPropsV2> = ({
  data,
  updateData,
  showErrors,
  error,
  minBudget,
  maxBudget,
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const budget = data.budgetAmount;
  const min = typeof minBudget === 'number' ? minBudget : BUDGET_MIN_NPR;
  const max = typeof maxBudget === 'number' ? maxBudget : BUDGET_MAX_NPR;
  const isInvalid = (isTouched || showErrors) && (budget < min || budget > max);

  return (
    <div className="w-full">
      <h1 className={`${postTaskStepTitle} mb-2`}>Suggest your budget</h1>
      <p className={`${postTaskStepSubtitle} mb-6 sm:mb-8`}>
        Set a starting point — taskers can negotiate from here.
      </p>

      <div className="space-y-4 lg:max-w-md">
        <div>
          <h3 className={`${postTaskLabel} mb-1`}>What is your budget?</h3>
          <p className={`${postTaskStepSubtitle} mb-4 text-sm`}>
            Between {formatNPR(min)} and {formatNPR(max)}
          </p>

          <div className="relative">
            <div
              className={`flex items-center rounded-2xl transition-all ${
                isInvalid ? postTaskInputError : 'bg-gray-50 focus-within:bg-gray-100'
              }`}
            >
              <div className="pl-5 pr-1">
                <Banknote
                  className={`h-5 w-5 ${isInvalid ? 'text-red-500' : 'text-[#8a96b0]'}`}
                />
              </div>
              <input
                type="number"
                className={`${postTaskInput} border-0 bg-transparent py-4 pl-2 pr-5 font-formula text-xl font-bold shadow-none focus:ring-0 sm:py-5 sm:text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                placeholder="Enter amount"
                value={data.budgetAmount || ''}
                onBlur={() => setIsTouched(true)}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => updateData({ budgetAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          {isInvalid && (
            <p className={postTaskErrorText}>
              {error || `The price must be between ${formatNPR(min)} and ${formatNPR(max)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
