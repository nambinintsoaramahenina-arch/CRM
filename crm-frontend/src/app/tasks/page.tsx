"use client";

import React from 'react';
import Link from 'next/link';
import { TasksIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { TasksOverview } from '@/components/dashboard/TasksOverview';

export default function TasksPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">Gestion des tâches</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--bg-border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <TasksIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Suivi des Tâches</h2>
            <p className="text-xs text-[var(--text-secondary)]">Visualisation de l'avancement des tâches : À faire, En cours, Terminées, En retard.</p>
          </div>
        </div>

        <TasksOverview />
      </div>
    </div>
  );
}
