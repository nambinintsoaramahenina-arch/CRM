"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogInIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

// ── Données modules ───────────────────────────────────────────────
const features = [
  {
    icon: UsersIcon,
    title: 'Gestion des Utilisateurs',
    description: 'Création, modification et filtrage des comptes avec gestion fine des rôles Admin, Manager et User.',
    color: 'from-blue-600 to-blue-800',
  },
  {
    icon: ContactsIcon,
    title: 'Contacts & Organisations',
    description: 'Suivi centralisé des personnes et des organisations partenaires de la SPAT.',
    color: 'from-indigo-600 to-indigo-800',
  },
  {
    icon: InteractionsIcon,
    title: 'Interactions & Activités',
    description: 'Historique complet des échanges : appels, e-mails, réunions et rendez-vous.',
    color: 'from-cyan-600 to-cyan-800',
  },
  {
    icon: TasksIcon,
    title: 'Gestion des Tâches',
    description: 'Suivi des tâches par priorité et échéance — À faire, En cours, Terminées, En retard.',
    color: 'from-amber-600 to-amber-800',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Authentification JWT',
    description: 'Accès sécurisé par token JWT avec gestion des sessions et des rôles utilisateurs.',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    icon: BarChart3Icon,
    title: 'Tableau de Bord',
    description: 'Dashboard statistique adapté aux rôles ADMIN, MANAGER et USER avec KPIs clés.',
    color: 'from-rose-600 to-rose-800',
  },
];

// ── Composant Hero Épuré ────────────────────────────────────────────
export const PublicHero: React.FC = () => {
  return (
    <>
      {/* ===== SECTION HERO ÉPURÉE AVEC IMAGE EN FOND ===== */}
      <section
        id="accueil"
        className="relative overflow-hidden bg-slate-950 text-white min-h-[75vh] flex flex-col justify-center py-24 lg:py-32"
      >
        {/* Image de fond (Navire Porte-conteneurs) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/container-ship.jpg"
            alt="Port Autonome de Toamasina — SPAT"
            fill
            className="object-cover object-center brightness-60 contrast-110"
            priority
          />
          {/* Overlays sombres pour lisibilité parfaite */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/60" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        </div>

        {/* Contenu principal épuré sur l'image */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Titre principal */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              Application Web{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                CRM
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow">
              Centralisez et gérez efficacement vos relations client, vos contacts, vos équipes et vos tâches en un seul endroit.
            </p>
          </div>

          {/* Bouton CTA unique et clair */}
          <div className="pt-4 flex justify-center">
            <Link
              href="/login"
              id="hero-login-btn"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-2xl shadow-cyan-900/60 transition-all hover:scale-105 active:scale-95 border border-cyan-400/30"
            >
              <LogInIcon size={20} />
              <span>Se connecter</span>
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION FONCTIONNALITÉS ===== */}
      <section id="features" className="py-16 sm:py-24 bg-[var(--bg-page)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">Modules</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Fonctionnalités clés du CRM
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Une plateforme complète pour piloter toutes les dimensions de la relation client au sein de la SPAT.
            </p>
          </div>

          <div id="modules" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group relative bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] hover:border-cyan-500/40 shadow-[var(--card-shadow)] hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
