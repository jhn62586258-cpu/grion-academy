'use client';

import { AppProvider } from '@/lib/AppContext';
import Shell from '@/components/Shell';

export default function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
