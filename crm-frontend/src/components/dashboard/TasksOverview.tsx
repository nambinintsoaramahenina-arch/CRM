"use client";

import React from 'react';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon, TasksIcon } from '../ui/Icons';

const taskStatusList = [
  {
    label: 'À faire',
    count: 12,
    percentage: '14%',
    bar: 14,
    barColor: 'bg-sky-500',
    textColor: 'text-sky-600',
    icon: ClockIcon,
  },
  {
    label: 'En cours',
    count: 5,
    percentage: '6%',
    bar: 6,
    barColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    icon: ClockIcon,
  },
  {
    label: 'Terminées',
    count: 64,
    percentage: '73%',
    bar: 73,
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    icon: CheckCircleIcon,
  },
  {
    label: 'En retard',
    count: 6,
    percentage: '7%',
    bar: 7,
    barColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    icon: AlertCircleIcon,
  },
];

const sampleTasks = [
  { id: 'TSK-104', title: "Validation des fiches d'accès portuaires", priority: 'Haute',   status: 'En retard', date: 'Hier' },
  { id: 'TSK-105', title: 'Attribution des rôles agents douaniers',   priority: 'Moyenne',  status: 'En cours',  date: "Aujourd'hui" },
  { id: 'TSK-106', title: 'Revue mensuelle des comptes inactifs',     priority: 'Basse',    status: 'À faire',   date: 'Demain' },
  { id: 'TSK-103', title: 'Audit de sécurité des accès terminaux',    priority: 'Haute',    status: 'Terminée',  date: '20 Sept.' },
];

const statusBadge: Record<string, string> = {
  'Terminée':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En retard': 'bg-rose-50 text-rose-700 border-rose-200',
  'En cours':  'bg-amber-50 text-amber-700 border-amber-200',
  'À faire':   'bg-sky-50 text-sky-700 border-sky-200',
};

export const TasksOverview: React.FC = () => {
  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] flex flex-col gap-5">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--bg-border)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <TasksIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">Vue d'ensemble des Tâches</h3>
            <p className="text-xs text-[var(--text-secondary)]">Répartition opérationnelle des 87 tâches</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--bg-border)]">
          87 Total
        </span>
      </div>

      {/* Grille statuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {taskStatusList.map((st) => {
          const IconComp = st.icon;
          return (
            <div key={st.label} className="p-3.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{st.label}</span>
                <IconComp size={14} className={st.textColor} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[var(--text-primary)]">{st.count}</span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">{st.percentage}</span>
              </div>
              {/* Barre de progression */}
              <div className="w-full bg-slate-200/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${st.barColor} transition-all duration-500`}
                  style={{ width: `${st.bar}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des dernières tâches */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Dernières tâches assignées
        </span>
        <div className="divide-y divide-[var(--bg-border)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
          {sampleTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 text-xs hover:bg-[var(--bg-surface-2)] transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] shrink-0">{task.id}</span>
                <span className="font-medium text-[var(--text-primary)] truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge[task.status] ?? ''}`}>
                  {task.status}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">{task.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
