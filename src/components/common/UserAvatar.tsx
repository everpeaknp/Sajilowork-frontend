import React from 'react';
import { BadgeCheck, User as UserIcon } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const badgeSizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

const badgeIconSizes = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};

/**
 * Reserve ~50% of badge size on bottom/right so the full circle stays inside
 * the layout box (absolute badges do not expand parents; undersized padding clips).
 */
const verifiedPaddingClasses = {
  xs: 'pb-1 pr-1',
  sm: 'pb-1.5 pr-1.5',
  md: 'pb-2 pr-2',
  lg: 'pb-2.5 pr-2.5',
  xl: 'pb-3 pr-3',
};

export default function UserAvatar({
  src,
  alt = 'User',
  name,
  size = 'md',
  verified = false,
  className = '',
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const imageSrc = src ? getMediaUrl(src) : '';
  const canShowImage = Boolean(imageSrc) && !imageError;

  React.useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  // Cached images may load before onLoad is attached
  React.useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setImageError(false);
    }
  }, [imageSrc]);

  const getInitials = (displayName?: string) => {
    if (!displayName) return '';
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name || alt);

  return (
    <div
      className={`relative inline-flex shrink-0 overflow-visible ${
        verified ? verifiedPaddingClasses[size] : ''
      }`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald ${className}`}
      >
        {canShowImage ? (
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span className="font-bold text-white">{initials}</span>
        ) : (
          <UserIcon className={`${iconSizes[size]} text-white`} />
        )}
      </div>
      {verified ? (
        <span
          className={`absolute bottom-0 right-0 z-10 flex ${badgeSizeClasses[size]} items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-sm`}
          title="Verified tasker"
          aria-label="Verified tasker"
        >
          <BadgeCheck className={`${badgeIconSizes[size]} shrink-0 text-white`} strokeWidth={2.5} />
        </span>
      ) : null}
    </div>
  );
}
