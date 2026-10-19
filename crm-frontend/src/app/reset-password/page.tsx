"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SpatLogo } from '@/components/ui/SpatLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { validateResetCode } from '@/services/passwordRequestService';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(true);

  // Récupère proprement le token depuis les paramètres de l'URL et le nettoie
  useEffect(() => {
    const rawToken = searchParams.get('token') || searchParams.get('code');
    if (rawToken) {
      const cleanToken = rawToken.replaceAll(/\s+/g, '').toUpperCase();
      setToken(cleanToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Nettoie la chaîne saisie ou récupérée pour supprimer tous les espaces et la mettre en majuscules
    const cleanCode = (token || '').replaceAll(/\s+/g, '').toUpperCase();

    if (!cleanCode) {
      setError('Le code de réinitialisation est obligatoire. Vérifiez votre boîte e-mail.');
      return;
    }

    setLoading(true);
    try {
      // Envoie la requête POST { "token": cleanCode } au backend
      await validateResetCode(cleanCode);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la validation du code.';
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
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Sécurité du compte
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Validation du code de réinitialisation
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Saisissez le code reçu par e-mail pour confirmer votre réinitialisation. Votre nouveau mot de passe vous sera automatiquement envoyé.
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
            {success ? (
              <div className="text-center space-y-5 animate-fade-up">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
                    <svg
                      width="48" height="48" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-emerald-500"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    Code validé avec succès !
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Votre réinitialisation a été confirmée. Un nouveau mot de passe temporaire a été{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">généré automatiquement</strong> et vous a été envoyé par e-mail.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99]"
                >
                  <ArrowRightIcon size={16} className="rotate-180" />
                  <span>Se connecter avec le nouveau mot de passe</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                      <svg
                        width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="text-emerald-500"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    Validation du code
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Saisissez votre code de réinitialisation reçu par e-mail.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" id="reset-password-page-form">
                  <div className="space-y-2">
                    <label
                      htmlFor="reset-token-input"
                      className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                    >
                      Code de réinitialisation
                    </label>
                    <div className="relative">
                      <input
                        id="reset-token-input"
                        type={showToken ? 'text' : 'password'}
                        value={token}
                        onChange={(e) => setToken(e.target.value.replaceAll(/\s+/g, '').toUpperCase())}
                        placeholder="Ex: ABC123"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-center tracking-[0.25em] font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all uppercase"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        tabIndex={-1}
                        title={showToken ? 'Masquer le code' : 'Afficher le code'}
                      >
                        {showToken ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Code alphanumérique à 6 caractères sans espaces.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      <span>⚠</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    id="submit-validation-btn"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validation en cours…</span>
                      </>
                    ) : (
                      <span>Valider le code</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-cyan-600 transition-colors"
                    >
                      Vous n&apos;avez pas encore de code ? Faire une demande
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-12 py-5 border-t border-[var(--bg-border)] text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Société du Port à gestion Autonome de Toamasina (SPAT) — Tous droits réservés.
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
