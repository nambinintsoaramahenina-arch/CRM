"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActivityLogsTable } from '@/components/dashboard/ActivityLogsTable';
import { fetchActivityLogs, ActivityLog } from '@/services/activityLogService';
import {
  HistoryIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
  SearchIcon,
  ShieldCheckIcon,
} from '@/components/ui/Icons';

type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

/**
 * Décode le rôle de manière sûre directement depuis le jeton JWT.
 */
function extractRoleFromToken(token: string | null): UserRole {
  if (!token) return 'USER';
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));
      if (decodedPayload.role) {
        return decodedPayload.role.toUpperCase() as UserRole;
      }
    }
  } catch (e) {
    console.warn("Impossible de décoder le JWT, repli sur le stockage local :", e);
  }
  const fallback = localStorage.getItem('crm-role');
  return (fallback ? fallback.toUpperCase() : 'USER') as UserRole;
}

/**
 * Formatage convivial d'une date (sans millisecondes/secondes superflues).
 */
function formatSimpleDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Aujourd'hui à ${time}`;

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Traduit une action brute en libellé métier lisible pour les équipes opérationnelles.
 */
function simplifyActionName(action: string): { label: string; badgeColor: string } {
  const norm = (action || '').toUpperCase();
  if (norm.includes('CREAT') || norm.includes('AJOUT') || norm.includes('INSERT')) {
    return { label: 'Ajout', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
  }
  if (norm.includes('UPDAT') || norm.includes('MODIF') || norm.includes('EDIT')) {
    return { label: 'Modification', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
  }
  if (norm.includes('DELET') || norm.includes('SUPPR')) {
    return { label: 'Suppression', badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' };
  }
  if (norm.includes('CONNEXION') || norm.includes('LOGIN')) {
    return { label: 'Connexion', badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' };
  }
  return { label: 'Activité', badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
}

/**
 * ─── Vue Résumée pour MANAGER & AGENT (USER) ───
 * Affiche des blocs carrés épurés des actions des agents sans les actions administrateur.
 */
function ManagerAgentSimpleFeed({ currentRole }: { currentRole: UserRole | null }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Exclure strictement :
  // - Les actions effectuées par les Administrateurs (non visibles par Manager et Agent)
  // - Pour l'Agent : ne garder que les actions des Agents
  // - Les connexions / déconnexions
  // - Les validations et réinitialisations de mots de passe
  const isExcludedLog = (log: ActivityLog): boolean => {
    const userRole = (log.utilisateur?.role || '').toUpperCase();
    const action = (log.action || '').toUpperCase();
    const entite = (log.entiteConcernee || '').toUpperCase();
    const details = (log.details || '').toLowerCase();

    // 1. Masquer toute action de l'ADMINISTRATEUR dans l'historique Manager et Agent
    if (userRole === 'ADMIN' || details.includes('administrateur') || details.includes('super admin')) {
      return true;
    }

    // 2. Pour l'AGENT : afficher UNIQUEMENT les actions des agents
    if (currentRole === 'USER') {
      if (userRole && userRole !== 'USER' && userRole !== 'AGENT') {
        return true;
      }
    }

    // 3. Connexions / Déconnexions / Authentification
    const isAuth =
      action.includes('CONNEXION') ||
      action.includes('LOGIN') ||
      action.includes('DECONNEXION') ||
      action.includes('LOGOUT') ||
      entite.includes('AUTH');

    // 4. Gestion et réinitialisation de mot de passe
    const isPasswordRelated =
      entite.includes('DEMANDEMDP') ||
      entite.includes('PASSWORD') ||
      entite.includes('MDP') ||
      action.includes('RESET') ||
      action.includes('REINIT') ||
      details.includes('mot de passe') ||
      details.includes('reinitialis') ||
      details.includes('réinitialis') ||
      details.includes('password');

    return isAuth || isPasswordRelated;
  };

  // Logs opérationnels filtrés selon le rôle
  const operationalLogs = useMemo(() => {
    return logs.filter((log) => !isExcludedLog(log));
  }, [logs, currentRole]);

  // Filtrage selon catégorie et mot-clé
  const filteredLogs = useMemo(() => {
    return operationalLogs.filter((log) => {
      const entite = (log.entiteConcernee || '').toUpperCase();
      if (selectedCategory === 'CONTACTS' && !entite.includes('CONTACT')) return false;
      if (selectedCategory === 'INTERACTIONS' && !entite.includes('INTERACTION')) return false;
      if (selectedCategory === 'TASKS' && !entite.includes('TACHE') && !entite.includes('TASK')) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const auteur = (log.utilisateur?.nomComplet || log.utilisateur?.login || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      return auteur.includes(q) || action.includes(q) || details.includes(q);
    });
  }, [operationalLogs, selectedCategory, search]);

  // Statistiques simples calculées sur les actions des agents
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayCount = operationalLogs.filter((l) => l.date && new Date(l.date).toDateString() === today).length;
    const contactsCount = operationalLogs.filter((l) => (l.entiteConcernee || '').toUpperCase().includes('CONTACT')).length;
    const tasksCount = operationalLogs.filter((l) => (l.entiteConcernee || '').toUpperCase().includes('TACHE')).length;
    return { todayCount, contactsCount, tasksCount, total: operationalLogs.length };
  }, [operationalLogs]);

  const isAgent = currentRole === 'USER';

  return (
    <div className="space-y-6">
      {/* ── Cartes de Synthèse ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <HistoryIcon size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Aujourd'hui</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.todayCount} action{stats.todayCount > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ContactsIcon size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contacts traités</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.contactsCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TasksIcon size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Tâches concernées</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.tasksCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UsersIcon size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions agents</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* ── Filtres Métier et Recherche Rapide ── */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filtres par type */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: isAgent ? 'Toutes les actions agents' : 'Toutes les actions' },
            { id: 'CONTACTS', label: 'Contacts' },
            { id: 'INTERACTIONS', label: 'Interactions' },
            { id: 'TASKS', label: 'Tâches' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-72">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une action d'agent..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* ── Affichage en Blocs Carrés ── */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-6 flex items-center justify-between">
          <span>{isAgent ? "Historique des actions des agents" : "Activités des agents et managers"}</span>
          <span className="text-xs font-normal text-[var(--text-secondary)]">
            {filteredLogs.length} bloc{filteredLogs.length > 1 ? 's' : ''} d'activité
          </span>
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--text-secondary)]">
            <div className="w-7 h-7 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-xs font-medium">Chargement des blocs d'activités…</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            Aucune action d'agent enregistrée correspondant aux critères.
          </div>
        ) : (
          /* Grille de Blocs Carrés */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLogs.map((log) => {
              const auteur = log.utilisateur?.nomComplet || log.utilisateur?.login || 'Agent';
              const roleAuteur = log.utilisateur?.role === 'USER' ? 'Agent' : (log.utilisateur?.role || 'Agent');
              const { label: actionLabel, badgeColor } = simplifyActionName(log.action);
              const initials = auteur.substring(0, 2).toUpperCase();

              return (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface-2)]/60 hover:bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:border-cyan-500/50 hover:shadow-md transition-all flex flex-col justify-between min-h-[220px] aspect-square"
                >
                  {/* Partie supérieure du bloc carré */}
                  <div>
                    {/* Auteur & Rôle */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/20 shrink-0">
                          {initials}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate" title={auteur}>
                            {auteur}
                          </p>
                          <span className="text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--bg-border)] inline-block">
                            {roleAuteur}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges Action & Entité */}
                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {actionLabel}
                      </span>
                      {log.entiteConcernee && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--bg-border)]">
                          {log.entiteConcernee}
                        </span>
                      )}
                    </div>

                    {/* Détails / Libellé de l'action */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                      {log.details || log.action}
                    </p>
                  </div>

                  {/* Pied du bloc carré : Horodatage simple */}
                  <div className="pt-3 border-t border-[var(--bg-border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                    <span>{formatSimpleDate(log.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ─── Page Principale Historique & Audit ───
 */
export default function HistoriquePage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('crm-token') || localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Récupération directe du rôle depuis le JWT décodé
    const currentRole = extractRoleFromToken(token);
    setRole(currentRole);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête : Fil d'ariane & Badge du mode d'affichage */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)] font-medium">
          <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
            Tableau de bord
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-bold">
            {isAdmin ? "Journal d'audit technique" : "Flux d'activités"}
          </span>
        </div>

        {/* Badge du rôle actif */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-secondary)]">
          <ShieldCheckIcon size={12} className={isAdmin ? "text-cyan-500" : "text-amber-500"} />
          <span>{isAdmin ? "Vue Administrateur (Tableau d'Audit)" : `Vue Résumée (${role === 'MANAGER' ? 'Manager' : 'Agent'})`}</span>
        </div>
      </div>

      {/* ── Condition selon le rôle ── */}
      {isAdmin ? (
        /* Rôle ADMIN : Grand tableau complet avec détails techniques (IP, IDs entités, modale JSON) */
        <ActivityLogsTable />
      ) : (
        /* Rôle MANAGER ou AGENT (USER) : Résumé en blocs carrés (actions agents uniquement) */
        <ManagerAgentSimpleFeed currentRole={role} />
      )}
    </div>
  );
}
