'use client';

/**
 * useInteractions.ts
 * ------------------
 * Hook React personnalisé pour gérer l'état complet des interactions CRM.
 *
 * Fonctionnalités :
 *  - Chargement automatique au montage (fetchAll)
 *  - États loading / error intégrés
 *  - Redirection automatique vers /login si le token est expiré (401/403)
 *  - CRUD complet : create, update, remove
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  InteractionResponseDTO,
  InteractionRequestDTO,
  fetchInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
} from '@/services/interactionService';

interface UseInteractionsReturn {
  /** Liste des interactions chargées depuis l'API */
  interactions: InteractionResponseDTO[];
  /** True pendant le premier chargement */
  loading: boolean;
  /** True pendant une opération de mutation (create/update/delete) */
  mutating: boolean;
  /** Message d'erreur si une opération a échoué */
  error: string | null;
  /** Recharge la liste depuis l'API */
  reload: () => Promise<void>;
  /** Crée une nouvelle interaction et rafraîchit la liste */
  addInteraction: (data: InteractionRequestDTO) => Promise<InteractionResponseDTO>;
  /** Met à jour une interaction existante */
  editInteraction: (id: number, data: InteractionRequestDTO) => Promise<InteractionResponseDTO>;
  /** Supprime une interaction par son ID */
  removeInteraction: (id: number) => Promise<void>;
  /** Efface le message d'erreur manuellement */
  clearError: () => void;
}

export function useInteractions(): UseInteractionsReturn {
  const router = useRouter();
  const [interactions, setInteractions] = useState<InteractionResponseDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ─── Récupère le token JWT depuis le localStorage ──────────────────────────

  const getToken = useCallback((): string => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('crm-token')
      : null;

    if (!token) {
      router.push('/login');
      throw new Error('Token manquant — redirection vers /login');
    }
    return token;
  }, [router]);

  // ─── Gestion centralisée des erreurs HTTP ──────────────────────────────────

  const handleApiError = useCallback(
    (err: unknown) => {
      const e = err as Error & { status?: number };
      if (e.status === 401 || e.status === 403) {
        // Token expiré ou accès refusé → déconnexion propre
        localStorage.removeItem('crm-token');
        localStorage.removeItem('crm-role');
        localStorage.removeItem('crm-name');
        localStorage.removeItem('crm-user');
        router.push('/login');
        return;
      }
      setError(e.message || 'Une erreur inattendue est survenue');
    },
    [router]
  );

  // ─── Chargement initial de la liste ───────────────────────────────────────

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const data = await fetchInteractions(token);
      // Trier par date décroissante (la plus récente en premier)
      setInteractions(
        [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, handleApiError]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ─── CREATE ───────────────────────────────────────────────────────────────

  const addInteraction = useCallback(
    async (data: InteractionRequestDTO): Promise<InteractionResponseDTO> => {
      setMutating(true);
      setError(null);
      try {
        const token = getToken();
        const created = await createInteraction(token, data);
        setInteractions((prev) =>
          [created, ...prev].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        return created;
      } catch (err) {
        handleApiError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [getToken, handleApiError]
  );

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  const editInteraction = useCallback(
    async (id: number, data: InteractionRequestDTO): Promise<InteractionResponseDTO> => {
      setMutating(true);
      setError(null);
      try {
        const token = getToken();
        const updated = await updateInteraction(token, id, data);
        setInteractions((prev) =>
          prev
            .map((it) => (it.id === id ? updated : it))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        return updated;
      } catch (err) {
        handleApiError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [getToken, handleApiError]
  );

  // ─── DELETE ───────────────────────────────────────────────────────────────

  const removeInteraction = useCallback(
    async (id: number): Promise<void> => {
      setMutating(true);
      setError(null);
      try {
        const token = getToken();
        await deleteInteraction(token, id);
        setInteractions((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        handleApiError(err);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [getToken, handleApiError]
  );

  return {
    interactions,
    loading,
    mutating,
    error,
    reload,
    addInteraction,
    editInteraction,
    removeInteraction,
    clearError: () => setError(null),
  };
}
