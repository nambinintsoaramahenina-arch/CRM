'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PasswordRequest,
  fetchAllPasswordRequests,
  approvePasswordRequest,
  rejectPasswordRequest,
} from '@/services/passwordRequestService';

// ─── Icônes ───────────────────────────────────────────────────────────────────

const RefreshIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <polyline points="12 6 12 12 16 14" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const MailIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CopyIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUT_CONFIG = {
  PENDING:  { label: 'En attente',  badge: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  APPROVED: { label: 'Approuvée',  badge: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Rejetée',    badge: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
};

// ─── Composant Modal de confirmation ──────────────────────────────────────────

interface ConfirmModalProps {
  type: 'approve' | 'reject';
  request: PasswordRequest;
  onConfirm: (commentaire: string, customPassword?: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ type, request, onConfirm, onCancel, loading }) => {
  const [commentaire, setCommentaire] = useState(
    type === 'approve' ? 'Identité vérifiée — Approuvé par l\'administrateur' : ''
  );
  const [customPassword, setCustomPassword] = useState('');

  const isApprove = type === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isApprove ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
          }`}>
            {isApprove ? <CheckIcon size={18} /> : <XIcon size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-primary)]">
              {isApprove ? 'Approuver et envoyer le mot de passe' : 'Rejeter la demande'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {request.nomComplet} — {request.email} ({request.login})
            </p>
          </div>
        </div>

        {/* Description */}
        {isApprove && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
            ✅ En cliquant sur &quot;Approuver&quot;, le backend va :<br />
            <strong>1.</strong> Générer un mot de passe temporaire (ou utiliser celui saisi ci-dessous)<br />
            <strong>2.</strong> Le hasher avec BCrypt et l&apos;enregistrer en base de données<br />
            <strong>3.</strong> Envoyer un e-mail à <strong>{request.email}</strong> avec le mot de passe temporaire
          </div>
        )}

        {!isApprove && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            ⚠️ La demande sera marquée comme rejetée. Aucun e-mail ni modification de mot de passe ne sera effectué.
          </div>
        )}

        {/* Saisie d'un mot de passe personnalisé (optionnel) */}
        {isApprove && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
              <span>Mot de passe personnalisé (optionnel)</span>
              <span className="text-[10px] text-cyan-500 normal-case font-normal">Vide = Génération automatique</span>
            </label>
            <input
              id="modal-custom-password"
              type="text"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              placeholder="Laisser vide pour générer un mot de passe aléatoire sécurisé"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-mono"
            />
          </div>
        )}

        {/* Commentaire */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Commentaire {isApprove ? '(facultatif)' : '(recommandé)'}
          </label>
          <textarea
            id="modal-commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            placeholder={isApprove ? 'Ex : Identité vérifiée par RH, approuvé.' : 'Ex : Demande non reconnue ou motif invalide.'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--bg-border)]">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            id={`modal-${type}-confirm`}
            onClick={() => onConfirm(commentaire, customPassword)}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
              isApprove
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400'
            }`}
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Envoi en cours…</span>
              </>
            ) : (
              <>
                {isApprove ? <CheckIcon size={13} /> : <XIcon size={13} />}
                <span>{isApprove ? 'Approuver / Envoyer le mot de passe' : 'Rejeter la demande'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de résultat d'approbation (affiche le mot de passe temporaire) ─────

interface ApproveResultModalProps {
  result: {
    message: string;
    userEmail: string;
    temporaryPassword?: string;
    resetToken?: string;
    resetLink?: string;
    userId?: number;
  };
  onClose: () => void;
}

const ApproveResultModal: React.FC<ApproveResultModalProps> = ({ result, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback silencieux
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500">
            <CheckIcon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-primary)]">
              ✅ Demande approuvée avec succès
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              L&apos;e-mail avec le mot de passe temporaire a été envoyé à <strong>{result.userEmail}</strong>
            </p>
          </div>
        </div>

        {/* Informations générées */}
        <div className="space-y-3">
          {/* Mot de passe temporaire */}
          {result.temporaryPassword && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Mot de passe temporaire
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-sm font-mono font-bold text-[var(--text-primary)] tracking-wider">
                  {result.temporaryPassword}
                </code>
                <button
                  onClick={() => handleCopy(result.temporaryPassword!, 'password')}
                  className="shrink-0 p-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:border-emerald-500 text-[var(--text-secondary)] hover:text-emerald-500 transition-all"
                  title="Copier le mot de passe"
                >
                  {copiedField === 'password' ? <CheckIcon size={14} className="text-emerald-500" /> : <CopyIcon size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Token */}
          {result.resetToken && (
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
              <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Token de réinitialisation
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[11px] font-mono text-[var(--text-secondary)] break-all">
                  {result.resetToken}
                </code>
                <button
                  onClick={() => handleCopy(result.resetToken!, 'token')}
                  className="shrink-0 p-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:border-cyan-500 text-[var(--text-secondary)] hover:text-cyan-500 transition-all"
                  title="Copier le token"
                >
                  {copiedField === 'token' ? <CheckIcon size={14} className="text-emerald-500" /> : <CopyIcon size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Lien de réinitialisation */}
          {result.resetLink && (
            <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20 space-y-2">
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Lien de réinitialisation
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[10px] font-mono text-[var(--text-secondary)] break-all">
                  {result.resetLink}
                </code>
                <button
                  onClick={() => handleCopy(result.resetLink!, 'link')}
                  className="shrink-0 p-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:border-cyan-500 text-[var(--text-secondary)] hover:text-cyan-500 transition-all"
                  title="Copier le lien"
                >
                  {copiedField === 'link' ? <CheckIcon size={14} className="text-emerald-500" /> : <CopyIcon size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
          <span className="shrink-0 font-bold mt-0.5">📧</span>
          <span>
            L&apos;utilisateur a reçu cet e-mail avec le mot de passe temporaire. Il pourra également utiliser le token pour définir son propre mot de passe sur la page de réinitialisation.
          </span>
        </div>

        {/* Fermer */}
        <div className="flex justify-end pt-2 border-t border-[var(--bg-border)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-md transition-all active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function PasswordRequestsPage() {
  const [requests, setRequests]       = useState<PasswordRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<FilterType>('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [modal, setModal]             = useState<{
    type: 'approve' | 'reject';
    request: PasswordRequest;
  } | null>(null);
  const [approveResult, setApproveResult] = useState<{
    message: string;
    userEmail: string;
    temporaryPassword?: string;
    resetToken?: string;
    resetLink?: string;
    userId?: number;
  } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('crm-token') ?? '';
    try {
      const data = await fetchAllPasswordRequests(token);
      setRequests(data);
    } catch {
      showToast('error', 'Impossible de charger les demandes. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter((r) => filter === 'ALL' || r.statut === filter);
  const pendingCount = requests.filter((r) => r.statut === 'PENDING').length;

  const handleAction = async (commentaire: string, customPassword?: string) => {
    if (!modal) return;
    const token = localStorage.getItem('crm-token') ?? '';
    setActionLoading(true);
    try {
      if (modal.type === 'approve') {
        const result = await approvePasswordRequest(token, modal.request.id, commentaire, customPassword);
        // Afficher le modal de résultat avec le mot de passe temporaire et le token
        setApproveResult({
          message: result.message,
          userEmail: result.userEmail,
          temporaryPassword: result.temporaryPassword,
          resetToken: result.resetToken,
          resetLink: result.resetLink,
        });
        showToast('success', `✅ Demande approuvée — mot de passe envoyé à ${modal.request.email}`);
      } else {
        await rejectPasswordRequest(token, modal.request.id, commentaire);
        showToast('success', `Demande de ${modal.request.nomComplet} rejetée.`);
      }
      setModal(null);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du traitement.";
      showToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--bg-border)] shadow-xl shadow-slate-900/5 transition-all space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold border flex items-center gap-3 transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-200'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-700 dark:text-rose-200'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Modal de confirmation */}
      {modal && (
        <ConfirmModal
          type={modal.type}
          request={modal.request}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Modal de résultat d'approbation */}
      {approveResult && (
        <ApproveResultModal
          result={approveResult}
          onClose={() => setApproveResult(null)}
        />
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Administration
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Demandes de réinitialisation
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Gérez les demandes de mot de passe oublié soumises par les utilisateurs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              <ClockIcon size={12} />
              {pendingCount} en attente
            </span>
          )}
          <button
            id="btn-refresh-requests"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:text-[var(--text-primary)] hover:border-cyan-500 transition-all disabled:opacity-50"
          >
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {([
          { id: 'ALL',      label: 'Toutes',       count: requests.length },
          { id: 'PENDING',  label: 'En attente',   count: requests.filter(r => r.statut === 'PENDING').length },
          { id: 'APPROVED', label: 'Approuvées',   count: requests.filter(r => r.statut === 'APPROVED').length },
          { id: 'REJECTED', label: 'Rejetées',     count: requests.filter(r => r.statut === 'REJECTED').length },
        ] as { id: FilterType; label: string; count: number }[]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === f.id
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--bg-border)]'
            }`}
          >
            {f.label}
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
              filter === f.id ? 'bg-white/20' : 'bg-[var(--bg-border)]'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--bg-border)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--bg-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-4">Utilisateur</th>
              <th className="py-3.5 px-4">Login / Matricule</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Rôle</th>
              <th className="py-3.5 px-4">Date demande</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bg-border)] text-xs font-medium text-[var(--text-primary)]">

            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <span className="text-xs">Chargement des demandes…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <ClockIcon size={32} className="opacity-30" />
                    <span className="text-xs font-semibold">
                      {filter === 'ALL'
                        ? 'Aucune demande de réinitialisation pour le moment.'
                        : `Aucune demande avec le statut "${STATUT_CONFIG[filter]?.label}".`}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const cfg = STATUT_CONFIG[r.statut] ?? STATUT_CONFIG.PENDING;
                return (
                  <tr key={r.id} className="hover:bg-[var(--bg-surface-2)]/60 transition-colors">

                    {/* Utilisateur */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {r.nomComplet?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{r.nomComplet}</span>
                      </div>
                    </td>

                    {/* Login */}
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {r.login}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <MailIcon size={11} className="text-cyan-500 shrink-0" />
                        {r.email}
                      </span>
                    </td>

                    {/* Rôle */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300">
                        {r.role}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] text-[11px]">
                      {formatDate(r.dateDemande)}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {r.commentaireAdmin && r.statut !== 'PENDING' && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 italic max-w-[160px] truncate" title={r.commentaireAdmin}>
                          {r.commentaireAdmin}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {r.statut === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* Approuver et envoyer */}
                          <button
                            id={`btn-approve-${r.id}`}
                            onClick={() => setModal({ type: 'approve', request: r })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-sm transition-all active:scale-95"
                            title="Approuver la demande — Génère le mot de passe, l'enregistre en base et envoie l'e-mail"
                          >
                            <CheckIcon size={12} />
                            Approuver / Envoyer
                          </button>
                          {/* Rejeter */}
                          <button
                            id={`btn-reject-${r.id}`}
                            onClick={() => setModal({ type: 'reject', request: r })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/70 transition-all active:scale-95"
                            title="Rejeter la demande"
                          >
                            <XIcon size={12} />
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)] italic">
                          {formatDate(r.dateTraitement)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Compteur */}
      {!loading && filtered.length > 0 && (
        <p className="text-[11px] text-[var(--text-muted)] font-medium px-1">
          {filtered.length} demande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          {filter !== 'ALL' && ` · ${requests.length} au total`}
        </p>
      )}
    </div>
  );
}
