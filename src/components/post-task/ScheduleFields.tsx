'use client';

import { useState } from 'react';
import { Sun, Sunrise, Sunset, CloudMoon, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  postTaskLabel,
  postTaskChipActive,
  postTaskChipInactive,
  postTaskErrorTextSm,
} from '@/components/post-task/postTaskStyles';
import { deriveScheduleDateType, hasScheduleSelection } from '@/lib/scheduleUtils';

export type ScheduleDateType = 'specific' | 'before' | 'both' | 'flexible' | '';
export type ScheduleTimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | null;

export type ScheduleFieldsData = {
  dateType: ScheduleDateType;
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: ScheduleTimeSlot;
};

type ScheduleFieldsProps = {
  data: ScheduleFieldsData;
  onChange: (updates: Partial<ScheduleFieldsData>) => void;
  variant?: 'post-task' | 'dashboard';
  showErrors?: boolean;
  dateError?: string;
  timeSlotError?: string;
};

const TIME_SLOTS = [
  { id: 'morning' as const, icon: Sunrise, label: 'Morning', sub: 'Before 10am' },
  { id: 'midday' as const, icon: Sun, label: 'Midday', sub: '10am – 2pm' },
  { id: 'afternoon' as const, icon: Sunset, label: 'Afternoon', sub: '2pm – 6pm' },
  { id: 'evening' as const, icon: CloudMoon, label: 'Evening', sub: 'After 6pm' },
];

function formatDate(dateString: string) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export default function ScheduleFields({
  data,
  onChange,
  variant = 'post-task',
  showErrors,
  dateError,
  timeSlotError,
}: ScheduleFieldsProps) {
  const [showCalendar, setShowCalendar] = useState<'specific' | 'before' | null>(null);
  const isDashboard = variant === 'dashboard';

  const labelClass = isDashboard
    ? 'mb-2 block text-sm font-normal text-neutral-800'
    : `${postTaskLabel} mb-1.5 block`;

  const chipClass = (active: boolean) =>
    isDashboard
      ? cn(
          'flex cursor-pointer items-center gap-1.5 rounded-none border px-3 py-2 text-xs font-medium transition-all sm:text-sm',
          active
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400',
        )
      : cn(
          'flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-all sm:text-[13px]',
          active ? postTaskChipActive : postTaskChipInactive,
        );

  const handleDateSelect = (date: Date, type: 'specific' | 'before') => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const nextSpecific = type === 'specific' ? dateString : data.specificDate;
    const nextBefore = type === 'before' ? dateString : data.beforeDate;

    onChange({
      ...(type === 'specific' ? { specificDate: dateString } : { beforeDate: dateString }),
      dateType: deriveScheduleDateType(nextSpecific, nextBefore, false),
    });

    setTimeout(() => setShowCalendar(null), 300);
  };

  const handleDateTypeClick = (type: 'specific' | 'before') => {
    setShowCalendar(showCalendar === type ? null : type);
  };

  const hasSpecificDate = data.specificDate !== '';
  const hasBeforeDate = data.beforeDate !== '';

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>When do you need this done?</label>
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDateTypeClick('specific')}
            className={chipClass(hasSpecificDate)}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{hasSpecificDate ? `On ${formatDate(data.specificDate)}` : 'On date'}</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 transition-transform',
                showCalendar === 'specific' && 'rotate-180',
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => handleDateTypeClick('before')}
            className={chipClass(hasBeforeDate)}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{hasBeforeDate ? `Before ${formatDate(data.beforeDate)}` : 'Before date'}</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 transition-transform',
                showCalendar === 'before' && 'rotate-180',
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({
                dateType: 'flexible',
                specificDate: '',
                beforeDate: '',
                timeOfDayRequired: data.timeOfDayRequired,
              });
              setShowCalendar(null);
            }}
            className={chipClass(data.dateType === 'flexible')}
          >
            I&apos;m flexible
          </button>
        </div>

        {showCalendar ? (
          <div className="mt-1.5 w-fit animate-in fade-in slide-in-from-top-2 duration-200">
            <Calendar
              selected={
                showCalendar === 'specific'
                  ? data.specificDate
                    ? (() => {
                        const [year, month, day] = data.specificDate.split('-').map(Number);
                        return new Date(year, month - 1, day);
                      })()
                    : undefined
                  : data.beforeDate
                    ? (() => {
                        const [year, month, day] = data.beforeDate.split('-').map(Number);
                        return new Date(year, month - 1, day);
                      })()
                    : undefined
              }
              onSelect={(date) => handleDateSelect(date, showCalendar)}
              minDate={new Date()}
              showMonthYearPickers={false}
              className={cn('mx-0 border shadow-none', isDashboard ? 'border-neutral-200' : 'border-black')}
            />
          </div>
        ) : null}
        {dateError && showErrors ? (
          <p className={isDashboard ? 'mt-1 text-xs text-red-500' : postTaskErrorTextSm}>{dateError}</p>
        ) : null}
      </div>

      {hasScheduleSelection(data.dateType, data.specificDate, data.beforeDate) ? (
        <div className="space-y-3">
          <label className="group flex cursor-pointer items-center gap-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className={cn(
                  'peer h-4 w-4 cursor-pointer appearance-none rounded transition-all checked:bg-primary',
                  isDashboard ? 'border border-neutral-300 bg-white checked:border-neutral-900 checked:bg-neutral-900' : 'bg-gray-100',
                )}
                checked={data.timeOfDayRequired}
                onChange={(e) => onChange({ timeOfDayRequired: e.target.checked })}
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span
              className={
                isDashboard
                  ? 'text-sm font-normal text-neutral-800'
                  : `${postTaskLabel} font-medium`
              }
            >
              I need a certain time of day
            </span>
          </label>

          {data.timeOfDayRequired ? (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
              {TIME_SLOTS.map((slot) => {
                const Icon = slot.icon;
                const isActive = data.timeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onChange({ timeSlot: slot.id })}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl px-2 py-2 transition-all sm:py-2.5',
                      isDashboard
                        ? isActive
                          ? 'border border-neutral-900 bg-neutral-50 text-neutral-900 shadow-sm'
                          : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        : isActive
                          ? 'bg-[#eef4ff] text-primary shadow-sm'
                          : 'bg-gray-50 text-[#6a719a] hover:bg-gray-100',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mb-1 h-4 w-4 sm:h-5 sm:w-5',
                        isActive
                          ? isDashboard
                            ? 'text-neutral-900'
                            : 'text-primary'
                          : isDashboard
                            ? 'text-neutral-400'
                            : 'text-[#8a96b0]',
                      )}
                    />
                    <span className="text-[11px] font-semibold sm:text-xs">{slot.label}</span>
                    <span className="text-[9px] opacity-70 sm:text-[10px]">{slot.sub}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
          {timeSlotError && showErrors ? (
            <p className={isDashboard ? 'text-xs text-red-500' : postTaskErrorTextSm}>{timeSlotError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
