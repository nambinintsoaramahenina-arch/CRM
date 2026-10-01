const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface User {
  id: number;
  nomComplet: string;
  email: string;
  telephone?: string;
  login: string;
  role: string;
  statut?: string;
  dateConnexion?: string;       // ISO 8601 — date de la dernière connexion enregistrée
  derniereConnexion?: string;   // ISO 8601 — connexion précédente avant la dernière
}

// Fonction pour récupérer la liste paginée des utilisateurs (protégée par JWT)
export async function fetchUsers(
  token: string, 
  page = 0, 
  size = 10, 
  keyword = '', 
  role = '', 
  statut = ''
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (keyword) params.append('keyword', keyword);
    if (role) params.append('role', role);
    if (statut) params.append('statut', statut);

    const response = await fetch(`${API_URL}/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    // Spring Boot renvoie un objet Page (content, totalPages, etc.)
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw error; // Propager l'erreur pour que le composant puisse la gérer (ex: rediriger si 401/403)
  }
}

// Fonction pour se connecter et récupérer le token JWT depuis Spring Boot / PostgreSQL
// Le backend accepte : { identifiant: login|email|téléphone, mdp: mot_de_passe }
export async function loginUser(loginData: { login: string; mdp: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // On mappe 'login' -> 'identifiant' pour correspondre au DTO Spring Boot
    body: JSON.stringify({ identifiant: loginData.login, mdp: loginData.mdp }),
  });

  if (!response.ok) {
    let message = 'Identifiants invalides';
    try {
      const err = await response.json();
      message = err.message || err.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return await response.json();
}

// ─── FONCTIONS CRUD UTILISATEURS ───

// 1. Créer un utilisateur
export async function createUser(token: string, userData: Partial<User>) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Erreur lors de la création de l'utilisateur");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur de création :", error);
    throw error;
  }
}

// 2. Modifier un utilisateur existant
export async function updateUser(token: string, id: number, userData: Partial<User>) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT', // ou PATCH selon ton contrôleur Spring Boot
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Erreur lors de la modification de l'utilisateur");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur de modification :", error);
    throw error;
  }
}

// 3. Supprimer un utilisateur
export async function deleteUser(token: string, id: number) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }

    return true;
  } catch (error) {
    console.error("Erreur de suppression :", error);
    throw error;
  }
}