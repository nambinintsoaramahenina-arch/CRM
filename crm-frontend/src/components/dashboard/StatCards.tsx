"use client";

import React from 'react';
import { UsersIcon, ContactsIcon, InteractionsIcon, TasksIcon } from '../ui/Icons';

type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

interface StatCardsProps {
  role?: UserRole;
}

interface StatDef {
  title: string;
  total: string;
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  iconBg: string;
  subDetails: { label: string; value: string; color: string }[];
  description: string;
  /** Si true, visible uniquement par ADMIN et MANAGER */
  adminOnly?: boolean;
}

const STATS: StatDef[] = [
  {
    title: 'Utilisateurs',
    total: '125',
    icon: UsersIcon,
    gradient: 'from-blue-600 to-blue-800',
    iconBg: 'bg-blue-100 text-blue-700',
    subDetails: [
      { label: 'Actifs',   value: '118', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { label: 'Inactifs', value: '7',   color: 'text-slate-600 bg-slate-100 border-slate-200' },
    ],
    description: 'Agents et administrateurs portuaires',
    adminOnly: true,
  },
  {
    title: 'Contacts',
    total: '348',
    icon: ContactsIcon,
    gradient: 'from-indigo-600 to-indigo-800',
    iconBg: 'bg-indigo-100 text-indigo-700',
    subDetails: [
      { label: '+12 ce mois', value: 'Clients & Partenaires', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    ],
    description: 'Compagnies, transitaires, consignataires',
  },
  {
    title: 'Interactions',
    total: '562',
    icon: InteractionsIcon,
    gradient: 'from-cyan-600 to-cyan-800',
    iconBg: 'bg-cyan-100 text-cyan-700',
    subDetails: [
      { label: 'Taux de réponse', value: '94%', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    ],
    description: 'Échanges, appels et requêtes traités',
  },
  {
    title: 'Tâches',
    total: '87',
    icon: TasksIcon,
    gradient: 'from-amber-500 to-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
    subDetails: [
      { label: 'En retard',  value: '6',  color: 'text-rose-700 bg-rose-50 border-rose-200' },
      { label: 'Terminées', value: '64', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    ],
    description: 'Suivi des opérations et dossiers en cours',
  },
];

export const StatCards: React.FC<StatCardsProps> = ({ role = 'USER' }) => {
  const isManager = role === 'ADMIN' || role === 'MANAGER';

  const visibleStats = STATS.filter((s) => !s.adminOnly || isManager);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {visibleStats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.title}
            className="group relative bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Lueur accent en fond */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />

            {/* Ligne du haut */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {stat.title}
                </p>
                <h3 className="text-4xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
                  {stat.total}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent size={22} />
              </div>
            </div>

            {/* Badges et description */}
            <div className="pt-3 border-t border-[var(--bg-border)] space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {stat.subDetails.map((sub, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${sub.color}`}
                  >
                    <span className="font-normal opacity-80">{sub.label}:</span>
                    <span>{sub.value}</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
