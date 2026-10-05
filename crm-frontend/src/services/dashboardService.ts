/**
 * dashboardService.ts
 * -------------------
 * Service d'agregation de statistiques pour le tableau de bord CRM.
 * Interroge les APIs existantes (users, contacts, interactions) pour
 * produire les metriques KPI affichees dans les StatCards.
 *
 * Base URL : http://localhost:8080/api
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Types

export interface DashboardStats {
  users: {
    total: number;
    actifs: number;
    inactifs: number;
  };
  contacts: {
    total: number;
    actifs: number;
    inactifs: number;
    newThisMonth: number;
  };
  interactions: {
    total: number;
    byType: Record<string, number>;
  };
  tasks: {
    total: number;
    enRetard: number;
    terminees: number;
  };
}

export interface RecentActivityDTO {
  id: number;
  type: string;
  objet?: string;
  description?: string;
  date: string;
  contactNomComplet: string;
  contactEntreprise?: string;
  utilisateurNomComplet: string;
  utilisateurLogin: string;
}

// Utilitaire

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function safeFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { method: "GET", headers: authHeaders(token) });
  if (!res.ok) {
    throw Object.assign(
      new Error(`Erreur HTTP ${res.status} sur ${url}`),
      { status: res.status }
    );
  }
  return res.json() as Promise<T>;
}

// Statistiques du tableau de bord

export async function fetchDashboardStats(
  token: string,
  isManager = false
): Promise<DashboardStats> {
  const contactsPromise = safeFetch<{
    content?: { statut?: string; dateCreation?: string }[];
    totalElements?: number;
    [key: string]: unknown;
  }>(`${API_URL}/contacts?page=0&size=1000`, token).catch(() => null);

  const interactionsPromise = safeFetch<{ type: string; date?: string }[]>(
    `${API_URL}/interactions`,
    token
  ).catch(() => null);

  const usersPromise = isManager
    ? safeFetch<{
        content?: { statut?: string }[];
        totalElements?: number;
      }>(`${API_URL}/users?page=0&size=1000`, token).catch(() => null)
    : Promise.resolve(null);

  const [contactsData, interactionsData, usersData] = await Promise.all([
    contactsPromise,
    interactionsPromise,
    usersPromise,
  ]);

  // Contacts
  const contactsList: { statut?: string; dateCreation?: string }[] =
    Array.isArray(contactsData)
      ? (contactsData as { statut?: string; dateCreation?: string }[])
      : (contactsData?.content ?? []);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const contacts = {
    total: contactsList.length,
    actifs: contactsList.filter((c) => c.statut === "ACTIF").length,
    inactifs: contactsList.filter((c) => c.statut === "INACTIF").length,
    newThisMonth: contactsList.filter((c) => {
      if (!c.dateCreation) return false;
      return new Date(c.dateCreation) >= startOfMonth;
    }).length,
  };

  // Interactions
  const interactionsList: { type: string }[] = Array.isArray(interactionsData)
    ? interactionsData
    : [];

  const byType: Record<string, number> = {};
  for (const it of interactionsList) {
    byType[it.type] = (byType[it.type] ?? 0) + 1;
  }

  const interactions = { total: interactionsList.length, byType };

  // Utilisateurs
  const usersList: { statut?: string }[] = Array.isArray(usersData)
    ? (usersData as { statut?: string }[])
    : (usersData?.content ?? []);

  const users = {
    total: usersData?.totalElements ?? usersList.length,
    actifs: usersList.filter((u) => u.statut === "ACTIF").length,
    inactifs: usersList.filter((u) => u.statut === "INACTIF").length,
  };

  // Taches (TODO: connecter a /api/tasks)
  const tasks = { total: 0, enRetard: 0, terminees: 0 };

  return { users, contacts, interactions, tasks };
}

// Activites recentes

export async function fetchRecentActivities(
  token: string,
  limit = 5
): Promise<RecentActivityDTO[]> {
  const data = await safeFetch<RecentActivityDTO[]>(
    `${API_URL}/interactions`,
    token
  );

  return [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
