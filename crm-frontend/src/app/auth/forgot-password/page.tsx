"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpatLogo } from '@/components/ui/SpatLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { submitForgotPassword } from '@/services/passwordRequestService';

/**
 * Page "Mot de passe oublié" — Workflow avec validation de l'administrateur
 * Route : /auth/forgot-password
 *
 * Étape 1 : Formulaire de saisie d'e-mail ou login/matricule.
 * Étape 2 : Confirmation avec consignes et étapes suivantes :
 *   - L'administrateur validera votre identité
 *   - Un nouveau mot de passe vous sera communiqué par e-mail (24-48h)
 *   - Bouton de retour vers la page de connexion.
 */

// ─── Icônes SVG internes ──────────────────────────────────────────────────────

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

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─── Composant de la Page ─────────────────────────────────────────────────────

export default function AuthForgotPasswordPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const [message, setMessage]         = useState('');
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = identifiant.trim();
    if (!trimmed) {
      setError("Veuillez saisir votre e-mail ou votre matricule.");
      return;
    }

    setLoading(true);
    try {
      const data = await submitForgotPassword(trimmed);
      setAlreadyPending(data.alreadyPending ?? false);
      setMessage(data.message || "Votre demande a été transmise à l'administrateur.");
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : "Une erreur est survenue lors de l'enregistrement de votre demande.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300">

      {/* ── Colonne gauche : Illustration / branding (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative overflow-hidden bg-slate-900">
        <Image
          src="/images/ai-port-login.jpg"
          alt="Port autonome de Toamasina — SPAT CRM"
          fill
          className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-page)] opacity-80 hidden lg:block" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <SpatLogo variant="dark" size="lg" />
          </div>
          <div className="max-w-md pb-6 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Assistance & Sécurité
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Réinitialisation validée par l&apos;administrateur
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Pour des raisons de sécurité renforcée, toute réinitialisation de mot de passe est vérifiée et validée manuellement par un administrateur habilité.
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite : Formulaire et confirmation ── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen">

        {/* Barre supérieure avec bouton retour et toggle thème */}
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

        {/* Bloc central */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <div className="w-full max-w-md space-y-8 bg-[var(--bg-surface)] p-8 sm:p-10 rounded-2xl border border-[var(--bg-border)] shadow-xl shadow-slate-900/5">

            {submitted ? (
              /* ── Écran de confirmation et prochaines étapes ── */
              <div className="text-center space-y-5 animate-in fade-in duration-300">

                {/* Icône d'état */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border shadow-lg ${
                    alreadyPending
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-amber-500/10'
                      : 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10'
                  }`}>
                    <ClockIcon />
                  </div>
                </div>

                {/* Titre et description */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    {alreadyPending ? 'Demande déjà en cours' : 'Demande enregistrée avec succès !'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {alreadyPending
                      ? 'Une demande de réinitialisation est déjà en attente d\'examen pour votre compte.'
                      : (message || 'Votre demande a bien été enregistrée et transmise à l\'administrateur.')
                    }
                  </p>
                </div>

                {/* Prochaines étapes détaillées */}
                <div className={`p-4 rounded-xl text-left space-y-3 border ${
                  alreadyPending
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    alreadyPending
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <CheckCircleIcon />
                    Prochaines étapes
                  </p>

                  <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span><strong>L&apos;administrateur validera votre identité</strong> et vérifiera l&apos;authenticité de votre demande.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span><strong>Un nouveau mot de passe vous sera communiqué par e-mail</strong> dès validation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>⏱</span>
                      <span>Délai de traitement estimé : <strong className="text-[var(--text-primary)]">24 à 48 heures</strong> ouvrées.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 mt-0.5 ${alreadyPending ? 'text-amber-500' : 'text-emerald-500'}`}>✓</span>
                      <span>Pensez à vérifier votre boîte de réception ainsi que vos courriers indésirables (spams).</span>
                    </li>
                  </ul>
                </div>

                {/* Notice de sécurité */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-[var(--text-secondary)] text-xs text-left">
                  <span className="text-cyan-500 shrink-0 font-bold mt-0.5">🔒</span>
                  <span>
                    À réception du mot de passe temporaire, vous devrez le modifier dès votre première connexion pour des raisons de conformité.
                  </span>
                </div>

                {/* Bouton retour vers la connexion */}
                <Link
                  href="/login"
                  id="btn-back-to-login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99]"
                >
                  <ArrowRightIcon size={16} className="rotate-180" />
                  <span>Retour à la page de connexion</span>
                </Link>
              </div>

            ) : (
              /* ── Formulaire de demande ── */
              <>
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-500 shadow-lg shadow-cyan-500/10">
                      <ShieldKeyIcon />
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    Mot de passe oublié
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Saisissez votre e-mail professionnel ou matricule. Votre demande sera soumise à l&apos;administrateur SPAT.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" id="auth-forgot-password-form">

                  {/* Saisie email ou login */}
                  <div className="space-y-2">
                    <label
                      htmlFor="auth-identifiant"
                      className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                    >
                      E-mail ou Login / Matricule
                    </label>
                    <input
                      id="auth-identifiant"
                      type="text"
                      value={identifiant}
                      onChange={(e) => setIdentifiant(e.target.value)}
                      placeholder="ex: jean.dupont@port-toamasina.com ou MTR-1024"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all font-medium"
                      required
                      autoComplete="username"
                      autoFocus
                    />
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      <span>⚠</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Note explicative */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[var(--text-secondary)] text-xs">
                    <span className="text-amber-500 shrink-0 font-bold mt-0.5">ℹ️</span>
                    <span>
                      Aucun mot de passe n&apos;est réinitialisé automatiquement. Votre demande sera examinée par l&apos;administrateur sous <strong>24 à 48h</strong>.
                    </span>
                  </div>

                  {/* Bouton de soumission */}
                  <button
                    type="submit"
                    id="auth-forgot-submit-btn"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Envoi de votre demande…</span>
                      </>
                    ) : (
                      <>
                        <ShieldKeyIcon className="w-4 h-4" />
                        <span>Envoyer la demande à l&apos;administrateur</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Retour connexion */}
                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRightIcon size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    <span>Retourner à la page de connexion</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pied de page légal */}
        <div className="px-6 sm:px-12 py-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--bg-border)]">
          © {new Date().getFullYear()} Société du Port à gestion Autonome de Toamasina (SPAT) — Tous droits réservés
        </div>
      </div>
    </div>
  );
}
