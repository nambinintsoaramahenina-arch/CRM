const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PasswordRequest {
  id: number;
  userId: number;
  nomComplet: string;
  email: string;
  login: string;
  role: string;
  statut: 'PENDING' | 'APPROVED' | 'REJECTED';
  dateDemande: string;       // ISO 8601
  dateTraitement?: string;   // ISO 8601, null si encore PENDING
  commentaireAdmin?: string;
}

export interface PasswordRequestCount {
  count: number;
}

// ─── API Publique (sans token) ────────────────────────────────────────────────

/**
 * Soumet une demande de réinitialisation de mot de passe.
 * L'identifiant peut être un e-mail ou un matricule.
 * POST /api/auth/forgot-password
 */
export async function submitForgotPassword(identifiant: string): Promise<{
  status: number;
  message: string;
  alreadyPending?: boolean;
}> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identifiant.trim() }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      "Une erreur est survenue. Veuillez réessayer ou contacter l'administrateur.";
    throw new Error(msg);
  }

  return data;
}

// ─── API Admin (avec token JWT) ───────────────────────────────────────────────

/**
 * Récupère toutes les demandes de réinitialisation (PENDING + APPROVED + REJECTED).
 * GET /api/admin/password-requests
 */
export async function fetchAllPasswordRequests(token: string): Promise<PasswordRequest[]> {
  const res = await fetch(`${API_URL}/admin/password-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
  return res.json();
}

/**
 * Récupère uniquement les demandes PENDING.
 * GET /api/admin/password-requests/pending
 */
export async function fetchPendingPasswordRequests(token: string): Promise<PasswordRequest[]> {
  const res = await fetch(`${API_URL}/admin/password-requests/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
  return res.json();
}

/**
 * Retourne le nombre de demandes PENDING (pour badge dashboard).
 * GET /api/admin/password-requests/count
 */
export async function fetchPendingCount(token: string): Promise<number> {
  const res = await fetch(`${API_URL}/admin/password-requests/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return 0;
  const data: PasswordRequestCount = await res.json();
  return data.count ?? 0;
}

/**
 * Approuve une demande : génère un mot de passe temporaire (ou applique celui saisi) et l'envoie par e-mail.
 * POST /api/admin/password-requests/{id}/approve
 */
export async function approvePasswordRequest(
  token: string,
  requestId: number,
  commentaire?: string,
  nouveauMdp?: string
): Promise<{ status: number; message: string; userEmail: string; temporaryPassword?: string; resetToken?: string; resetLink?: string }> {
  const res = await fetch(`${API_URL}/admin/password-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commentaire: commentaire ?? 'Approuvé par l\'administrateur',
      nouveauMdp: nouveauMdp && nouveauMdp.trim().length > 0 ? nouveauMdp.trim() : undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Erreur HTTP ${res.status}`);
  return data;
}

/**
 * Réinitialise directement le mot de passe d'un utilisateur par son ID (Étape 3).
 * POST /api/admin/users/{userId}/reset-password
 */
export async function resetUserPasswordDirectly(
  token: string,
  userId: number,
  commentaire?: string,
  nouveauMdp?: string
): Promise<{ status: number; message: string; userEmail: string; temporaryPassword?: string; resetToken?: string; resetLink?: string }> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commentaire: commentaire ?? 'Réinitialisé par l\'administrateur',
      nouveauMdp: nouveauMdp && nouveauMdp.trim().length > 0 ? nouveauMdp.trim() : undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Erreur HTTP ${res.status}`);
  return data;
}

/**
 * Rejette une demande PENDING sans envoyer de mot de passe.
 * POST /api/admin/password-requests/{id}/reject
 */
export async function rejectPasswordRequest(
  token: string,
  requestId: number,
  commentaire?: string
): Promise<{ status: number; message: string }> {
  const res = await fetch(`${API_URL}/admin/password-requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commentaire: commentaire ?? 'Rejeté par l\'administrateur' }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Erreur HTTP ${res.status}`);
  return data;
}
