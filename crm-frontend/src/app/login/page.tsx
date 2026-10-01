"use client";

import React, { useState } from 'react';
import { loginUser } from '@/services/userServices';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SpatLogo } from '@/components/ui/SpatLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogInIcon, ArrowRightIcon } from '@/components/ui/Icons';

/**
 * Page de Connexion — SPAT CRM
 * - Image générée par IA en arrière-plan / illustration
 * - Formulaire épuré, centré, sans démos ni badges superflus
 * - Champ MATRICULE à la place d'Email
 * - Connexion via POST /api/auth/login vers Spring Boot (PostgreSQL)
 */
export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule]     = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!matricule || !password) {
      setError('Veuillez remplir votre matricule et votre mot de passe.');
      setLoading(false);
      return;
    }

    try {
      // Appel réel vers l'API Spring Boot (correspondant à ton entité User : login et mdp)
      const data = await loginUser({ 
        login: matricule.trim(), 
        mdp: password 
      });

      if (data && data.token) {
        const role = data.role || 'USER';
        localStorage.setItem('crm-token', data.token);
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('crm-role',  role);
        localStorage.setItem('crm-user',  matricule);
        if (data.nomComplet) localStorage.setItem('crm-name', data.nomComplet);
        // Redirection dynamique selon le rôle
        router.push('/dashboard');
        return;
      } else {
        setError('Identifiants incorrects ou échec de l\'authentification.');
      }
    } catch (err: any) {
      console.error(err);
      // Affiche le message d'erreur précis renvoyé par Spring Boot
      setError(err?.message || 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300">
      {/* ── Colonne gauche : Image IA du Port ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative overflow-hidden bg-slate-900">
        <Image
          src="/images/ai-port-login.jpg"
          alt="Port autonome de Toamasina — SPAT CRM"
          fill
          className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          priority
        />
        {/* Overlay gradient marin sombre */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-page)] opacity-80 lg:block hidden" />

        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <SpatLogo variant="dark" size="lg" />
          </div>
          <div className="max-w-md pb-6 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Système d'Information SPAT
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Gestion Centralisée des Relations Clients
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Portail sécurisé d'accès à la plateforme CRM de la SPAT pour le suivi des contacts, des opérations et des activités.
            </p>
          </div>
        </div>
      </div>

      {/* ── Colonne droite : Formulaire d'authentification ── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        {/* Barre supérieure épurée */}
        <div className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-[var(--bg-border)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-cyan-600 transition-colors group"
          >
            <ArrowRightIcon size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Retour au site principal</span>
          </Link>
          <ThemeToggle variant="light" />
        </div>

        {/* Bloc d'authentification centré */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <div className="w-full max-w-md space-y-8 bg-[var(--bg-surface)] p-8 sm:p-10 rounded-2xl border border-[var(--bg-border)] shadow-xl shadow-slate-900/5">
            {/* Logo & Titre */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-2">
                <SpatLogo size="md" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Connexion
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Connectez-vous pour accéder à la plateforme de gestion de la SPAT
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Champ MATRICULE */}
              <div className="space-y-2">
                <label
                  htmlFor="matricule"
                  className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                >
                  MATRICULE
                </label>
                <input
                  id="matricule"
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder="Entrez votre matricule"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all font-medium"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                  >
                    Mot de passe
                  </label>
                  {/* Lien Mot de passe oublié */}
                  <button
                    type="button"
                    id="forgot-password-btn"
                    className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                    onClick={() => alert('Veuillez contacter l\'administrateur système pour réinitialiser votre mot de passe.')}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all font-medium"
                    required
                    autoComplete="current-password"
                  />
                  {/* Bouton toggle visibilité mot de passe */}
                  <button
                    type="button"
                    id="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      /* Icône œil barré */
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      /* Icône œil ouvert */
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Bouton de connexion unique */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion…</span>
                  </>
                ) : (
                  <>
                    <LogInIcon size={17} />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Pied de page épuré */}
        <div className="px-6 sm:px-12 py-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--bg-border)]">
          © {new Date().getFullYear()} Société du Port à gestion Autonome de Toamasina (SPAT)
        </div>
      </div>
    </div>
  );
}