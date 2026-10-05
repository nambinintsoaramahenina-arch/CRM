'use client';

/**
 * InteractionsCrudTable.tsx
 * --------------------------
 * Tableau CRUD complet des interactions CRM.
 * - Chargement dynamique depuis GET /api/interactions (via useInteractions hook)
 * - Formulaire modal de création / édition (POST / PUT)
 * - Suppression avec confirmation (DELETE — ADMIN/MANAGER uniquement)
 * - Skeleton loader + gestion d'erreurs avec redirection auto si 401
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInteractions } from '@/hooks/useInteractions';
import {
  TYPE_INTERACTION_CONFIG,
  TypeInteraction,
  InteractionResponseDTO,
  InteractionRequestDTO,
  formatInteractionDate,
  formatInteractionDateTime,
  timeAgo,
} from '@/services/interactionService';
import { fetchContacts, Contact } from '@/services/contactService';

// ─── Icônes SVG inline ─────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const PlusIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const RefreshIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const XIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const AlertIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ─── Constantes ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const TYPE_FILTERS: { id: string; label: string }[] = [
  { id: 'ALL',         label: 'Tous' },
  { id: 'APPEL',       label: 'Appels' },
  { id: 'EMAIL',       label: 'Emails' },
  { id: 'REUNION',     label: 'Réunions' },
  { id: 'RENDEZ_VOUS', label: 'RDV' },
  { id: 'MESSAGE',     label: 'Messages' },
  { id: 'AUTRE',       label: 'Autres' },
];

const ALL_TYPES: TypeInteraction[] = ['APPEL', 'EMAIL', 'REUNION', 'RENDEZ_VOUS', 'MESSAGE', 'AUTRE'];

// ─── Formulaire vide ───────────────────────────────────────────────────────────

const emptyForm = (): Omit<InteractionRequestDTO, 'contactId'> & { contactId: string } => ({
  type: 'APPEL',
  date: new Date().toISOString().slice(0, 16), // "YYYY-MM-DDTHH:MM"
  objet: '',
  description: '',
  resultat: '',
  prochaineAction: '',
  contactId: '',
});

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-[var(--bg-border)]">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-[var(--bg-surface-2)] rounded-md animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Badge de type ─────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: TypeInteraction }) => {
  const cfg = TYPE_INTERACTION_CONFIG[type] ?? TYPE_INTERACTION_CONFIG.AUTRE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────

export const InteractionsCrudTable: React.FC<{ isManager?: boolean }> = ({
  isManager = false,
}) => {
  const router = useRouter();
  const { interactions, loading, mutating, error, reload, addInteraction, editInteraction, removeInteraction, clearError } =
    useInteractions();

  // Contacts pour le select du formulaire
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Filtres et pagination
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage]             = useState(0);

  // Modal formulaire
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<InteractionResponseDTO | null>(null);
  const [form, setForm]                 = useState(emptyForm());
  const [formError, setFormError]       = useState<string | null>(null);

  // Modal suppression
  const [deleteTarget, setDeleteTarget] = useState<InteractionResponseDTO | null>(null);

  // ─── Chargement des contacts (pour le formulaire) ────────────────────────

  const loadContacts = useCallback(async () => {
    const token = localStorage.getItem('crm-token');
    if (!token) { router.push('/login'); return; }
    setContactsLoading(true);
    try {
      const data = await fetchContacts(token, 0, 200);
      setContacts(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      // silencieux — la liste sera vide
    } finally {
      setContactsLoading(false);
    }
  }, [router]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // ─── Filtrage côté client ─────────────────────────────────────────────────

  const filtered = interactions.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      it.contactNomComplet.toLowerCase().includes(q) ||
      (it.objet ?? '').toLowerCase().includes(q) ||
      (it.contactEntreprise ?? '').toLowerCase().includes(q) ||
      it.utilisateurNomComplet.toLowerCase().includes(q);
    const matchType = typeFilter === 'ALL' || it.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Réinitialiser la page lors d'un changement de filtre
  useEffect(() => { setPage(0); }, [search, typeFilter]);

  // ─── Gestion du formulaire ────────────────────────────────────────────────

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (it: InteractionResponseDTO) => {
    setEditTarget(it);
    setForm({
      type:           it.type,
      date:           it.date.slice(0, 16),
      objet:          it.objet          ?? '',
      description:    it.description    ?? '',
      resultat:       it.resultat       ?? '',
      prochaineAction: it.prochaineAction ?? '',
      contactId:      String(it.contactId),
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.contactId) {
      setFormError('Veuillez sélectionner un contact.');
      return;
    }

    const payload: InteractionRequestDTO = {
      type:            form.type as TypeInteraction,
      date:            form.date, // ISO compatible avec LocalDateTime Java
      objet:           form.objet           || undefined,
      description:     form.description     || undefined,
      resultat:        form.resultat        || undefined,
      prochaineAction: form.prochaineAction || undefined,
      contactId:       Number(form.contactId),
    };

    try {
      if (editTarget) {
        await editInteraction(editTarget.id, payload);
      } else {
        await addInteraction(payload);
      }
      closeModal();
    } catch (err) {
      setFormError((err as Error).message ?? 'Erreur lors de la soumission');
    }
  };

  // ─── Suppression ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeInteraction(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteTarget(null);
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--bg-border)] shadow-xl overflow-hidden">

      {/* ── En-tête ── */}
      <div className="p-6 border-b border-[var(--bg-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Historique des Interactions</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {loading ? 'Chargement…' : `${filtered.length} interaction${filtered.length !== 1 ? 's' : ''} trouvée${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reload}
            disabled={loading}
            className="p-2 rounded-xl border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-cyan-500 hover:border-cyan-300 transition-all disabled:opacity-40"
            title="Rafraîchir"
          >
            <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <PlusIcon size={14} />
            Nouvelle interaction
          </button>
        </div>
      </div>

      {/* ── Bannière d'erreur globale ── */}
      {error && (
        <div className="mx-6 mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertIcon size={16} className="shrink-0 mt-0.5" />
          <p className="text-xs font-medium flex-1">{error}</p>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-600 transition-colors">
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="p-4 border-b border-[var(--bg-border)] flex flex-col sm:flex-row gap-3">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher par contact, objet, entreprise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Filtre par type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                typeFilter === f.id
                  ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                  : 'border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500 bg-[var(--bg-surface-2)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--bg-border)] bg-[var(--bg-surface-2)]">
              {['Type', 'Contact', 'Objet', 'Date', 'Responsable', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[var(--text-muted)] text-sm">
                  {search || typeFilter !== 'ALL'
                    ? 'Aucune interaction ne correspond à votre recherche.'
                    : 'Aucune interaction enregistrée pour le moment.'}
                </td>
              </tr>
            ) : (
              pageData.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-[var(--bg-border)] hover:bg-[var(--bg-surface-2)] transition-colors group"
                >
                  <td className="px-4 py-3">
                    <TypeBadge type={it.type} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[var(--text-primary)]">{it.contactNomComplet}</p>
                    {it.contactEntreprise && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{it.contactEntreprise}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{it.objet || '—'}</p>
                    {it.description && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{it.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-[var(--text-primary)]">{formatInteractionDate(it.date)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{timeAgo(it.date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--text-primary)]">{it.utilisateurNomComplet}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{it.utilisateurLogin}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(it)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all"
                        title="Modifier"
                      >
                        <EditIcon size={13} />
                      </button>
                      {isManager && (
                        <button
                          onClick={() => setDeleteTarget(it)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
                          title="Supprimer"
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="p-4 border-t border-[var(--bg-border)] flex items-center justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            Page {page + 1} / {totalPages} — {filtered.length} résultats
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon size={14} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition-all ${
                    pg === page
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500'
                  }`}
                >
                  {pg + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL — FORMULAIRE CRÉATION / ÉDITION
      ════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panneau */}
          <div className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl border border-[var(--bg-border)] shadow-2xl overflow-hidden">
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--bg-border)] bg-gradient-to-r from-cyan-500/10 to-transparent">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {editTarget ? 'Modifier l\'interaction' : 'Nouvelle interaction'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {editTarget
                    ? `Modification de l'interaction #${editTarget.id}`
                    : 'Enregistrement d\'un nouvel échange avec un contact'}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-all">
                <XIcon size={18} />
              </button>
            </div>

            {/* Corps du formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Erreur formulaire */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  <AlertIcon size={14} className="shrink-0" />
                  {formError}
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Type d'interaction <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_TYPES.map((t) => {
                    const cfg = TYPE_INTERACTION_CONFIG[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                          form.type === t
                            ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-cyan-400/50`
                            : 'border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-cyan-400 bg-[var(--bg-surface-2)]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Contact <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.contactId}
                  onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                >
                  <option value="">
                    {contactsLoading ? 'Chargement des contacts…' : '— Sélectionner un contact —'}
                  </option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomComplet}{c.entreprise ? ` — ${c.entreprise}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Date et heure <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Objet */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Objet</label>
                <input
                  type="text"
                  placeholder="Ex : Présentation du service, Suivi dossier…"
                  value={form.objet}
                  onChange={(e) => setForm((f) => ({ ...f, objet: e.target.value }))}
                  maxLength={255}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Description</label>
                <textarea
                  placeholder="Détails de l'interaction…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              {/* Résultat */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Résultat / Conclusion</label>
                <textarea
                  placeholder="Résultat obtenu…"
                  value={form.resultat}
                  onChange={(e) => setForm((f) => ({ ...f, resultat: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              {/* Prochaine action */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Prochaine action</label>
                <input
                  type="text"
                  placeholder="Ex : Envoyer un devis, Rappeler le contact…"
                  value={form.prochaineAction}
                  onChange={(e) => setForm((f) => ({ ...f, prochaineAction: e.target.value }))}
                  maxLength={500}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--bg-border)] text-[var(--text-secondary)] text-xs font-bold hover:bg-[var(--bg-surface-2)] transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={mutating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {mutating && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {editTarget ? 'Enregistrer les modifications' : 'Créer l\'interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL — CONFIRMATION SUPPRESSION
      ════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[var(--bg-surface)] rounded-3xl border border-rose-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                <TrashIcon size={20} />
              </div>
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-sm">Confirmer la suppression</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] bg-rose-50 border border-rose-200 rounded-xl p-3">
              Supprimer l'interaction{' '}
              <strong className="text-rose-700">
                {TYPE_INTERACTION_CONFIG[deleteTarget.type]?.label} — {deleteTarget.contactNomComplet}
              </strong>{' '}
              du {formatInteractionDate(deleteTarget.date)} ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--bg-border)] text-[var(--text-secondary)] text-xs font-bold hover:bg-[var(--bg-surface-2)] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={mutating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mutating && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
