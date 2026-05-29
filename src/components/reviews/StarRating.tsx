'use client';

import { Star } from 'lucide-react';

export type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASS: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
};

export default function StarRating({
  value,
  onChange,
  disabled = false,
  size = 'md',
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="focus:outline-none disabled:cursor-not-allowed"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star
              className={`${SIZE_CLASS[size]} ${
                active ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-semibold text-gray-600">
        {value ? `${value}/5` : '—'}
      </span>
    </div>
  );
}

