'use client';

import type { ReactNode } from 'react';
import type { Project } from '@/components/projects/projectListData';
import { resolveEmployerLogoLabel, resolveOwnerAvatarBg } from '@/lib/employerAvatarUtils';

type EmployerAvatarCircleProps = {
  name: string;
  avatarUrl?: string | null;
  avatarBg?: string;
  verified?: boolean;
  sizeClass?: string;
  textClass?: string;
  /** Mock/demo listings use icon glyphs instead of initials */
  useDemoIcon?: boolean;
  iconType?: Project['companyIconType'];
  renderIcon?: (type: Project['companyIconType'], className: string) => ReactNode;
};

export default function EmployerAvatarCircle({
  name,
  avatarUrl,
  avatarBg,
  verified = false,
  sizeClass = 'h-[52px] w-[52px]',
  textClass = 'text-sm font-semibold',
  useDemoIcon = false,
  iconType,
  renderIcon,
}: EmployerAvatarCircleProps) {
  const bg = avatarBg ?? resolveOwnerAvatarBg(name);
  const showDemoIcon = useDemoIcon && !avatarUrl && iconType && renderIcon;

  return (
    <>
      <div
        className={`flex ${sizeClass} items-center justify-center overflow-hidden rounded-full text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] ${bg}`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : showDemoIcon ? (
          renderIcon!(iconType!, 'h-6 w-6 text-white')
        ) : (
          <span className={textClass}>{resolveEmployerLogoLabel(name)}</span>
        )}
      </div>
      {verified ? (
        <div
          className="absolute right-0.5 top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-white bg-[#52C47F] shadow-xs"
          title="Verified Employer"
        />
      ) : null}
    </>
  );
}
