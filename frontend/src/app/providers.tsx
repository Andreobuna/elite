'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from '@/components/ThemeToggle';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgb(var(--color-panel) / 0.96)',
            color: 'rgb(var(--color-text))',
            border: '1px solid rgb(var(--color-accent) / 0.24)',
          },
          success: { iconTheme: { primary: 'rgb(var(--color-accent))', secondary: 'rgb(var(--color-ink))' } },
        }}
      />
      <ThemeToggle className="fixed bottom-5 right-5 z-[60] shadow-gold-lg" />
    </QueryClientProvider>
  );
}
