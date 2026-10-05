/**
 * interactionService.ts
 * ---------------------
 * Service d'accès à l'API REST Spring Boot pour les interactions CRM.
 * Base URL : http://localhost:8080/api/interactions
 *
 * Tous les endpoints nécessitent un token JWT dans l'en-tête Authorization.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Enum TypeInteraction — doit correspondre exactement au backend ─────────────

export type TypeInteraction =
  | 'APPEL'
  | 'EMAIL'
  | 'REUNION'
  | 'RENDEZ_VOUS'
  | 'MESSAGE'
  | 'AUTRE';

// ─── Labels & couleurs UI pour chaque type ──────────────────────────────────────

export const TYPE_INTERACTION_CONFIG: Record<
  TypeInteraction,
  { label: string; color: string; bg: string; dot: string }
> = {
  APPEL:       { label: 'Appel',    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500'    },
  EMAIL:       { label: 'Email',    color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500'  },
  REUNION:     { label: 'Réunion',  color: 'text-cyan-700',   bg: 'bg-cyan-50 border-cyan-200',     dot: 'bg-cyan-500'    },
  RENDEZ_VOUS: { label: 'RDV',      color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500'  },
  MESSAGE:     { label: 'Message',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500'   },
  AUTRE:       { label: 'Autre',    color: 'text-slate-700',  bg: 'bg-slate-100 border-slate-200',  dot: 'bg-slate-400'   },
};

// ─── DTO de réponse — miroir de InteractionResponseDTO.java ────────────────────

export interface InteractionResponseDTO {
  id: number;
  type: TypeInteraction;
  /** ISO 8601 — ex: "2026-08-25T14:30:00" */
  date: string;
  objet?: string;
  description?: string;
  resultat?: string;
  prochaineAction?: string;
  // Contact
  contactId: number;
  contactNomComplet: string;
  contactEntreprise?: string;
  // Utilisateur responsable
  utilisateurId: number;
  utilisateurNomComplet: string;
  utilisateurLogin: string;
  // Audit
  dateCreation?: string;
  dateModification?: string;
}

// ─── DTO de requête — miroir de InteractionRequestDTO.java ────────────────────

export interface InteractionRequestDTO {
  type: TypeInteraction;
  /** ISO 8601 datetime — ex: "2026-08-25T14:30:00" */
  date: string;
  objet?: string;
  description?: string;
  resultat?: string;
  prochaineAction?: string;
  /** ID du contact concerné (obligatoire) */
  contactId: number;
}

// ─── Utilitaire : en-têtes communs ────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Analyse la réponse d'erreur et extrait un message lisible.
 * Tente d'abord le JSON (champ `message` ou `errors`), puis le texte brut.
 */
async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const json = await response.json();
    return json.message || (json.errors ? JSON.stringify(json.errors) : fallback);
  } catch {
    try {
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

// ─── GET /api/interactions ────────────────────────────────────────────────────
/**
 * Récupère la liste complète de toutes les interactions.
 * @throws {Error & { status: number }} si la requête échoue (401 → token expiré)
 */
export async function fetchInteractions(token: string): Promise<InteractionResponseDTO[]> {
  const response = await fetch(`${API_URL}/interactions`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response, 'Erreur lors de la récupération des interactions');
    throw Object.assign(new Error(msg), { status: response.status });
  }

  return response.json();
}

// ─── GET /api/interactions/:id ────────────────────────────────────────────────

export async function fetchInteractionById(
  token: string,
  id: number
): Promise<InteractionResponseDTO> {
  const response = await fetch(`${API_URL}/interactions/${id}`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response, `Interaction #${id} introuvable`);
    throw Object.assign(new Error(msg), { status: response.status });
  }

  return response.json();
}

// ─── POST /api/interactions ───────────────────────────────────────────────────
/**
 * Crée une nouvelle interaction.
 * L'utilisateur responsable est déduit par le backend depuis le JWT.
 */
export async function createInteraction(
  token: string,
  data: InteractionRequestDTO
): Promise<InteractionResponseDTO> {
  const response = await fetch(`${API_URL}/interactions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response, "Erreur lors de la création de l'interaction");
    throw Object.assign(new Error(msg), { status: response.status });
  }

  return response.json();
}

// ─── PUT /api/interactions/:id ────────────────────────────────────────────────

export async function updateInteraction(
  token: string,
  id: number,
  data: InteractionRequestDTO
): Promise<InteractionResponseDTO> {
  const response = await fetch(`${API_URL}/interactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response, "Erreur lors de la modification de l'interaction");
    throw Object.assign(new Error(msg), { status: response.status });
  }

  return response.json();
}

// ─── DELETE /api/interactions/:id ─────────────────────────────────────────────
/**
 * Supprime une interaction (ADMIN / MANAGER uniquement côté backend).
 */
export async function deleteInteraction(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/interactions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response, "Erreur lors de la suppression de l'interaction");
    throw Object.assign(new Error(msg), { status: response.status });
  }
}

// ─── Helpers de formatage ──────────────────────────────────────────────────────

/** Formate une date ISO en chaîne lisible — ex: "25/08/2026" */
export function formatInteractionDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/** Formate une date ISO avec l'heure — ex: "25/08/2026 à 14h30" */
export function formatInteractionDateTime(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return isoDate;
  }
}

/** Calcule un libellé de temps relatif — ex: "Il y a 2h" */
export function timeAgo(isoDate: string): string {
  try {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `Il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Il y a ${days}j`;
  } catch {
    return '';
  }
}
