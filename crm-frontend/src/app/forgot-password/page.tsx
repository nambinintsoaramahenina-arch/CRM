"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpatLogo } from '@/components/ui/SpatLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { submitForgotPassword } from '@/services/passwordRequestService';

/**
 * Page "Mot de passe oublié" — SPAT CRM
 * Workflow : soumission → validation admin → envoi e-mail par l'admin (24-48h)
 * Après réception du token par e-mail, l'utilisateur peut définir son nouveau mot de passe ici.
 */

// ─── Icônes ───────────────────────────────────────────────────────────────────

const ClockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="48" height="48" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldKeyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="2" />
    <path d="M12 13v3" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="48" height="48" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  // Étape 1 : Soumission de la demande
  const [identifiant, setIdentifiant] = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const [error, setError]             = useState('');

  // Étape 2 : Réinitialisation avec token (après approbation admin)
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken]       = useState('');
  const [nouveauMdp, setNouveauMdp]       = useState('');
  const [confirmMdp, setConfirmMdp]       = useState('');
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetSuccess, setResetSuccess]   = useState(false);
  const [resetError, setResetError]       = useState('');

  // Initialiser le token depuis l'URL si présent
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setShowResetForm(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifiant.trim()) {
      setError('Veuillez saisir votre matricule ou votre email.');
      return;
    }

    setLoading(true);
    try {
      const data = await submitForgotPassword(identifiant.trim());
      setAlreadyPending(data.alreadyPending ?? false);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : "Une erreur est survenue. Veuillez réessayer ou contacter l'administrateur.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetToken.trim()) {
      setResetError('Le token de réinitialisation est obligatoire. Vérifiez votre e-mail.');
      return;
    }
    if (!nouveauMdp.trim()) {
      setResetError('Le nouveau mot de passe est obligatoire.');
      return;
    }
    if (nouveauMdp.trim().length < 6) {
      setResetError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setResetError('Les mots de passe ne correspondent pas.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), nouveauMdp: nouveauMdp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Erreur HTTP ${res.status}`);
      }
      setResetSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation.';
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300">

      {/* ── Colonne gauche : Image ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative overflow-hidden bg-slate-900">
        <Image
          src="/images/ai-port-login.jpg"
          alt="Port autonome de Toamasina — SPAT CRM"
          fill
          className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-page)] opacity-80 lg:block hidden" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <SpatLogo variant="dark" size="lg" />
          </div>
          <div className="max-w-md pb-6 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Récupération de compte
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Réinitialisation validée par l&apos;administrateur
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Votre demande sera examinée et traitée par l&apos;administrateur SPAT. Un nouveau mot de passe vous sera communiqué par e-mail sous 24 à 48h.
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite : Formulaire ── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen">

        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-[var(--bg-border)]">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors group"
          >
            <ArrowRightIcon size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Retour à la connexion</span>
          </Link>
          <ThemeToggle variant="light" />
        </div>

        {/* Bloc principal */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <div className="w-full max-w-md space-y-8 bg-[var(--bg-surface)] p-8 sm:p-10 rounded-2xl border border-[var(--bg-border)] shadow-xl shadow-slate-900/5">

            {/* ─── Formulaire de réinitialisation avec token (après approbation admin) ─── */}
            {showResetForm ? (
              resetSuccess ? (
                /* Succès de la réinitialisation */
                <div className="text-center space-y-5">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
                      <CheckCircleIcon className="text-emerald-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      Mot de passe modifié !
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99]"
                  >
                    <ArrowRightIcon size={16} className="rotate-180" />
                    <span>Se connecter</span>
                  </Link>
                </div>
              ) : (
                /* Formulaire de saisie du nouveau mot de passe */
                <>
                  <div className="text-center space-y-3">
                    <div className="flex justify-center mb-2">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                        <LockIcon className="text-emerald-500" />
                      </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                      Nouveau mot de passe
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Saisissez votre nouveau mot de passe ci-dessous pour le mettre à jour.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5" id="reset-password-form">

                    {/* Champ token */}
                    <div className="space-y-2">
                      <label
                        htmlFor="reset-token"
                        className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                      >
                        Token de réinitialisation
                      </label>
                      <input
                        id="reset-token"
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Collez le token reçu par e-mail"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono text-xs"
                        required
                      />
                    </div>

                    {/* Nouveau mot de passe */}
                    <div className="space-y-2">
                      <label
                        htmlFor="new-password"
                        className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                      >
                        Nouveau mot de passe
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={nouveauMdp}
                        onChange={(e) => setNouveauMdp(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                        required
                        minLength={6}
                        autoFocus
                      />
                    </div>

                    {/* Confirmation */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirm-password"
                        className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                      >
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmMdp}
                        onChange={(e) => setConfirmMdp(e.target.value)}
                        placeholder="Ressaisissez votre mot de passe"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Erreur */}
                    {resetError && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                        <span>⚠</span>
                        <span>{resetError}</span>
                      </div>
                    )}

                    {/* Bouton */}
                    <button
                      type="submit"
                      id="reset-password-submit-btn"
                      disabled={resetLoading}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enregistrement…</span>
                        </>
                      ) : (
                        <>
                          <LockIcon className="w-4 h-4" />
                          <span>Enregistrer le nouveau mot de passe</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Lien pour revenir à la demande */}
                  <div className="text-center">
                    <button
                      onClick={() => { setShowResetForm(false); setResetError(''); }}
                      className="text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <ArrowRightIcon size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Faire une nouvelle demande
                    </button>
                  </div>
                </>
              )

            ) : submitted ? (
              /* ─── Confirmation de la demande envoyée ─── */
              <div className="text-center space-y-5">

                {/* Icône */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${
                    alreadyPending
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30'
                  }`}>
                    <ClockIcon className={alreadyPending ? 'text-amber-500' : 'text-emerald-500'} />
                  </div>
                </div>

                {/* Titre */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    {alreadyPending ? 'Demande déjà en cours' : 'Demande enregistrée !'}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {alreadyPending
                      ? <>Une demande est déjà <strong className="text-amber-600 dark:text-amber-400">en attente de validation</strong> pour votre compte.</>
                      : <>Votre demande a bien été transmise à l&apos;administrateur SPAT pour traitement. Vous recevrez un <strong className="text-emerald-600 dark:text-emerald-400">e-mail avec un mot de passe temporaire</strong> sous 24 à 48h.</>
                    }
                  </p>
                </div>

                {/* Info de sécurité */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-[var(--text-secondary)] text-xs text-left">
                  <span className="text-slate-400 shrink-0 font-bold mt-0.5">🔒</span>
                  <span>Après réception du mot de passe temporaire par e-mail, vous pourrez revenir ici pour définir votre propre mot de passe.</span>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <button
                    onClick={() => { setShowResetForm(true); setSubmitted(false); }}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.99]"
                  >
                    <LockIcon className="w-4 h-4" />
                    <span>J&apos;ai reçu mon token — Définir mon mot de passe</span>
                  </button>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] hover:text-[var(--text-primary)] hover:border-cyan-500 transition-all active:scale-[0.99]"
                  >
                    <ArrowRightIcon size={16} className="rotate-180" />
                    <span>Retour à la connexion</span>
                  </Link>
                </div>
              </div>

            ) : (
              /* ─── Formulaire de demande ─── */
              <>
                {/* Titre */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center">
                      <ShieldKeyIcon className="text-cyan-500" />
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    Mot de passe oublié
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Saisissez votre matricule ou e-mail. Votre demande sera validée par l&apos;administrateur SPAT.
                  </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-5" id="forgot-password-form">

                  {/* Champ identifiant */}
                  <div className="space-y-2">
                    <label
                      htmlFor="forgot-matricule"
                      className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                    >
                      Matricule ou Email
                    </label>
                    <input
                      id="forgot-matricule"
                      type="text"
                      value={identifiant}
                      onChange={(e) => setIdentifiant(e.target.value)}
                      placeholder="Entrez votre matricule ou email professionnel"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all font-medium"
                      required
                      autoComplete="username"
                      autoFocus
                    />
                  </div>

                  {/* Erreur */}
                  {error && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      <span>⚠</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Info contextuelle */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[var(--text-secondary)] text-xs">
                    <span className="text-amber-500 shrink-0 font-bold mt-0.5">⏱</span>
                    <span>
                      Votre demande sera examinée par un <strong>administrateur SPAT</strong>. Un nouveau mot de passe vous sera communiqué par e-mail sous <strong>24 à 48h</strong>.
                    </span>
                  </div>

                  {/* Bouton */}
                  <button
                    type="submit"
                    id="forgot-password-submit-btn"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Envoi de la demande…</span>
                      </>
                    ) : (
                      <>
                        <ShieldKeyIcon className="w-4 h-4" />
                        <span>Envoyer la demande de réinitialisation</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Lien vers le formulaire de reset si token déjà reçu */}
                <div className="text-center space-y-2">
                  <button
                    onClick={() => setShowResetForm(true)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <LockIcon className="w-3 h-3" />
                    J&apos;ai déjà un token — Définir mon mot de passe
                  </button>
                  <div>
                    <Link
                      href="/login"
                      className="text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <ArrowRightIcon size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Retour à la connexion
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 sm:px-12 py-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--bg-border)]">
          © {new Date().getFullYear()} Société du Port à gestion Autonome de Toamasina (SPAT)
        </div>
      </div>
    </div>
  );
}
