const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Interface Tâche alignée sur le DTO Spring Boot ────────────────────────────

export interface Task {
  id: number;
  titre: string;
  description?: string;
  date?: string;            // ISO 8601 (champ backend Spring Boot DTO)
  dateTache?: string;       // Alias compatibilité frontend
  typeTache?: string;       // ex: 'APPEL', 'EMAIL', 'REUNION', 'RENDEZ_VOUS', 'SUIVI', 'RELANCE', 'AUTRE'
  statut?: string;          // 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'
  utilisateurId?: number;
  utilisateurNomComplet?: string;
  utilisateurLogin?: string;
  utilisateur?: { id: number; nomComplet: string; login: string };
  contactId?: number;
  contactNomComplet?: string;
  contactEntreprise?: string;
  contact?: { id: number; nomComplet: string; entreprise?: string };
  interactionId?: number;
  interactionObjet?: string;
  interaction?: { id: number; sujet?: string };
  dateCreation?: string;    // ISO 8601
  dateModification?: string;
}

export interface TaskFormData {
  titre: string;
  description: string;
  dateTache: string;
  typeTache: string;
  statut: string;
  utilisateurId: string;
  contactId: string;
  interactionId: string;
}

// ─── Options pour les sélecteurs ───────────────────────────────────────────────

export interface UserOption {
  id: number;
  nomComplet: string;
  login: string;
  role: string;
}

export interface ContactOption {
  id: number;
  nomComplet: string;
  entreprise?: string;
}

export interface InteractionOption {
  id: number;
  type: string;
  date: string;
  contactId?: number;
}

// ─── Formatage ergonomique des labels des sélecteurs ──────────────────────────

/**
 * Règle 3 : Formatage du sélecteur "Utilisateur assigné"
 * - Pour les utilisateurs ayant le rôle "USER" : Afficher uniquement leur nom
 *   (enlever le login entre parenthèses) et remplacer "USER" par "AGENT" (ex: "Nom Prénom (Agent)").
 * - Pour les utilisateurs ayant le rôle "ADMIN" : Ne pas afficher le nom ni le login, afficher uniquement "ADMIN".
 * - Conserver l'enregistrement de l'ID réel de l'utilisateur (user.id) en arrière-plan.
 */
export function formatUserOptionLabel(user: UserOption): string {
  const role = (user.role || '').toUpperCase();
  if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
    return 'ADMIN';
  }
  if (role === 'USER' || role === 'ROLE_USER') {
    return `${user.nomComplet || user.login} (Agent)`;
  }
  if (role === 'MANAGER' || role === 'ROLE_MANAGER') {
    return `${user.nomComplet || user.login} (Manager)`;
  }
  return `${user.nomComplet || user.login} (${user.role})`;
}

/**
 * Règle 2 : Formatage du sélecteur d'interactions (lié au contact)
 * - Ne pas afficher l'objet de l'interaction.
 * - Afficher uniquement le type d'interaction et la date (format : "Type — JJ/MM/AAAA", ex: "Appel — 25/08/2026").
 * - Conserver l'enregistrement de l'ID réel de l'interaction en arrière-plan.
 */
export function formatInteractionOptionLabel(type?: string, dateIso?: string): string {
  const TYPE_MAP: Record<string, string> = {
    APPEL: 'Appel',
    EMAIL: 'Email',
    REUNION: 'Réunion',
    RENDEZ_VOUS: 'Rendez-vous',
    MESSAGE: 'Message',
    VISITE: 'Visite',
    SUIVI: 'Suivi',
    RELANCE: 'Relance',
    AUTRE: 'Autre',
  };
  const rawType = (type || 'AUTRE').toUpperCase();
  const typeLabel = TYPE_MAP[rawType] || (rawType.charAt(0) + rawType.slice(1).toLowerCase());

  let formattedDate = '—';
  if (dateIso) {
    try {
      const d = new Date(dateIso);
      if (!isNaN(d.getTime())) {
        const jj = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const aaaa = d.getFullYear();
        formattedDate = `${jj}/${mm}/${aaaa}`;
      } else {
        formattedDate = dateIso;
      }
    } catch {
      formattedDate = dateIso;
    }
  }

  return `${typeLabel} — ${formattedDate}`;
}

// ─── Statistiques calculées côté frontend ──────────────────────────────────────

export interface TaskStats {
  total: number;
  enAttente: number;
  enCours: number;
  termine: number;
  annule: number;
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  return {
    total:     tasks.length,
    enAttente: tasks.filter((t) => t.statut === 'EN_ATTENTE').length,
    enCours:   tasks.filter((t) => t.statut === 'EN_COURS').length,
    termine:   tasks.filter((t) => t.statut === 'TERMINE' || t.statut === 'TERMINEE').length,
    annule:    tasks.filter((t) => t.statut === 'ANNULE' || t.statut === 'ANNULEE').length,
  };
}

// ─── Récupérer la liste des tâches ─────────────────────────────────────────────

export async function fetchTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la récupération des tâches`);
  }

  const data = await response.json();
  const list: any[] = Array.isArray(data) ? data : (data.content ?? []);

  // Normalisation des objets Tâche (pour supporter à la fois les DTOs plats et imbriqués)
  return list.map((t) => ({
    ...t,
    dateTache: t.dateTache || t.date,
    date: t.date || t.dateTache,
    utilisateur: t.utilisateur || (t.utilisateurNomComplet ? {
      id: t.utilisateurId,
      nomComplet: t.utilisateurNomComplet,
      login: t.utilisateurLogin || '',
    } : undefined),
    contact: t.contact || (t.contactNomComplet ? {
      id: t.contactId,
      nomComplet: t.contactNomComplet,
      entreprise: t.contactEntreprise,
    } : undefined),
  }));
}

// ─── Créer une tâche ────────────────────────────────────────────────────────────

export async function createTask(token: string, data: Partial<Task>): Promise<Task> {
  // Adaptation de la date au format attendu par Spring Boot (LocalDateTime)
  const payload = {
    ...data,
    date: data.date || (data.dateTache ? (data.dateTache.includes('T') ? data.dateTache : `${data.dateTache}T00:00:00`) : undefined),
  };

  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = 'Erreur lors de la création de la tâche';
    try {
      const err = await response.json();
      errorMsg = err.message || (err.errors ? JSON.stringify(err.errors) : errorMsg);
    } catch {
      errorMsg = (await response.text()) || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

// ─── Modifier une tâche ─────────────────────────────────────────────────────────

export async function updateTask(token: string, id: number, data: Partial<Task>): Promise<Task> {
  const payload = {
    ...data,
    date: data.date || (data.dateTache ? (data.dateTache.includes('T') ? data.dateTache : `${data.dateTache}T00:00:00`) : undefined),
  };

  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = 'Erreur lors de la modification de la tâche';
    try {
      const err = await response.json();
      errorMsg = err.message || (err.errors ? JSON.stringify(err.errors) : errorMsg);
    } catch {
      errorMsg = (await response.text()) || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

// ─── Supprimer une tâche ────────────────────────────────────────────────────────

export async function deleteTask(token: string, id: number): Promise<boolean> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la tâche');
  }

  return true;
}

// ─── Changer uniquement le statut d'une tâche ──────────────────────────────────

export async function patchTaskStatus(
  token: string,
  id: number,
  statut: string
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}/statut`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statut }),
  });

  if (!response.ok) {
    // Fallback : PATCH non supporté ou route différente -> tentative PUT complet avec statut
    return updateTask(token, id, { statut });
  }

  return await response.json();
}

// ─── Récupérer la liste des utilisateurs réels (PostgreSQL via /api/users) ─────

export async function fetchAllUsersForSelect(token: string): Promise<UserOption[]> {
  // Requête vers l'API REST des utilisateurs
  try {
    const res = await fetch(`${API_URL}/users?size=1000`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content ?? []);
      return list.map((u: any) => ({
        id: u.id,
        nomComplet: u.nomComplet || u.login || `Utilisateur #${u.id}`,
        login: u.login || '',
        role: typeof u.role === 'string' ? u.role : (u.role?.name || 'USER'),
      }));
    }
  } catch {
    // En cas d'échec sur /api/users, fallback sur /api/users/all
  }

  const responseAll = await fetch(`${API_URL}/users/all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!responseAll.ok) {
    throw new Error(`Erreur HTTP ${responseAll.status} lors de la récupération des utilisateurs`);
  }

  const dataAll = await responseAll.json();
  const listAll = Array.isArray(dataAll) ? dataAll : (dataAll.content ?? []);
  return listAll.map((u: any) => ({
    id: u.id,
    nomComplet: u.nomComplet || u.login || `Utilisateur #${u.id}`,
    login: u.login || '',
    role: typeof u.role === 'string' ? u.role : (u.role?.name || 'USER'),
  }));
}

// ─── Récupérer la liste des contacts réels (PostgreSQL via /api/contacts) ──────

export async function fetchAllContactsForSelect(token: string): Promise<ContactOption[]> {
  const response = await fetch(`${API_URL}/contacts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la récupération des contacts`);
  }

  const data = await response.json();
  const list = Array.isArray(data) ? data : (data.content ?? []);
  return list.map((c: any) => ({
    id: c.id as number,
    nomComplet: (c.nomComplet as string) || `Contact #${c.id}`,
    entreprise: (c.entreprise as string) || undefined,
  }));
}

// ─── Récupérer la liste des interactions réelles (PostgreSQL via /api/interactions)

export async function fetchAllInteractionsForSelect(
  token: string,
  contactId?: number
): Promise<InteractionOption[]> {
  const url = contactId
    ? `${API_URL}/interactions?contactId=${contactId}`
    : `${API_URL}/interactions`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la récupération des interactions`);
  }

  const data = await response.json();
  const list = Array.isArray(data) ? data : (data.content ?? []);
  return list.map((i: any) => ({
    id: i.id as number,
    type: (i.type as string) || 'AUTRE',
    date: (i.date as string) || '',
    contactId: i.contactId ?? i.contact?.id,
  }));
}
