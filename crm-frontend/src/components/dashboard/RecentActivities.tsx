"use client";

import React from 'react';
import { HistoryIcon, UsersIcon, ContactsIcon, TasksIcon, ProfileIcon, InteractionsIcon } from '../ui/Icons';

// ─── Données mockées — GET /api/dashboard/recent-activities
const activities = [
  {
    id: 1,
    type: 'user',
    title: "Création d'un utilisateur",
    description: 'Compte créé pour M. Jean Rakoto (Agent de quai — Terminal 2)',
    user: 'Admin SPAT',
    time: 'Il y a 15 min',
    date: '25/08/2026',
    icon: UsersIcon,
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 2,
    type: 'interaction',
    title: 'Appel — Jean Dupont',
    description: 'Objet : Présentation du service. Durée : 18 min.',
    user: 'Sophie L.',
    time: 'Il y a 42 min',
    date: '25/08/2026',
    icon: InteractionsIcon,
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    id: 3,
    type: 'contact',
    title: 'Email — Société ABC',
    description: "Envoi du devis de services portuaires. Suivi planifié.",
    user: 'Manager Port',
    time: 'Il y a 2h',
    date: '24/08/2026',
    icon: ContactsIcon,
    iconBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 4,
    type: 'task',
    title: 'Réunion — Société XYZ',
    description: "Réunion de coordination avec l'équipe logistique.",
    user: 'Admin SPAT',
    time: 'Il y a 3h',
    date: '23/08/2026',
    icon: TasksIcon,
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 5,
    type: 'auth',
    title: 'Connexion utilisateur',
    description: 'Session ouverte depuis le poste de contrôle Nord (IP 192.168.10.42)',
    user: 'Hery R.',
    time: 'Il y a 5h',
    date: '23/08/2026',
    icon: ProfileIcon,
    iconBg: 'bg-slate-200 text-slate-600',
  },
];

export const RecentActivities: React.FC = () => {
  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] flex flex-col gap-5">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--bg-border)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <HistoryIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">Interactions Récentes</h3>
            <p className="text-xs text-[var(--text-secondary)]">Journal des activités — GET /api/dashboard/recent-activities</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-cyan-600 hover:text-cyan-500 cursor-pointer transition-colors">
          Voir tout
        </span>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--bg-border)] before:rounded-full">
        {activities.map((act) => {
          const IconComp = act.icon;
          return (
            <div key={act.id} className="relative group">
              {/* Dot + icône */}
              <div className={`absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[var(--bg-surface)] ${act.iconBg}`}>
                <IconComp size={12} />
              </div>

              {/* Contenu */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors">
                  {act.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] px-1.5 py-0.5 rounded-md">
                    {act.date}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{act.time}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {act.description}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)]">Par :</span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] px-2 py-0.5 rounded-md">
                  {act.user}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
