"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import {
  LogInIcon,
  ArrowRightIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
  ShieldCheckIcon,
  BarChart3Icon,
} from '@/components/ui/Icons';

// ── Données modules ──────────────────────────────────────────────────────────
const features = [
  {
    icon: UsersIcon,
    title: 'Gestion des Utilisateurs',
    description: 'Création, modification et filtrage des comptes avec gestion des rôles Admin, Manager et Client.',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    icon: ContactsIcon,
    title: 'Contacts & Organisations',
    description: 'Suivi centralisé des personnes et des organisations partenaires de la SPAT.',
    gradient: 'from-slate-600 to-slate-800',
  },
  {
    icon: InteractionsIcon,
    title: 'Interactions & Activités',
    description: 'Historique complet des échanges : appels, e-mails, réunions et rendez-vous.',
    gradient: 'from-blue-700 to-slate-700',
  },
  {
    icon: TasksIcon,
    title: 'Gestion des Tâches',
    description: 'Suivi des tâches par priorité et échéance — À faire, En cours, Terminées.',
    gradient: 'from-slate-700 to-blue-900',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Authentification JWT',
    description: 'Accès sécurisé par token JWT avec gestion des sessions et des rôles.',
    gradient: 'from-blue-800 to-slate-800',
  },
  {
    icon: BarChart3Icon,
    title: 'Tableau de Bord',
    description: 'Dashboard statistique adapté à chaque rôle avec indicateurs clés de performance.',
    gradient: 'from-slate-800 to-blue-700',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Navigation publique */}
      <PublicNavbar />

      {/* ═══════════════════════════════════════════
          HERO — IMAGE DE FOND + TITRE ÉPURÉ
      ═══════════════════════════════════════════ */}
      <section
        id="accueil"
        className="relative overflow-hidden bg-slate-950 text-white min-h-[70vh] flex flex-col justify-center py-20 lg:py-28"
      >
        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/container-ship.jpg"
            alt="Port Autonome de Toamasina — SPAT"
            fill
            className="object-cover object-center brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center space-y-6">
          {/* Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Système d'Information SPAT
          </span>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Application Web{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">
              CRM
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Centralisez et gérez efficacement vos relations client, vos contacts, vos équipes et vos tâches en un seul endroit sécurisé.
          </p>

          {/* CTA */}
          <div className="pt-2 flex justify-center">
            <Link
              href="/login"
              id="hero-login-btn"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 border border-blue-400/30"
            >
              <LogInIcon size={18} />
              <span>Se connecter à la plateforme</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FONCTIONNALITÉS
      ═══════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-20 bg-[var(--bg-page)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          {/* En-tête de section */}
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-2">
              Modules
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Fonctionnalités clés du CRM
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Une plateforme complète pour piloter toutes les dimensions de la relation client au sein de la SPAT.
            </p>
          </div>

          {/* Grille de cartes */}
          <div id="modules" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group relative bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--bg-border)] hover:border-blue-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} shadow-md mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PIED DE PAGE
      ═══════════════════════════════════════════ */}
      <PublicFooter />
    </div>
  );
}