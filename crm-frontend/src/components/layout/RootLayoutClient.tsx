"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';
import { ThemeProvider } from './ThemeProvider';

export const RootLayoutClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      {/* Pages publiques et login : pas de sidebar */}
      {pathname === '/login' || pathname === '/' ? (
        <>{children}</>
      ) : (
        /* CRM interne : layout complet avec Sidebar + Header */
        <AppLayout>{children}</AppLayout>
      )}
    </ThemeProvider>
  );
};
