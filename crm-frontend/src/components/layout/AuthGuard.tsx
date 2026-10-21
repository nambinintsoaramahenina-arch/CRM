"use client";

import React, { useEffect, useState } from 'react';
import {
  getStoredToken,
  isTokenValid,
  clearAuthSession,
  saveLastActiveRoute,
} from '@/services/authService';

/**
 * AuthGuard — Protection des routes protégées du CRM.
 *
 * - Vérifie la présence d'un token JWT valide (non expiré)
 * - Mémorise la dernière page interne active pour la redirection depuis /login
 * - Permet la navigation libre et normale avec les boutons "Retour" / "Suivant"
 *   entre toutes les pages internes du CRM (/dashboard, /tasks, /contacts, /users, etc.)
 * - Si le token est absent ou expiré, redirige immédiatement vers /login
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifySession = (): boolean => {
      const token = getStoredToken();
      if (!token || !isTokenValid(token)) {
        clearAuthSession();
        setIsAuthenticated(false);
        window.location.href = '/login';
        return false;
      }

      // Mémorise la route active courante
      if (typeof window !== 'undefined' && window.location.pathname) {
        saveLastActiveRoute(window.location.pathname);
      }
      return true;
    };

    // --- Vérification initiale ---
    if (!verifySession()) {
      return;
    }
    setIsAuthenticated(true);

    // --- Vérification sur navigation arrière/avant (popstate) ---
    // Permet la libre navigation entre pages CRM sans interférer,
    // tout en mettant à jour la dernière route active
    const handlePopState = () => {
      verifySession();
    };

    // --- Vérification quand l'onglet redevient visible ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifySession();
      }
    };

    // --- Vérification sur focus de fenêtre ---
    const handleFocus = () => {
      verifySession();
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Pendant la vérification, afficher un loader discret
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-page)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Vérification de la session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
