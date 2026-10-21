/**
 * Service d'authentification et de gestion de session SPAT CRM
 * Gère la persistance, validation des tokens JWT et mémorisation des routes actives.
 */

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password'];

/**
 * Récupère le jeton JWT stocké dans localStorage ou sessionStorage.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return (
      localStorage.getItem('crm-token') ||
      localStorage.getItem('jwt_token') ||
      sessionStorage.getItem('crm-token') ||
      sessionStorage.getItem('jwt_token') ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Vérifie si le token fourni est présent et non expiré (si c'est un JWT).
 */
export function isTokenValid(token: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;

  const parts = trimmed.split('.');
  // S'il s'agit d'un JWT (3 parties : header.payload.signature)
  if (parts.length === 3) {
    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // Si le payload contient une date d'expiration (exp en secondes)
      if (payload && typeof payload.exp === 'number') {
        const currentTime = Math.floor(Date.now() / 1000);
        // Si le jeton est expiré, il est invalide
        if (payload.exp <= currentTime) {
          return false;
        }
      }
      return true;
    } catch {
      // Si le décodage échoue mais que le token est non vide, on le considère valide
      return true;
    }
  }

  // Token simple non-JWT mais non-vide
  return true;
}

/**
 * Indique si un utilisateur est actuellement authentifié avec un token valide.
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return isTokenValid(token);
}

/**
 * Sauvegarde la dernière route interne active (ex: /dashboard, /tasks, /contacts, /users)
 * pour pouvoir y rediriger l'utilisateur s'il tente d'accéder à /login.
 */
export function saveLastActiveRoute(pathname: string): void {
  if (typeof window === 'undefined') return;
  if (!pathname || typeof pathname !== 'string') return;

  const isPublic = PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (!isPublic) {
    try {
      sessionStorage.setItem('crm-last-active-path', pathname);
    } catch {
      // Ignorer les erreurs de quota ou accès storage
    }
  }
}

/**
 * Récupère la dernière route active valide, ou bascule par défaut sur '/dashboard'.
 */
export function getLastActiveRoute(): string {
  if (typeof window === 'undefined') return '/dashboard';

  try {
    const saved = sessionStorage.getItem('crm-last-active-path');
    if (saved && saved.startsWith('/')) {
      const isPublic = PUBLIC_ROUTES.some(
        (p) => saved === p || saved.startsWith(p + '/')
      );
      if (!isPublic) {
        return saved;
      }
    }
  } catch {
    // ignore
  }

  return '/dashboard';
}

/**
 * Supprime tous les jetons et identifiants de session (déconnexion complète).
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('crm-token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('crm-user');
    localStorage.removeItem('crm-role');
    localStorage.removeItem('crm-name');
    sessionStorage.removeItem('crm-token');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('crm-last-active-path');
  } catch {
    // ignore
  }
}
