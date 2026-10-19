"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon, TasksIcon } from '../ui/Icons';
import { fetchTasks, computeTaskStats, type Task } from '@/services/taskService';

const statusBadge: Record<string, string> = {
  EN_ATTENTE: 'bg-sky-50 text-sky-700 border-sky-200',
  EN_COURS:   'bg-amber-50 text-amber-700 border-amber-200',
  TERMINEE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  ANNULEE:    'bg-rose-50 text-rose-700 border-rose-200',
};

const statusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS:   'En cours',
  TERMINEE:   'Terminée',
  ANNULE:     'Annulée',

};

export const TasksOverview: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') || '' : '';
    if (token) {
      fetchTasks(token)
        .then((data) => setTasks(data))
        .catch(() => setTasks([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const stats = computeTaskStats(tasks);

  const taskStatusList = [
    {
      label: 'En attente',
      count: stats.enAttente,
      percentage: stats.total ? `${Math.round((stats.enAttente / stats.total) * 100)}%` : '0%',
      bar: stats.total ? Math.round((stats.enAttente / stats.total) * 100) : 0,
      barColor: 'bg-sky-500',
      textColor: 'text-sky-600',
      icon: ClockIcon,
    },
    {
      label: 'En cours',
      count: stats.enCours,
      percentage: stats.total ? `${Math.round((stats.enCours / stats.total) * 100)}%` : '0%',
      bar: stats.total ? Math.round((stats.enCours / stats.total) * 100) : 0,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: ClockIcon,
    },
    {
      label: 'Terminées',
      count: stats.termine,
      percentage: stats.total ? `${Math.round((stats.termine / stats.total) * 100)}%` : '0%',
      bar: stats.total ? Math.round((stats.termine / stats.total) * 100) : 0,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      icon: CheckCircleIcon,
    },
    {
      label: 'Annulées',
      count: stats.annule,
      percentage: stats.total ? `${Math.round((stats.annule / stats.total) * 100)}%` : '0%',
      bar: stats.total ? Math.round((stats.annule / stats.total) * 100) : 0,
      barColor: 'bg-rose-500',
      textColor: 'text-rose-600',
      icon: AlertCircleIcon,
    },
  ];

  const recentTasks = tasks.slice(0, 5);

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch {
      return iso;
    }
  };

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
            <p className="text-xs text-[var(--text-secondary)]">
              {loading ? 'Chargement des tâches…' : `Répartition opérationnelle des ${stats.total} tâche${stats.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Link
          href="/tasks"
          className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-cyan-600 border border-[var(--bg-border)] transition-colors"
        >
          {loading ? '—' : `${stats.total} Total`} →
        </Link>
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
                <span className="text-2xl font-black text-[var(--text-primary)]">{loading ? '—' : st.count}</span>
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

      {/* Liste des dernières tâches réelles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Dernières tâches enregistrées
          </span>
          <Link href="/tasks" className="text-xs font-semibold text-cyan-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)]">Chargement des tâches…</div>
        ) : recentTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] border border-[var(--bg-border)] rounded-xl">
            Aucune tâche enregistrée en base. <Link href="/tasks" className="text-cyan-600 underline font-semibold">Créer une tâche</Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--bg-border)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 text-xs hover:bg-[var(--bg-surface-2)] transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] shrink-0">#{task.id}</span>
                  <span className="font-medium text-[var(--text-primary)] truncate">{task.titre}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge[task.statut ?? ''] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    {statusLabels[task.statut ?? ''] ?? task.statut ?? '—'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">{fmtDate(task.date || task.dateTache)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
