const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ActivityUser {
  id: number;
  nomComplet?: string;
  email?: string;
  login?: string;
  role?: string;
  telephone?: string;
}

export interface ActivityLog {
  id: number;
  utilisateur?: ActivityUser;
  action: string;
  entiteConcernee?: string;
  identifiantEntite?: number;
  date: string; // ISO LocalDateTime
  adresseIp?: string;
  details?: string;
}

/**
 * Récupère l'historique complet et réel des activités depuis PostgreSQL via l'endpoint /api/historique.
 *
 * @param token Jeton d'authentification JWT
 * @param utilisateurId (Optionnel) Filtre par ID utilisateur
 * @returns Liste ordonnée par date décroissante
 */
export async function fetchActivityLogs(token: string, utilisateurId?: number): Promise<ActivityLog[]> {
  const url = new URL(`${API_URL}/historique`);
  if (utilisateurId) {
    url.searchParams.append('utilisateurId', String(utilisateurId));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    // Tentative de fallback sur /activity-logs si /historique renvoie 404
    if (res.status === 404) {
      const fallbackUrl = new URL(`${API_URL}/activity-logs`);
      if (utilisateurId) fallbackUrl.searchParams.append('utilisateurId', String(utilisateurId));
      const fallbackRes = await fetch(fallbackUrl.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (fallbackRes.ok) {
        return fallbackRes.json();
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.message || `Erreur ${res.status}: Impossible de récupérer le journal d'activité`);
  }

  return res.json();
}
