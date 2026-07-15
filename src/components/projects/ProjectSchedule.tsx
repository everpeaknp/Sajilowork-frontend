'use client';

import { Calendar as CalendarIcon, CloudMoon, Sun, Sunrise, Sunset } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectScheduleInfo } from './projectListData';

const TIME_SLOTS = [
  { id: 'morning' as const, icon: Sunrise, label: 'Morning', sub: 'Before 10am' },
  { id: 'midday' as const, icon: Sun, label: 'Midday', sub: '10am – 2pm' },
  { id: 'afternoon' as const, icon: Sunset, label: 'Afternoon', sub: '2pm – 6pm' },
  { id: 'evening' as const, icon: CloudMoon, label: 'Evening', sub: 'After 6pm' },
];

function formatScheduleDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

interface ProjectScheduleProps {
  schedule: ProjectScheduleInfo;
}

export default function ProjectSchedule({ schedule }: ProjectScheduleProps) {
  if (!schedule.dateType) return null;

  const hasSpecificDate = schedule.specificDate !== '';
  const hasBeforeDate = schedule.beforeDate !== '';
  const isFlexible = schedule.dateType === 'flexible';

  const chipClass = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 rounded-none border px-3 py-2 text-xs font-medium sm:text-sm',
      active
        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-neutral-900'
        : 'border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
    );

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="mb-4 text-base font-normal tracking-tight text-black sm:text-lg dark:text-stone-100">
        When do you need this done?
      </h2>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className={chipClass(hasSpecificDate)}>
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            {hasSpecificDate
              ? `On ${formatScheduleDate(schedule.specificDate)}`
              : 'On date'}
          </span>
          <span className={chipClass(hasBeforeDate)}>
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            {hasBeforeDate
              ? `Before ${formatScheduleDate(schedule.beforeDate)}`
              : 'Before date'}
          </span>
          <span className={chipClass(isFlexible)}>I&apos;m flexible</span>
        </div>

        {schedule.timeOfDayRequired ? (
          <div className="space-y-3">
            <p className="text-sm font-normal text-neutral-800 dark:text-stone-200">I need a certain time of day</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
              {TIME_SLOTS.map((slot) => {
                const Icon = slot.icon;
                const isActive = schedule.timeSlot === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border px-2 py-2 sm:py-2.5',
                      isActive
                        ? 'border-neutral-900 bg-neutral-50 text-neutral-900 shadow-sm dark:border-stone-100 dark:bg-neutral-800 dark:text-stone-100 dark:shadow-none'
                        : 'border-neutral-200 bg-white text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mb-1 h-4 w-4 sm:h-5 sm:w-5',
                        isActive ? 'text-neutral-900 dark:text-stone-100' : 'text-neutral-300 dark:text-neutral-600',
                      )}
                    />
                    <span className="text-[11px] font-semibold sm:text-xs">{slot.label}</span>
                    <span className="text-[9px] opacity-70 sm:text-[10px]">{slot.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
