"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  TasksIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  SearchIcon,
  CloseIcon,
} from '@/components/ui/Icons';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  patchTaskStatus,
  computeTaskStats,
  fetchAllUsersForSelect,
  fetchAllContactsForSelect,
  fetchAllInteractionsForSelect,
  formatUserOptionLabel,
  formatInteractionOptionLabel,
  type Task,
  type UserOption,
  type ContactOption,
  type InteractionOption,
} from '@/services/taskService';

// ─── Icônes locales ────────────────────────────────────────────────────────────

const PlusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ChevronIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LinkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// ─── Constantes de configuration ────────────────────────────────────────────────

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  EN_ATTENTE: { label: 'En attente',  color: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200' },
  EN_COURS:   { label: 'En cours',    color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  TERMINE:    { label: 'Terminée',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  TERMINEE:   { label: 'Terminée',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ANNULE:     { label: 'Annulée',     color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200' },
  ANNULEE:    { label: 'Annulée',     color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200' },
};

const STATUT_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS',   label: 'En cours' },
  { value: 'TERMINEE',   label: 'Terminée' },
  { value: 'ANNULEE',    label: 'Annulée' },
];

const TYPE_CONFIG: Record<string, string> = {
  APPEL:       '📞 Appel',
  EMAIL:       '✉️ Email',
  REUNION:     '🤝 Réunion',
  RENDEZ_VOUS: '📅 Rendez-vous',
  SUIVI:       '🔍 Suivi',
  RELANCE:     '🔔 Relance',
  VISITE:      '🏢 Visite',
  AUTRE:       '📋 Autre',
};

const EMPTY_FORM = {
  titre: '',
  description: '',
  dateTache: '',
  typeTache: 'AUTRE',
  statut: 'EN_ATTENTE',
  utilisateurId: '',
  contactId: '',
  interactionId: '',
};

// ─── Composant Badge Statut ──────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut?: string }) {
  const cfg = STATUT_CONFIG[statut ?? ''] ?? { label: statut ?? '—', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
}

// ─── Composant Modale ────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl shadow-slate-900/20 animate-fade-up">
        {/* Header modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bg-border)]">
          <h3 className="text-base font-black text-[var(--text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {/* Contenu */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks]                           = useState<Task[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState('');
  const [filterStatut, setFilterStatut]             = useState('');
  const [filterUser, setFilterUser]                 = useState('');
  const [search, setSearch]                         = useState('');
  const [modalOpen, setModalOpen]                   = useState(false);
  const [editTask, setEditTask]                     = useState<Task | null>(null);
  const [form, setForm]                             = useState(EMPTY_FORM);
  const [saving, setSaving]                         = useState(false);
  const [saveError, setSaveError]                   = useState('');
  const [deleteConfirm, setDeleteConfirm]           = useState<number | null>(null);
  const [deleting, setDeleting]                     = useState(false);
  const [statusDropdown, setStatusDropdown]         = useState<number | null>(null);
  const [userOptions, setUserOptions]               = useState<UserOption[]>([]);
  const [contactOptions, setContactOptions]         = useState<ContactOption[]>([]);
  const [interactionOptions, setInteractionOptions] = useState<InteractionOption[]>([]);

  // ─── Chargement des tâches réelles depuis PostgreSQL via /api/tasks ───────────

  const loadTasks = useCallback(async () => {
    const token = localStorage.getItem('crm-token') || '';
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await fetchTasks(token);
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement des tâches';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Chargement des données réelles (utilisateurs, contacts, interactions) ────

  useEffect(() => {
    loadTasks();
    const token = localStorage.getItem('crm-token') || '';
    if (token) {
      // 1. Utilisateurs réels (/api/users)
      fetchAllUsersForSelect(token)
        .then(setUserOptions)
        .catch(() => {});

      // 2. Contacts réels (/api/contacts)
      fetchAllContactsForSelect(token)
        .then(setContactOptions)
        .catch(() => {});

      // 3. Interactions réelles (/api/interactions)
      fetchAllInteractionsForSelect(token)
        .then(setInteractionOptions)
        .catch(() => {});
    }
  }, [loadTasks]);

  // ─── Interactions disponibles pour le contact sélectionné ────────────────────

  const availableInteractions = useMemo(() => {
    if (!form.contactId) return [];
    const contactIdNum = Number(form.contactId);
    return interactionOptions.filter((it) => it.contactId === contactIdNum);
  }, [form.contactId, interactionOptions]);

  // ─── Statistiques ───────────────────────────────────────────────────────────

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  // ─── Filtrage + recherche ──────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatut = !filterStatut || t.statut === filterStatut;
      const uid = String(t.utilisateurId ?? t.utilisateur?.id ?? '');
      const matchUser = !filterUser || uid === filterUser;
      const matchSearch =
        !search ||
        t.titre.toLowerCase().includes(search.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.contactNomComplet ?? t.contact?.nomComplet ?? '').toLowerCase().includes(search.toLowerCase());
      return matchStatut && matchUser && matchSearch;
    });
  }, [tasks, filterStatut, filterUser, search]);

  // Liste unique d'utilisateurs pour le filtre déroulant
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      const uid = t.utilisateurId ?? t.utilisateur?.id;
      if (uid && !map.has(String(uid))) {
        const u = userOptions.find((uo) => uo.id === uid);
        const label = u ? formatUserOptionLabel(u) : (t.utilisateurNomComplet ?? t.utilisateur?.nomComplet ?? `Utilisateur #${uid}`);
        map.set(String(uid), label);
      }
    });
    return Array.from(map.entries());
  }, [tasks, userOptions]);

  // ─── Gestion du formulaire (création / modification) ──────────────────────

  // Helper de formatage du type d'interaction
  const formatInteractionTypeOnly = (type?: string) => {
    if (!type) return '—';
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
    const t = type.toUpperCase();
    return TYPE_MAP[t] || (t.charAt(0) + t.slice(1).toLowerCase());
  };

  // Interaction liée active (calculée automatiquement au changement de contact)
  const currentInteraction = useMemo(() => {
    if (!form.contactId) return null;
    const cid = Number(form.contactId);
    if (form.interactionId) {
      const found = interactionOptions.find((it) => it.id === Number(form.interactionId) && it.contactId === cid);
      if (found) return found;
    }
    const forContact = interactionOptions.filter((it) => it.contactId === cid);
    if (forContact.length === 0) return null;
    return [...forContact].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    })[0];
  }, [form.contactId, form.interactionId, interactionOptions]);

  const openCreate = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    const dateVal = task.date || task.dateTache;
    const initialContactId = String(task.contactId ?? task.contact?.id ?? '');
    let initialInteractionId = String(task.interactionId ?? task.interaction?.id ?? '');

    // Si un contact est lié mais pas d'interaction explicite, on lie la dernière interaction de ce contact
    if (initialContactId && !initialInteractionId) {
      const cid = Number(initialContactId);
      const forContact = interactionOptions.filter((it) => it.contactId === cid);
      if (forContact.length > 0) {
        const latest = [...forContact].sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        })[0];
        initialInteractionId = String(latest.id);
      }
    }

    setForm({
      titre:          task.titre        ?? '',
      description:    task.description  ?? '',
      dateTache:      dateVal ? dateVal.slice(0, 10) : '',
      typeTache:      task.typeTache    ?? 'AUTRE',
      statut:         task.statut       ?? 'EN_ATTENTE',
      utilisateurId:  String(task.utilisateurId ?? task.utilisateur?.id ?? ''),
      contactId:      initialContactId,
      interactionId:  initialInteractionId,
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Liaison automatique Contact <-> Interaction : dès qu'un contact est sélectionné,
  // on récupère/filtre automatiquement sa dernière interaction liée
  const handleContactChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContactId = e.target.value;
    if (!newContactId) {
      setForm((prev) => ({
        ...prev,
        contactId: '',
        interactionId: '',
      }));
      return;
    }

    const cid = Number(newContactId);
    let forContact = interactionOptions.filter((it) => it.contactId === cid);

    // Si pas encore en cache local, chargement via l'API
    if (forContact.length === 0) {
      try {
        const token = localStorage.getItem('crm-token') || '';
        if (token) {
          const fetched = await fetchAllInteractionsForSelect(token, cid);
          if (fetched && fetched.length > 0) {
            forContact = fetched;
            setInteractionOptions((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const newOnes = fetched.filter((i) => !existingIds.has(i.id));
              return [...prev, ...newOnes];
            });
          }
        }
      } catch {
        // ignore
      }
    }

    const latest = forContact.length > 0
      ? [...forContact].sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        })[0]
      : null;

    setForm((prev) => ({
      ...prev,
      contactId: newContactId,
      interactionId: latest ? String(latest.id) : '',
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      setSaveError('Le titre est obligatoire.');
      return;
    }
    if (!form.utilisateurId) {
      setSaveError("Veuillez sélectionner un utilisateur assigné.");
      return;
    }

    const token = localStorage.getItem('crm-token') || '';
    setSaving(true);
    setSaveError('');
    try {
      const resolvedInteractionId = currentInteraction
        ? currentInteraction.id
        : (form.interactionId ? Number(form.interactionId) : undefined);

      const payload: any = {
        titre:          form.titre.trim(),
        description:    form.description || undefined,
        date:           form.dateTache ? (form.dateTache.includes('T') ? form.dateTache : `${form.dateTache}T00:00:00`) : undefined,
        dateTache:      form.dateTache || undefined,
        typeTache:      form.typeTache || undefined,
        statut:         form.statut    || 'EN_ATTENTE',
        utilisateurId:  form.utilisateurId ? Number(form.utilisateurId) : undefined,
        contactId:      form.contactId     ? Number(form.contactId)     : undefined,
        interactionId:  resolvedInteractionId,
        // Support direct pour snake_case et clés étrangères PostgreSQL
        interaction_id: resolvedInteractionId,
        contact_id:     form.contactId     ? Number(form.contactId)     : undefined,
        utilisateur_id: form.utilisateurId ? Number(form.utilisateurId) : undefined,
      };

      if (editTask) {
        await updateTask(token, editTask.id, payload);
      } else {
        await createTask(token, payload);
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Suppression ──────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('crm-token') || '';
    setDeleting(true);
    try {
      await deleteTask(token, id);
      setDeleteConfirm(null);
      await loadTasks();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  // ─── Changement rapide de statut ──────────────────────────────────────────

  const handleStatusChange = async (id: number, statut: string) => {
    const token = localStorage.getItem('crm-token') || '';
    setStatusDropdown(null);
    try {
      await patchTaskStatus(token, id, statut);
      await loadTasks();
    } catch {
      // silent
    }
  };

  // ─── Formatage date ───────────────────────────────────────────────────────

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  // ─── Rendu ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12 animate-fade-up">
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">Tableau de bord</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">Gestion des tâches</span>
      </div>

      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <TasksIcon size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Gestion des Tâches</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {loading ? 'Chargement…' : `${tasks.length} tâche${tasks.length !== 1 ? 's' : ''} au total (PostgreSQL)`}
            </p>
          </div>
        </div>
        <button
          id="create-task-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
        >
          <PlusIcon size={16} />
          Créer une tâche
        </button>
      </div>

      {/* ── Mini-Dashboard Statistiques (Calculé en temps réel) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,     icon: TasksIcon,         color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       bar: 'bg-blue-500',    pct: 100 },
          { label: 'En attente', value: stats.enAttente,  icon: ClockIcon,         color: 'text-sky-600',     bg: 'bg-sky-50 border-sky-200',         bar: 'bg-sky-500',     pct: stats.total ? Math.round(stats.enAttente / stats.total * 100) : 0 },
          { label: 'En cours',   value: stats.enCours,    icon: AlertCircleIcon,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     bar: 'bg-amber-500',   pct: stats.total ? Math.round(stats.enCours   / stats.total * 100) : 0 },
          { label: 'Terminées',  value: stats.termine,    icon: CheckCircleIcon,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', pct: stats.total ? Math.round(stats.termine   / stats.total * 100) : 0 },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} bg-[var(--bg-surface)] hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{s.label}</span>
                <Icon size={16} className={s.color} />
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              <div className="w-full bg-slate-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full ${s.bar} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{s.pct}% du total</p>
            </div>
          );
        })}
      </div>

      {/* ── Filtres + Recherche ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, description ou contact…"
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Filtre Statut */}
        <div className="relative">
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="">Tous les statuts</option>
            {STATUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Filtre Utilisateur */}
        <div className="relative">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all cursor-pointer min-w-[170px]"
          >
            <option value="">Tous les utilisateurs</option>
            {uniqueUsers.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <ChevronIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Reset filtres */}
        {(filterStatut || filterUser || search) && (
          <button
            onClick={() => { setFilterStatut(''); setFilterUser(''); setSearch(''); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-300 transition-colors"
          >
            <CloseIcon size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Tableau des tâches ── */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-[var(--card-shadow)] overflow-hidden">
        {error && (
          <div className="p-4 m-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <span>⚠</span> {error}
            <button onClick={loadTasks} className="ml-auto underline">Réessayer</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface-2)] flex items-center justify-center">
                <TasksIcon size={24} className="text-[var(--text-muted)]" />
              </div>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Aucune tâche trouvée</p>
            <p className="text-xs text-[var(--text-muted)]">Modifiez vos filtres ou créez une nouvelle tâche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--bg-border)]">
                  {['Titre', 'Type', 'Date', 'Statut', 'Utilisateur', 'Contact', 'Interaction liée', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bg-border)]">
                {filteredTasks.map((task) => {
                  const assignedUser = userOptions.find(
                    (u) => u.id === task.utilisateurId || u.id === task.utilisateur?.id
                  );
                  const userDisplay = assignedUser
                    ? formatUserOptionLabel(assignedUser)
                    : (task.utilisateurNomComplet ?? task.utilisateur?.nomComplet ?? task.utilisateurLogin ?? (task.utilisateurId ? `#${task.utilisateurId}` : '—'));

                  const contactDisplay = task.contactNomComplet ?? task.contact?.nomComplet ?? (task.contactId ? `#${task.contactId}` : '—');
                  const linkedInteraction = interactionOptions.find((it) => it.id === task.interactionId);

                  return (
                    <tr key={task.id} className="group hover:bg-[var(--bg-surface-2)] transition-colors">
                      {/* Titre + Description */}
                      <td className="px-4 py-3 max-w-[100px]">
                        <p className="font-bold text-[var(--text-primary)] truncate" title={task.titre}>{task.titre}</p>
                        {task.description && (
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5" title={task.description}>{task.description}</p>
                        )}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                          {TYPE_CONFIG[task.typeTache ?? ''] ?? task.typeTache ?? '—'}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">
                        {fmtDate(task.date || task.dateTache)}
                      </td>
                      {/* Statut avec dropdown rapide */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setStatusDropdown(statusDropdown === task.id ? null : task.id)}
                            className="flex items-center gap-1 group/statut"
                            title="Changer le statut rapidement"
                          >
                            <StatutBadge statut={task.statut} />
                            <ChevronIcon size={10} className="text-[var(--text-muted)] group-hover/statut:text-cyan-500 transition-colors" />
                          </button>
                          {statusDropdown === task.id && (
                            <div className="absolute top-full left-0 mt-1 z-20 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl shadow-xl min-w-[140px] py-1 animate-fade-up">
                              {STATUT_OPTIONS.map((opt) => {
                                const cfg = STATUT_CONFIG[opt.value] || { color: 'text-slate-500' };
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleStatusChange(task.id, opt.value)}
                                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[var(--bg-surface-2)] transition-colors ${task.statut === opt.value ? cfg.color : 'text-[var(--text-secondary)]'}`}
                                  >
                                    {opt.label} {task.statut === opt.value && '✓'}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Utilisateur */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <UsersIcon size={12} className="text-[var(--text-muted)] shrink-0" />
                          <span className="text-[var(--text-secondary)] truncate max-w-[120px]" title={userDisplay}>
                            {userDisplay}
                          </span>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ContactsIcon size={12} className="text-[var(--text-muted)] shrink-0" />
                          <span className="text-[var(--text-secondary)] truncate max-w-[120px]" title={contactDisplay}>
                            {contactDisplay}
                          </span>
                        </div>
                      </td>
                      {/* Interaction liée */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.interactionId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            <LinkIcon size={10} />
                            {linkedInteraction
                              ? formatInteractionOptionLabel(linkedInteraction.type, linkedInteraction.date)
                              : `Interaction #${task.interactionId}`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      {/* Actions */}
                    <td className="px-4 py-3">
                    {}
                      <div className="flex items-center gap-1 transition-opacity">
                       {/* Modifier */}
                        <button
                          onClick={() => openEdit(task)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        >
                        <EditIcon size={14} />
                        </button>
                          {/* Supprimer */}
                        <button
                            onClick={() => setDeleteConfirm(task.id)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                        <TrashIcon size={14} />
                      </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de tableau */}
        {!loading && filteredTasks.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--bg-border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>{filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''} affichée{filteredTasks.length !== 1 ? 's' : ''}</span>
            {filteredTasks.length < tasks.length && (
              <span className="text-amber-600 font-semibold">Filtre actif — {tasks.length - filteredTasks.length} masquée{tasks.length - filteredTasks.length > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Modale Créer / Modifier ── */}
      {modalOpen && (
        <Modal title={editTask ? `Modifier la tâche #${editTask.id}` : 'Créer une nouvelle tâche'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-5" id="task-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Titre */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Titre <span className="text-rose-500">*</span>
                </label>
                <input
                  id="task-titre"
                  name="titre"
                  value={form.titre}
                  onChange={handleFormChange}
                  placeholder="Titre de la tâche"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
                <textarea
                  id="task-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Description détaillée (optionnel)"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all resize-none"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date de la tâche</label>
                <input
                  id="task-date"
                  name="dateTache"
                  type="date"
                  value={form.dateTache}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
              {/* Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Type de tâche</label>
                <select
                  id="task-type"
                  name="typeTache"
                  value={form.typeTache}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                >
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Statut</label>
                <select
                  id="task-statut"
                  name="statut"
                  value={form.statut}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                >
                  {STATUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* ── Instruction 3 : Sélecteur "Utilisateur assigné" ── */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <UsersIcon size={11} /> Utilisateur assigné <span className="text-rose-500">*</span>
                </label>
                <select
                  id="task-utilisateur"
                  name="utilisateurId"
                  value={form.utilisateurId}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option value="">-- Sélectionner un utilisateur --</option>
                  {userOptions.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {formatUserOptionLabel(u)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact associé */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <ContactsIcon size={11} /> Contact associé
                </label>
                <select
                  id="task-contact"
                  name="contactId"
                  value={form.contactId}
                  onChange={handleContactChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option value="">-- Aucun contact (optionnel) --</option>
                  {contactOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nomComplet}{c.entreprise ? ` — ${c.entreprise}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Liaison automatique Contact <-> Interaction (Champs informatifs en lecture seule) ── */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <InteractionsIcon size={12} /> Type d&apos;interaction
                  </span>
                  {currentInteraction && (
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                      Liée auto (#{currentInteraction.id})
                    </span>
                  )}
                </label>
                <input
                  id="task-interaction-type"
                  type="text"
                  readOnly
                  disabled
                  value={form.contactId ? (currentInteraction ? formatInteractionTypeOnly(currentInteraction.type) : 'Aucune interaction trouvée') : '—'}
                  placeholder="Sélectionnez un contact pour lier l'interaction"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)]/60 text-[var(--text-primary)] text-sm cursor-not-allowed select-none font-medium opacity-90"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon size={12} /> Date de l&apos;interaction
                </label>
                <input
                  id="task-interaction-date"
                  type="text"
                  readOnly
                  disabled
                  value={form.contactId ? (currentInteraction && currentInteraction.date ? fmtDate(currentInteraction.date) : '—') : '—'}
                  placeholder="Date de la dernière interaction"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)]/60 text-[var(--text-primary)] text-sm cursor-not-allowed select-none font-medium opacity-90"
                />
              </div>
            </div>

            {/* Erreur sauvegarde */}
            {saveError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
                <span>⚠</span> {saveError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--bg-border)]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--bg-border)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="task-save-btn"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde…</>
                ) : (
                  <><CheckCircleIcon size={14} /> {editTask ? 'Mettre à jour' : 'Créer la tâche'}</>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modale Confirmation Suppression ── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <TrashIcon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text-primary)]">Supprimer la tâche</h4>
                <p className="text-xs text-[var(--text-secondary)]">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Voulez-vous vraiment supprimer la tâche <strong className="text-[var(--text-primary)]">#{deleteConfirm}</strong> ?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-[var(--bg-border)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                Annuler
              </button>
              <button
                id="task-delete-confirm-btn"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {deleting ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Suppression…</> : <><TrashIcon size={12} /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fermeture dropdown statut au clic extérieur */}
      {statusDropdown !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(null)} />
      )}
    </div>
  );
}
