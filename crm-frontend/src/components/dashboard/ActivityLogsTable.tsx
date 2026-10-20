'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchActivityLogs, ActivityLog } from '@/services/activityLogService';
import {
  HistoryIcon,
  SearchIcon,
  CloseIcon,
  CheckCircleIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
} from '@/components/ui/Icons';

// ─── Icônes supplémentaires ──────────────────────────────────────────────────

const RefreshCwIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const GlobeIcon = ({ size = 13, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const EyeIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ─── Helpers Visuels ──────────────────────────────────────────────────────────

const getActionBadge = (action: string) => {
  const norm = (action || '').toUpperCase();
  if (norm.includes('REJECT') || norm.includes('REJET')) {
    return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
  }
  if (norm.includes('DELETE') || norm.includes('SUPPR') || norm.includes('REMOVE')) {
    return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  }
  if (norm.includes('CREAT') || norm.includes('AJOUT') || norm.includes('INSERT')) {
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  }
  if (norm.includes('UPDATE') || norm.includes('MODIF') || norm.includes('EDIT')) {
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  }
  if (norm.includes('APPROVE') || norm.includes('VALID')) {
    return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }
  if (norm.includes('CONNEXION') || norm.includes('LOGIN')) {
    return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
  }
  if (norm.includes('DECONNEXION') || norm.includes('LOGOUT')) {
    return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
  if (norm.includes('REINIT') || norm.includes('RESET') || norm.includes('MDP')) {
    return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
  }
  return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
};

const getEntityIcon = (entity?: string) => {
  const norm = (entity || '').toLowerCase();
  if (norm.includes('user') || norm.includes('utilisateur')) return <UsersIcon size={13} className="text-blue-500" />;
  if (norm.includes('contact')) return <ContactsIcon size={13} className="text-emerald-500" />;
  if (norm.includes('interaction')) return <InteractionsIcon size={13} className="text-teal-500" />;
  if (norm.includes('tache') || norm.includes('task')) return <TasksIcon size={13} className="text-amber-500" />;
  return <HistoryIcon size={13} className="text-cyan-500" />;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

// ─── Composant Principal ──────────────────────────────────────────────────────

export const ActivityLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Modale Détails
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Rafraîchissement fluide et automatique
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    const token = localStorage.getItem('crm-token');
    if (!token) {
      setError("Token d'authentification manquant ('crm-token'). Veuillez vous reconnecter.");
      if (!isSilent) setLoading(false);
      return;
    }

    try {
      const data = await fetchActivityLogs(token);
      setLogs(data);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de chargement de l'historique";
      if (!isSilent) setError(msg);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(false);
  }, [loadLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadLogs(true);
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [autoRefresh, loadLogs]);

  // Liste distincte des entités pour le filtre
  const distinctEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.entiteConcernee) set.add(log.entiteConcernee);
    });
    return Array.from(set);
  }, [logs]);

  // Liste distincte des actions pour le filtre
  const distinctActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.action) set.add(log.action);
    });
    return Array.from(set);
  }, [logs]);

  // Filtrage
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filtre Action
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false;
      }
      // Filtre Entité
      if (entityFilter !== 'ALL' && log.entiteConcernee !== entityFilter) {
        return false;
      }
      // Recherche globale
      if (search.trim()) {
        const query = search.toLowerCase();
        const userName = (log.utilisateur?.nomComplet || '').toLowerCase();
        const userLogin = (log.utilisateur?.login || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const entity = (log.entiteConcernee || '').toLowerCase();
        const ip = (log.adresseIp || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const id = String(log.id);
        const entityId = String(log.identifiantEntite || '');

        return (
          userName.includes(query) ||
          userLogin.includes(query) ||
          action.includes(query) ||
          entity.includes(query) ||
          ip.includes(query) ||
          details.includes(query) ||
          id.includes(query) ||
          entityId.includes(query)
        );
      }
      return true;
    });
  }, [logs, search, actionFilter, entityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  return (
    <div className="space-y-5">
      {/* ── Entête & Statistiques rapides ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--bg-border)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <HistoryIcon size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                Journal d&apos;Activité & Historique
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Audit complet et traçabilité des opérations en base PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {lastUpdated && (
            <span className="text-[11px] text-[var(--text-muted)] font-mono hidden md:inline">
              Synchro : {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-xs font-bold text-[var(--text-secondary)]">
            <span className="text-cyan-600 dark:text-cyan-400 font-black">{filteredLogs.length}</span>{' '}
            {filteredLogs.length > 1 ? 'événements' : 'événement'}
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-[var(--bg-surface-2)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={autoRefresh ? 'Désactiver le rafraîchissement auto' : 'Activer le rafraîchissement auto (10s)'}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Auto {autoRefresh ? '10s' : 'Off'}</span>
          </button>

          <button
            onClick={() => loadLogs(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm shadow-cyan-600/20 transition-all disabled:opacity-50"
            title="Forcer l'actualisation immédiate depuis PostgreSQL"
          >
            <RefreshCwIcon size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* ── Barre de filtres et recherche ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Recherche textuelle */}
        <div className="md:col-span-6 relative">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher par utilisateur, action, entité, IP, détails…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Filtre Action */}
        <div className="md:col-span-3">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all cursor-pointer font-medium"
          >
            <option value="ALL">Toutes les actions ({distinctActions.length})</option>
            {distinctActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Entité */}
        <div className="md:col-span-3">
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all cursor-pointer font-medium"
          >
            <option value="ALL">Toutes les entités ({distinctEntities.length})</option>
            {distinctEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Message d'erreur ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadLogs(false)} className="underline hover:no-underline font-bold">
            Réessayer
          </button>
        </div>
      )}

      {/* ── Tableau Responsive ── */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[var(--bg-surface-2)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--bg-border)]">
              <tr>

                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entité Concernée</th>
                <th className="py-3 px-4">Adresse IP</th>
                <th className="py-3 px-4">Détails</th>
                <th className="py-3 px-4 text-right">Voir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bg-border)] font-normal text-[var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-xs text-[var(--text-muted)] font-medium">
                        Chargement de l&apos;historique réel depuis PostgreSQL…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-[var(--text-muted)]">
                      <HistoryIcon size={32} className="opacity-30" />
                      <p className="text-sm font-bold text-[var(--text-secondary)]">Aucun journal d&apos;activité trouvé</p>
                      <p className="text-xs">
                        {search || actionFilter !== 'ALL' || entityFilter !== 'ALL'
                          ? 'Modifiez ou réinitialisez vos filtres pour afficher des données.'
                          : 'La table journal_activite est actuellement vide.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const badgeClass = getActionBadge(log.action);
                  const userInitial = log.utilisateur?.nomComplet
                    ? log.utilisateur.nomComplet.charAt(0).toUpperCase()
                    : (log.utilisateur?.login ? log.utilisateur.login.charAt(0).toUpperCase() : '?');

                  return (
                    <tr key={log.id} className="hover:bg-[var(--bg-surface-2)]/60 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-xs text-[var(--text-primary)]">
                          {formatDate(log.date)}
                        </span>
                      </td>

                      {/* Utilisateur */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.utilisateur ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {userInitial}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {log.utilisateur.nomComplet || log.utilisateur.login}
                              </span>
                              {log.utilisateur.login && (
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">
      
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)] italic">Système</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Entité Concernée */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-xs font-semibold">
                          {getEntityIcon(log.entiteConcernee)}
                          <span>{log.entiteConcernee || 'Général'}</span>
                          {log.identifiantEntite != null && (
                            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Adresse IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.adresseIp ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)]">
                            <GlobeIcon size={12} className="text-slate-400" />
                            {log.adresseIp}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] text-[10px] italic">—</span>
                        )}
                      </td>

                      {/* Détails */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <p
                          className="truncate text-xs text-[var(--text-primary)] font-medium cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          title={log.details ? `${log.details} (Cliquer pour voir)` : ''}
                          onClick={() => setSelectedLog(log)}
                        >
                          {log.details || <span className="text-[var(--text-muted)] italic">—</span>}
                        </p>
                      </td>

                      {/* Action bouton voir */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-cyan-600 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                          title="Voir les détails complets"
                        >
                          <EyeIcon size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs">
            <span className="text-[var(--text-secondary)]">
              Affichage de{' '}
              <strong className="text-[var(--text-primary)]">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              à{' '}
              <strong className="text-[var(--text-primary)]">
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </strong>{' '}
              sur <strong className="text-[var(--text-primary)]">{filteredLogs.length}</strong> entrées
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <span className="px-3 py-1 font-bold text-[var(--text-primary)]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modale de Détails Complets ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] shadow-2xl p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <HistoryIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">
                    Détail du Journal d&apos;Activité
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDate(selectedLog.date)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--bg-surface-2)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Action
                  </span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Adresse IP
                  </span>
                  <p className="mt-1 font-mono font-bold text-[var(--text-primary)]">
                    {selectedLog.adresseIp || 'Non renseignée'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Entité ciblée
                  </span>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {selectedLog.entiteConcernee || '—'}{' '}
                    {selectedLog.identifiantEntite ? `` : ''}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Utilisateur
                  </span>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {selectedLog.utilisateur?.nomComplet || selectedLog.utilisateur?.login || 'Système'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Contenu détaillé / Payload
                </span>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--bg-border)] max-h-48 overflow-y-auto">
                  <pre className="text-[11px] font-mono text-[var(--text-primary)] whitespace-pre-wrap break-words">
                    {selectedLog.details || 'Aucun détail supplémentaire enregistré pour cette action.'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--bg-border)]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
