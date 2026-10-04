const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Interface Contact alignée sur le DTO Spring Boot ──────────────────────────
// Le backend attend/renvoie : nomComplet, email, telephone, entreprise,
// fonction, statut, commentaire (notes).
// NB : nom & prenom sont des champs UI uniquement (split/join côté frontend).

export interface Contact {
  id: number;
  /** Champ obligatoire attendu par le backend : "Prénom Nom" */
  nomComplet: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  fonction?: string;
  /** 'ACTIF' | 'INACTIF' */
  statut?: string;
  /** Correspond au champ "notes" ou "commentaire" selon le backend */
  commentaire?: string;
  dateCreation?: string; // ISO 8601
}

// ─── Type du formulaire frontend (UI) ─────────────────────────────────────────
// On conserve prenom + nom séparés pour faciliter la saisie, puis on les fusionne
// en nomComplet avant d'envoyer au backend.

export interface ContactFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  fonction: string;
  statut: string;
  commentaire: string;
}

/** Convertit les champs UI en payload backend */
export function toContactPayload(form: ContactFormData): Partial<Contact> {
  return {
    nomComplet:  `${form.prenom.trim()} ${form.nom.trim()}`.trim(),
    email:       form.email       || undefined,
    telephone:   form.telephone   || undefined,
    entreprise:  form.entreprise  || undefined,
    fonction:    form.fonction    || undefined,
    statut:      form.statut      || 'ACTIF',
    commentaire: form.commentaire || undefined,
  };
}

// ─── Récupérer la liste paginée des contacts ───────────────────────────────────

export async function fetchContacts(
  token: string,
  page = 0,
  size = 20,
  keyword = '',
  statut = ''
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (keyword) params.append('keyword', keyword);
  if (statut)  params.append('statut', statut);

  const response = await fetch(`${API_URL}/contacts?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la récupération des contacts`);
  }

  // Le backend renvoie soit un Page Spring {content, totalElements, ...} soit un tableau
  return await response.json();
}

// ─── Créer un contact ──────────────────────────────────────────────────────────

export async function createContact(token: string, data: Partial<Contact>) {
  const response = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Tenter de parser le message d'erreur JSON du backend
    let errorMsg = "Erreur lors de la création du contact";
    try {
      const err = await response.json();
      errorMsg = err.message || (err.errors ? JSON.stringify(err.errors) : errorMsg);
    } catch {
      errorMsg = await response.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

// ─── Modifier un contact ───────────────────────────────────────────────────────

export async function updateContact(token: string, id: number, data: Partial<Contact>) {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de la modification du contact";
    try {
      const err = await response.json();
      errorMsg = err.message || (err.errors ? JSON.stringify(err.errors) : errorMsg);
    } catch {
      errorMsg = await response.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

// ─── Supprimer un contact ──────────────────────────────────────────────────────

export async function deleteContact(token: string, id: number) {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du contact");
  }

  return true;
}
