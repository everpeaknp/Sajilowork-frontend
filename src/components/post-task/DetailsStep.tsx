
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface TaskData {
  title: string;
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
    <div className="max-w-2xl text-[#0a1452]">
      <h1 className="text-4xl font-bold mb-12 uppercase tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        Provide more details
      </h1>

      <div className="space-y-10">
        <div>
          <label className="block text-[15px] font-bold mb-4">What are the details?</label>
          <textarea
            className={`w-full bg-white border-2 rounded-2xl p-5 text-lg placeholder:text-gray-400 outline-none min-h-[160px] resize-none transition-all ${
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
              className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-gray-200 flex items-center justify-center transition-all group"
            >
              <div className="w-10 h-10 rounded-full border-2 border-[#0066ff] flex items-center justify-center text-[#0066ff] group-hover:bg-[#0066ff] group-hover:text-white transition-all">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
            </button>

            {previews.map((p) => (
              <div
                key={p.url}
                className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50"
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
