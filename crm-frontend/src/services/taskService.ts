const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Interface Tâche alignée sur le DTO Spring Boot ────────────────────────────

export interface Task {
  id: number;
  titre: string;
  description?: string;
  dateTache?: string;       // ISO 8601
  typeTache?: string;       // ex: 'APPEL', 'EMAIL', 'REUNION', 'AUTRE'
  statut?: string;          // 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'
  utilisateurId?: number;
  utilisateur?: { id: number; nomComplet: string; login: string };
  contactId?: number;
  contact?: { id: number; nomComplet: string; entreprise?: string };
  interactionId?: number;
  interaction?: { id: number; sujet?: string };
  dateCreation?: string;    // ISO 8601
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
    termine:   tasks.filter((t) => t.statut === 'TERMINE').length,
    annule:    tasks.filter((t) => t.statut === 'ANNULE').length,
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
  // Le backend peut renvoyer soit un tableau, soit un objet Page Spring Boot
  return Array.isArray(data) ? data : (data.content ?? []);
}

// ─── Créer une tâche ────────────────────────────────────────────────────────────

export async function createTask(token: string, data: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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
// Tente PATCH en premier, avec fallback sur PUT si non supporté

export async function patchTaskStatus(
  token: string,
  id: number,
  statut: string
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statut }),
  });

  if (!response.ok) {
    // Fallback : PATCH non supporté → PUT complet avec juste le statut
    return updateTask(token, id, { statut });
  }

  return await response.json();
}
