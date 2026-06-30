'use client';

import { memo } from 'react';
import { ProjectCardSkeleton, type ProjectCardSkeletonProps } from './ProjectCardSkeleton';

export type TaskCardSkeletonProps = ProjectCardSkeletonProps;

/** Task browse rows share the same layout as project list cards. */
export const TaskCardSkeleton = memo(function TaskCardSkeleton(props: TaskCardSkeletonProps) {
  return <ProjectCardSkeleton {...props} />;
});
