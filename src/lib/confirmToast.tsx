'use client';

import { confirmDialog } from '@/components/common/ConfirmDialog';

export function confirmDeleteTask(): Promise<boolean> {
  return confirmDialog({
    message: 'Are you sure you want to delete this task? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmVariant: 'destructive',
  });
}

export function confirmCancelTask(): Promise<boolean> {
  return confirmDialog({
    message:
      'Cancel this task? Taskers will be notified and any active assignment will end.',
    confirmLabel: 'Cancel task',
    cancelLabel: 'Keep task',
    confirmVariant: 'destructive',
  });
}
