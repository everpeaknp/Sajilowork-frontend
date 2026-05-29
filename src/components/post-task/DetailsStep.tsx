
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

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
      // avoid duplicates by (name,size,lastModified)
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
    <div className="w-full text-[#0a1452]">
      <h1
        className="mb-6 text-2xl font-bold uppercase tracking-tight sm:mb-8 sm:text-3xl lg:mb-12 lg:text-4xl"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Provide more details
      </h1>

      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div>
          <label className="block text-[15px] font-bold mb-4">What are the details?</label>
          <textarea
            className={`min-h-[140px] w-full resize-none rounded-2xl border-2 bg-white p-4 text-base placeholder:text-gray-400 outline-none transition-all sm:min-h-[160px] sm:p-5 sm:text-lg lg:min-h-[200px] ${
              showError 
                ? 'border-[#ff4d00] focus:ring-0' 
                : 'border-blue-100 focus:border-[#0066ff] focus:ring-0'
            }`}
            placeholder="Write a summary of the key details"
            value={data.details}
            onBlur={() => setIsTouched(true)}
            onChange={(e) => updateData({ details: e.target.value })}
          />
          {showError && (
            <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">
              {error || 'This field is required'}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-6">
            <h3 className="text-[15px] font-bold">Add images</h3>
            <span className="text-[15px] font-medium text-gray-400">(optional)</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickImages(e.target.files)}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-transparent bg-gray-50 transition-all group hover:border-gray-200 sm:h-32 sm:w-32"
            >
              <div className="w-10 h-10 rounded-full border-2 border-[#0066ff] flex items-center justify-center text-[#0066ff] group-hover:bg-[#0066ff] group-hover:text-white transition-all">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
            </button>

            {previews.map((p) => (
              <div
                key={p.url}
                className="relative h-24 w-24 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:h-32 sm:w-32"
              >
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(p.name)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white border border-gray-200 flex items-center justify-center"
                  aria-label={`Remove ${p.name}`}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
