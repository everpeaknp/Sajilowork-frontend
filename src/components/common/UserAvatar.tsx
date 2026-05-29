import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

export default function UserAvatar({
  src,
  alt = 'User',
  name,
  size = 'md',
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
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary shrink-0 relative ${className}`}
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
  );
}
