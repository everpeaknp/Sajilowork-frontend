"use client";
import React, { useState } from 'react';
import { Sun, Sunrise, Sunset, CloudMoon, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export interface TaskData {
  title: string;
  dateType: 'specific' | 'before' | 'flexible' | '';
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
  showErrors?: boolean;
  errors?: Partial<Record<'title' | 'dateType' | 'specificDate' | 'beforeDate' | 'timeSlot', string>>;
}

export const TitleDateStep: React.FC<TitleDateStepProps> = ({ data, updateData, showErrors, errors }) => {
  const [showCalendar, setShowCalendar] = useState<'specific' | 'before' | null>(null);
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const titleError = errors?.title && (showErrors || isTitleTouched) ? errors.title : null;
  const dateError = errors?.dateType && showErrors ? errors.dateType : null;
  const timeSlotError = errors?.timeSlot && showErrors ? errors.timeSlot : null;

  const handleDateSelect = (date: Date, type: 'specific' | 'before') => {
    // Format date as YYYY-MM-DD in local timezone to avoid timezone offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    if (type === 'specific') {
      updateData({ specificDate: dateString, dateType: 'specific' });
    } else {
      updateData({ beforeDate: dateString, dateType: 'before' });
    }
    
    // Close calendar after selection
    setTimeout(() => setShowCalendar(null), 300);
  };

  const handleDateTypeClick = (type: 'specific' | 'before') => {
    // Toggle calendar visibility for the clicked type
    setShowCalendar(showCalendar === type ? null : type);
  };

  const hasSpecificDate = data.specificDate !== '';
  const hasBeforeDate = data.beforeDate !== '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold mb-12 uppercase tracking-tight text-gray-900" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        Let's start with the basics
      </h1>

      <div className="space-y-10">
        {/* Title Input */}
        <div>
          <label className="block text-[15px] font-bold text-gray-800 mb-4">In a few words, what do you need done?</label>
          <input
            type="text"
            className={`w-full bg-gray-50 rounded-2xl p-5 text-lg placeholder:text-gray-400 outline-none transition-all shadow-sm ${
              titleError ? 'ring-2 ring-[#ff4d00]' : 'focus:ring-2 focus:ring-[#0066ff]'
            }`}
            placeholder="e.g. Help move my sofa"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            onBlur={() => setIsTitleTouched(true)}
          />
          {titleError && (
            <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">{titleError}</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-[15px] font-bold text-gray-800 mb-4">When do you need this done?</label>
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Specific Date Button */}
            <button
              type="button"
              onClick={() => handleDateTypeClick('specific')}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all cursor-pointer ${
                hasSpecificDate
                  ? 'bg-blue-950 border-blue-950 text-white shadow-lg shadow-blue-950/20'
                  : 'bg-white border-gray-200 text-blue-950 hover:bg-blue-950 hover:border-blue-950 hover:text-white hover:shadow-lg hover:shadow-blue-950/20'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[15px] font-bold">
                {hasSpecificDate
                  ? `On ${formatDate(data.specificDate)}` 
                  : 'On date'
                }
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCalendar === 'specific' ? 'rotate-180' : ''}`} />
            </button>

            {/* Before Date Button */}
            <button
              type="button"
              onClick={() => handleDateTypeClick('before')}
              className={`flex items-center gap-2 px-7 py-3 rounded-full border-2 transition-all cursor-pointer ${
                hasBeforeDate
                  ? 'bg-blue-950 border-blue-950 text-white shadow-lg shadow-blue-950/20'
                  : 'bg-white border-gray-200 text-blue-950 hover:bg-blue-950 hover:border-blue-950 hover:text-white hover:shadow-lg hover:shadow-blue-950/20'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[15px] font-bold">
                {hasBeforeDate
                  ? `Before ${formatDate(data.beforeDate)}` 
                  : 'Before date'
                }
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCalendar === 'before' ? 'rotate-180' : ''}`} />
            </button>

            {/* Flexible Option */}
            <button
              onClick={() => {
                updateData({ dateType: 'flexible' });
                setShowCalendar(null);
              }}
              className={`px-7 py-3 rounded-full border-2 transition-all ${
                data.dateType === 'flexible'
                  ? 'bg-blue-950 border-blue-950 text-white shadow-lg shadow-blue-950/20'
                  : 'bg-white border-gray-200 text-blue-950 hover:bg-blue-950 hover:border-blue-950 hover:text-white hover:shadow-lg hover:shadow-blue-950/20'
              }`}
            >
              <span className="text-[15px] font-bold">I'm flexible</span>
            </button>
          </div>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <Calendar
                selected={showCalendar === 'specific' 
                  ? (data.specificDate ? (() => {
                      const [year, month, day] = data.specificDate.split('-').map(Number);
                      return new Date(year, month - 1, day);
                    })() : undefined)
                  : (data.beforeDate ? (() => {
                      const [year, month, day] = data.beforeDate.split('-').map(Number);
                      return new Date(year, month - 1, day);
                    })() : undefined)
                }
                onSelect={(date) => handleDateSelect(date, showCalendar)}
                minDate={new Date()}
                showMonthYearPickers={false}
                className="mx-0"
              />
            </div>
          )}
          {dateError && (
            <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">{dateError}</p>
          )}
        </div>

        {/* Time of Day - Show after a date mode is selected (including flexible) */}
        {data.dateType !== '' && (
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-[#0066ff] transition-all checked:bg-[#0066ff]"
                  checked={data.timeOfDayRequired}
                  onChange={(e) => updateData({ timeOfDayRequired: e.target.checked })}
                />
                <svg
                  className="absolute h-4 w-4 opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[15px] font-bold text-gray-800">I need a certain time of day</span>
            </label>

            {data.timeOfDayRequired && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'morning', icon: Sunrise, label: 'Morning', sub: 'Before 10am' },
                  { id: 'midday', icon: Sun, label: 'Midday', sub: '10am - 2pm' },
                  { id: 'afternoon', icon: Sunset, label: 'Afternoon', sub: '2pm - 6pm' },
                  { id: 'evening', icon: CloudMoon, label: 'Evening', sub: 'After 6pm' },
                ].map((slot) => {
                  const Icon = slot.icon;
                  const isActive = data.timeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => updateData({ timeSlot: slot.id as any })}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'bg-blue-50 border-[#0066ff] text-[#0066ff] shadow-sm'
                          : 'bg-gray-50 border-transparent hover:border-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className={`w-7 h-7 mb-3 ${isActive ? 'text-[#0066ff]' : 'text-gray-400'}`} />
                      <span className="text-[15px] font-bold mb-1">{slot.label}</span>
                      <span className="text-[11px] font-medium opacity-70">{slot.sub}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {timeSlotError && (
              <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">{timeSlotError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
