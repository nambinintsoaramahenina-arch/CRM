"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';
import { ThemeProvider } from './ThemeProvider';
import { AuthGuard } from './AuthGuard';

/** Pages publiques qui ne nécessitent pas de connexion ni le layout CRM */
const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password'];

export const RootLayoutClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  return (
    <ThemeProvider>
      {isPublicPage ? (
        /* Pages publiques (login, forgot-password, etc.) : pas de sidebar/header */
        <>{children}</>
      ) : (
        /* CRM interne : layout complet avec Sidebar + Header + protection de route */
        <AuthGuard>
          <AppLayout>{children}</AppLayout>
        </AuthGuard>
      )}
    </ThemeProvider>
  );
};
