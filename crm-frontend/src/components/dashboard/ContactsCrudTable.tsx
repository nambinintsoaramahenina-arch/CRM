'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  Contact,
  ContactFormData,
  toContactPayload,
} from '@/services/contactService';

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
const EditIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PhoneIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
  </svg>
);
const MailIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ChevronLeftIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const BuildingIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const UserBadgeIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

// ─── Constantes ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { id: 'ALL',    label: 'Tous' },
  { id: 'ACTIF',  label: 'Actifs' },
  { id: 'INACTIF', label: 'Inactifs' },
];

// ─── Formulaire vide ───────────────────────────────────────────────────────────

const emptyForm = (): ContactFormData => ({
  prenom: '', nom: '', email: '', telephone: '',
  entreprise: '', fonction: '', statut: 'ACTIF', commentaire: '',
});

// ─── Composant principal ────────────────────────────────────────────────────────

export const ContactsCrudTable: React.FC = () => {
  // ── État données ──
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]       = useState(1);

  // ── Filtres & pagination ──
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]               = useState(0);

  // ── Modal ──
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm]                   = useState<ContactFormData>(emptyForm());
  const [submitting, setSubmitting]       = useState(false);

  // ── Modal confirmation suppression ──
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Rôle connecté ──
  const [connectedRole, setConnectedRole] = useState<string>('USER');

  useEffect(() => {
    const r = localStorage.getItem('crm-role') || 'USER';
    setConnectedRole(r);
  }, []);

  const isAdmin = connectedRole === 'ADMIN';
  const canWrite = isAdmin;

  // ─── Chargement des contacts ───────────────────────────────────────────────

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('crm-token');
    if (!token) { setLoading(false); return; }

    try {
      const data = await fetchContacts(
        token, page, PAGE_SIZE,
        search,
        statusFilter !== 'ALL' ? statusFilter : ''
      );

      // Gestion Page Spring Boot {content, totalElements, totalPages}
      // ou tableau brut
      if (data && data.content !== undefined) {
        setContacts(data.content);
        setTotalElements(data.totalElements ?? data.content.length);
        setTotalPages(data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setContacts(data);
        setTotalElements(data.length);
        setTotalPages(1);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Erreur chargement contacts :', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Réinitialise la page à 0 si les filtres changent
  useEffect(() => { setPage(0); }, [search, statusFilter]);

  // ─── Handlers modal ────────────────────────────────────────────────────────

  const openAddModal = () => {
    if (!canWrite) return;
    setEditingContact(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (c: Contact) => {
    if (!canWrite) return;
    setEditingContact(c);
    // Décompose nomComplet ("Prénom Nom") en deux champs UI
    const parts = (c.nomComplet ?? '').trim().split(' ');
    const prenom = parts.shift() ?? '';
    const nom    = parts.join(' ');
    setForm({
      prenom,
      nom,
      email:       c.email       ?? '',
      telephone:   c.telephone   ?? '',
      entreprise:  c.entreprise  ?? '',
      fonction:    c.fonction    ?? '',
      statut:      c.statut      ?? 'ACTIF',
      commentaire: c.commentaire ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingContact(null); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    // Validation locale : prénom ou nom obligatoire pour construire nomComplet
    if (!form.prenom.trim() && !form.nom.trim()) {
      alert('Le prénom ou le nom est obligatoire.');
      return;
    }

    const token = localStorage.getItem('crm-token');
    if (!token) { alert('Token manquant. Veuillez vous reconnecter.'); return; }

    // Convertit les champs UI en payload backend (nomComplet, commentaire, etc.)
    const payload = toContactPayload(form);

    setSubmitting(true);
    try {
      if (editingContact) {
        await updateContact(token, editingContact.id, payload);
      } else {
        await createContact(token, payload);
      }
      closeModal();
      loadContacts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handler suppression ───────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('crm-token');
    if (!token) return;
    setDeleting(true);
    try {
      await deleteContact(token, deleteTarget.id);
      setDeleteTarget(null);
      loadContacts();
    } catch (err) {
      console.error('Erreur suppression contact :', err);
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Utilitaires d'affichage ───────────────────────────────────────────────

  const statusBadge = (statut?: string) => {
    const isActive = statut === 'ACTIF' || statut === 'ACTIVE' || statut === 'Actif' || !statut;
    return {
      dot: isActive ? 'bg-emerald-500' : 'bg-slate-400',
      text: isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
      label: statut || 'Actif',
    };
  };

  const getInitials = (c: Contact) => {
    const parts = (c.nomComplet ?? '').trim().split(' ');
    const first = parts[0]?.charAt(0) ?? '';
    const last  = parts[1]?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const avatarColor = (id: number) => {
    const palettes = [
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600',
      'from-teal-500 to-emerald-600',
      'from-orange-400 to-rose-500',
      'from-indigo-500 to-blue-700',
    ];
    return palettes[id % palettes.length];
  };

  // ─── Pagination helper ─────────────────────────────────────────────────────

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--bg-border)] shadow-xl shadow-slate-900/5 transition-all space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">
              {isAdmin ? 'Administration' : 'Consultation'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Gestion des Contacts
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isAdmin
              ? "Annuaire centralisé des partenaires et contacts d'affaires — relié à la base de données PostgreSQL."
              : "Consultation de l'annuaire des contacts enregistrés dans la base de données."}
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-ajouter-contact"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-95 shrink-0"
          >
            <PlusIcon size={16} />
            <span>Ajouter un contact</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 shrink-0">
            Mode lecture seule
          </div>
        )}
      </div>

      {/* ── Recherche + filtres ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="search-contacts"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, email, entreprise…"
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === f.id
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--bg-border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--bg-border)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--bg-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-4">Nom complet</th>
              <th className="py-3.5 px-4">Entreprise</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Téléphone</th>
              <th className="py-3.5 px-4">Fonction</th>
              <th className="py-3.5 px-4">Statut</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bg-border)] text-xs font-medium text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-xs">Chargement des contacts depuis la base de données…</span>
                  </div>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 9v3m0 4h.01" />
                    </svg>
                    <span className="text-xs font-semibold">
                      {search || statusFilter !== 'ALL'
                        ? 'Aucun résultat pour votre recherche.'
                        : 'Aucun contact trouvé en base de données.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((c) => {
                const sb = statusBadge(c.statut);
                return (
                  <tr key={c.id} className="hover:bg-[var(--bg-surface-2)]/60 transition-colors">
                    {/* Nom complet avec avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarColor(c.id)} flex items-center justify-center text-white font-black text-[10px] shrink-0`}>
                          {getInitials(c)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{c.nomComplet}</p>
                        </div>
                      </div>
                    </td>
                    {/* Entreprise */}
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {c.entreprise ? (
                        <span className="inline-flex items-center gap-1">
                          <BuildingIcon size={12} className="text-slate-400 shrink-0" />
                          {c.entreprise}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic text-[10px]">—</span>
                      )}
                    </td>
                    {/* Email */}
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {c.email ? (
                        <span className="inline-flex items-center gap-1">
                          <MailIcon size={11} className="text-cyan-500 shrink-0" />
                          <a href={`mailto:${c.email}`} className="hover:text-cyan-500 transition-colors truncate max-w-[180px]">{c.email}</a>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic text-[10px]">—</span>
                      )}
                    </td>
                    {/* Téléphone */}
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {c.telephone ? (
                        <span className="inline-flex items-center gap-1">
                          <PhoneIcon size={11} className="text-cyan-500 shrink-0" />
                          {c.telephone}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic text-[10px]">—</span>
                      )}
                    </td>
                    {/* Fonction */}
                    <td className="py-3 px-4">
                      {c.fonction ? (
                        <span className="inline-flex items-center gap-1">
                          <UserBadgeIcon size={11} className="text-indigo-400 shrink-0" />
                          <span className="text-[var(--text-secondary)]">{c.fonction}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic text-[10px]">—</span>
                      )}
                    </td>
                    {/* Statut */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${sb.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                        {sb.label}
                      </span>
                    </td>
                    {/* Actions */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-contact-${c.id}`}
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <EditIcon size={15} />
                          </button>
                          <button
                            id={`btn-delete-contact-${c.id}`}
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination + compteur ── */}
      {!loading && totalElements > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Compteur */}
          <p className="text-[11px] text-[var(--text-muted)] font-medium">
            {totalElements} contact{totalElements > 1 ? 's' : ''} au total
            {totalPages > 1 && ` — page ${page + 1} / ${totalPages}`}
          </p>

          {/* Boutons de pages */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon size={15} />
              </button>

              {pageNumbers().map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-[var(--text-muted)]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-bold transition-all ${
                      page === n
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] border border-[var(--bg-border)]'
                    }`}
                  >
                    {(n as number) + 1}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALE CRÉATION / MODIFICATION
      ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">

            {/* Titre modal */}
            <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-4">
              <div>
                <h4 className="text-lg font-black text-[var(--text-primary)]">
                  {editingContact ? 'Modifier le contact' : 'Ajouter un contact'}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {editingContact
                    ? `Modification de la fiche de ${editingContact.nomComplet}`
                    : 'Renseignez les informations du nouveau contact SPAT.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Prénom <span className="text-rose-500">*</span></label>
                  <input
                    id="form-contact-prenom"
                    name="prenom"
                    type="text"
                    value={form.prenom ?? ''}
                    onChange={handleFormChange}
                    placeholder="Ex: Rova"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Nom <span className="text-rose-500">*</span></label>
                  <input
                    id="form-contact-nom"
                    name="nom"
                    type="text"
                    value={form.nom ?? ''}
                    onChange={handleFormChange}
                    placeholder="Ex: Harivelo"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Adresse Email</label>
                <div className="relative">
                  <MailIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="form-contact-email"
                    name="email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={handleFormChange}
                    placeholder="contact@exemple.mg"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Téléphone</label>
                <div className="relative">
                  <PhoneIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="form-contact-telephone"
                    name="telephone"
                    type="tel"
                    value={form.telephone ?? ''}
                    onChange={handleFormChange}
                    placeholder="+261 34 00 000 00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Entreprise / Fonction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Entreprise</label>
                  <input
                    id="form-contact-entreprise"
                    name="entreprise"
                    type="text"
                    value={form.entreprise ?? ''}
                    onChange={handleFormChange}
                    placeholder="Ex: MSC Madagascar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Fonction</label>
                  <input
                    id="form-contact-fonction"
                    name="fonction"
                    type="text"
                    value={form.fonction ?? ''}
                    onChange={handleFormChange}
                    placeholder="Ex: Directeur Commercial"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Statut</label>
                <select
                  id="form-contact-statut"
                  name="statut"
                  value={form.statut ?? 'ACTIF'}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

              {/* Commentaire */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                  Commentaire <span className="normal-case font-normal text-[var(--text-muted)]">(facultatif)</span>
                </label>
                <textarea
                  id="form-contact-commentaire"
                  name="commentaire"
                  rows={3}
                  value={form.commentaire ?? ''}
                  onChange={handleFormChange}
                  placeholder="Informations complémentaires sur ce contact…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
                />
              </div>

              {/* Actions formulaire */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--bg-border)]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="form-contact-submit"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Enregistrement…'
                    : editingContact ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALE CONFIRMATION SUPPRESSION
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center text-rose-600">
                <TrashIcon size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-[var(--text-primary)]">Supprimer le contact</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
                  Êtes-vous sûr de vouloir supprimer{' '}
                  <strong>{deleteTarget.nomComplet}</strong> ?
                  Cette action est <strong className="text-rose-500">irréversible</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-border)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
