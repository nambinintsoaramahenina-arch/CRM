import axios from 'axios';

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
 * Récupère l'historique complet et réel des activités depuis PostgreSQL via Axios.
 * Envoie le token JWT dans les en-têtes (Authorization: Bearer ...).
 * Inclut un paramètre _t (timestamp) et des en-têtes anti-cache pour garantir
 * un affichage immédiat des dernières insertions sans vider le cache du navigateur.
 *
 * @param token Jeton d'authentification JWT (ou extrait automatiquement du localStorage)
 * @param utilisateurId (Optionnel) Filtre par ID utilisateur
 * @returns Liste ordonnée par date décroissante
 */
export async function fetchActivityLogs(token?: string, utilisateurId?: number): Promise<ActivityLog[]> {
  const jwt = token || (typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null);

  if (!jwt) {
    throw new Error("Token d'authentification manquant ('crm-token'). Veuillez vous reconnecter.");
  }

  try {
    const response = await axios.get<ActivityLog[]>(`${API_URL}/historique`, {
      params: {
        ...(utilisateurId ? { utilisateurId } : {}),
        _t: Date.now(), // Cache-busting : force la lecture directe PostgreSQL
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    return response.data;
  } catch (error: any) {
    // Si /api/historique renvoie 404, tentative de secours sur /api/activity-logs
    if (error.response?.status === 404) {
      const fallbackRes = await axios.get<ActivityLog[]>(`${API_URL}/activity-logs`, {
        params: {
          ...(utilisateurId ? { utilisateurId } : {}),
          _t: Date.now(),
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      return fallbackRes.data;
    }

    const message = error.response?.data?.message || error.message || "Erreur de récupération de l'historique";
    throw new Error(message);
  }
}
