'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/providers/ThemeProvider';

export default function ThemeAwareToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      richColors
      theme={theme}
      style={{ zIndex: 12000 }}
      toastOptions={{
        style: { zIndex: 12000 },
      }}
    />
  );
}
