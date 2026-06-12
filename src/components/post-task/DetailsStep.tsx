"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  postTaskLabel,
  postTaskInputMd,
  postTaskInputError,
  postTaskErrorText,
} from '@/components/post-task/postTaskStyles';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

const postTaskTextareaMd =
  `${postTaskInputMd} min-h-[120px] resize-none py-3 sm:min-h-[140px]`;

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

interface DetailsStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  showErrors?: boolean;
  error?: string;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({ data, updateData, showErrors, error }) => {
  const [isTouched, setIsTouched] = useState(false);
  const showError = (isTouched || showErrors) && !data.details.trim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => {
    return (data.images || []).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [data.images]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onPickImages = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (picked.length === 0) return;

    const next = [...(data.images || [])];
    for (const file of picked) {
      const exists = next.some(
        (x) =>
          x.name === file.name &&
          x.size === file.size &&
          x.lastModified === file.lastModified
      );
      if (!exists) next.push(file);
    }
    updateData({ images: next });
  };

  const removeImage = (name: string) => {
    updateData({ images: (data.images || []).filter((f) => f.name !== name) });
  };

  return (
    <div className="w-full">
      <h1 className={`${landingHeadline} mb-1 text-xl leading-tight text-[#000d45] sm:text-2xl`}>
        Provide more details
      </h1>
      <p className="mb-4 font-body text-xs text-[#6a719a] sm:mb-5 sm:text-sm">
        Help taskers understand the job so they can send accurate quotes.
      </p>

      <div className="w-full max-w-md space-y-4 sm:max-w-lg sm:space-y-5">
        <div>
          <label className={`${postTaskLabel} mb-2 block`}>What are the details?</label>
          <textarea
            className={`${postTaskTextareaMd} ${showError ? postTaskInputError : ''}`}
            placeholder="Write a summary of the key details — what's involved, any tools needed, access instructions, etc."
            value={data.details}
            onBlur={() => setIsTouched(true)}
            onChange={(e) => updateData({ details: e.target.value })}
          />
          {showError && (
            <p className={postTaskErrorText}>{error || 'This field is required'}</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <h3 className={postTaskLabel}>Add images</h3>
            <span className="font-body text-xs font-medium text-[#8a96b0]">(optional)</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickImages(e.target.files)}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-20 w-20 items-center justify-center rounded-xl bg-gray-50 transition-all hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                <Plus className="h-4 w-4 stroke-[3]" />
              </div>
            </button>

            {previews.map((p) => (
              <div
                key={p.url}
                className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-50"
              >
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(p.name)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm hover:bg-white"
                  aria-label={`Remove ${p.name}`}
                >
                  <X className="h-4 w-4 text-[#6a719a]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
