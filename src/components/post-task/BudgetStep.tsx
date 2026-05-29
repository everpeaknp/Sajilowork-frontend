"use client";
import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  formatNPR,
} from '@/lib/nepalLocale';

export interface TaskData {
  title: string;
  categoryId: string;
  categoryName: string;
  dateType: 'specific' | 'before' | 'flexible' | '';
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

export const BudgetStep: React.FC<BudgetStepPropsV2> = ({ data, updateData, showErrors, error, minBudget, maxBudget }) => {
  const [isTouched, setIsTouched] = useState(false);
  const budget = data.budgetAmount;
  const min = typeof minBudget === 'number' ? minBudget : BUDGET_MIN_NPR;
  const max = typeof maxBudget === 'number' ? maxBudget : BUDGET_MAX_NPR;
  const isInvalid = (isTouched || showErrors) && (budget < min || budget > max);

  return (
    <div className="w-full text-[#0a1452]">
      <h1
        className="mb-6 text-2xl font-bold uppercase tracking-tight sm:mb-8 sm:text-3xl lg:mb-12 lg:text-4xl"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Suggest your budget
      </h1>

      <div className="space-y-6 lg:max-w-xl">
        <div>
          <h3 className="text-[15px] font-bold mb-1">What is your budget?</h3>
          <p className="text-[15px] font-medium text-gray-400 mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            You can always negotiate the final price.
          </p>

          <div className="relative group lg:max-w-md">
            <div
              className={`flex items-center w-full bg-gray-50 border-2 rounded-2xl transition-all ${
                isInvalid 
                  ? 'border-[#ff4d00] ring-1 ring-[#ff4d00]' 
                  : 'border-transparent focus-within:border-[#0066ff] focus-within:ring-1 focus-within:ring-[#0066ff]'
              }`}
            >
              <div className="pl-6 pr-2">
                <Banknote className={`w-5 h-5 ${isInvalid ? 'text-[#ff4d00]' : 'text-gray-400'}`} />
              </div>
              <input
                type="number"
                className="w-full border-none bg-transparent px-2 py-4 text-lg font-bold text-[#0a1452] outline-none placeholder:text-gray-300 [appearance:textfield] focus:ring-0 sm:py-5 sm:text-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="Enter budget"
                value={data.budgetAmount || ''}
                onBlur={() => setIsTouched(true)}
                onChange={(e) => updateData({ budgetAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          {isInvalid && (
            <p className="mt-3 text-[14px] font-bold text-[#ff4d00]">
              {error || `The price must be between ${formatNPR(min)} and ${formatNPR(max)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
