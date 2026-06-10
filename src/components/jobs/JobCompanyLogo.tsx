import type { Job } from './jobListData';

interface JobCompanyLogoProps {
  type: Job['companyIconType'];
  className?: string;
}

export default function JobCompanyLogo({ type, className = 'h-6 w-6 text-white' }: JobCompanyLogoProps) {
  if (type === 'wave') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M2 10s3-3 5-3 5 3 7 3 5-3 7-3M2 17s3-3 5-3 5 3 7 3 5-3 7-3" />
      </svg>
    );
  }
  if (type === 'face') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1.5" fill="currentColor" />
        <circle cx="16" cy="9" r="1.5" fill="currentColor" />
        <path d="M8.5 14.5c1.5 2 4.5 2 6 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'in') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22v-3M9 19c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3zM15 19c1.5 0 3-1.5 3-3s-1.5-3-3-3-3 1.5-3 3 1.5 3 3 3zM12 2v3M9 5C7.5 5 6 6.5 6 8s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zM15 5c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z" />
    </svg>
  );
}
