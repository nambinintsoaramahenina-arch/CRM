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

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const [error, setError]             = useState('');

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

            {submitted ? (
              /* ─── Confirmation ─── */
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
                      : <>Votre demande a bien été transmise à l&apos;administrateur SPAT pour traitement.</>
                    }
                  </p>
                </div>

                {/* Prochaines étapes */}
                <div className={`p-4 rounded-xl text-left space-y-3 border ${
                  alreadyPending
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    alreadyPending
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Prochaines étapes
                  </p>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span>L&apos;administrateur validera votre identité et l&apos;authenticité de la demande</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span>Un <strong className="text-[var(--text-primary)]">nouveau mot de passe temporaire</strong> vous sera communiqué par e-mail</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>⏱</span>
                      <span>Délai de traitement estimé : <strong className="text-[var(--text-primary)]">24 à 48 heures</strong> ouvrées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span>Consultez votre boîte e-mail (et vos spams) régulièrement</span>
                    </li>
                  </ul>
                </div>

                {/* Info de sécurité */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-[var(--text-secondary)] text-xs text-left">
                  <span className="text-slate-400 shrink-0 font-bold mt-0.5">🔒</span>
                  <span>Changez votre mot de passe temporaire dès votre première connexion pour sécuriser votre compte.</span>
                </div>

                {/* Bouton retour */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99]"
                >
                  <ArrowRightIcon size={16} className="rotate-180" />
                  <span>Retour à la connexion</span>
                </Link>
              </div>

            ) : (
              /* ─── Formulaire ─── */
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

                {/* Lien retour */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRightIcon size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Retour à la connexion
                  </Link>
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
