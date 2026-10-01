"use client";

import React from 'react';
import Link from 'next/link';
import { InteractionsIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { RecentActivities } from '@/components/dashboard/RecentActivities';

export default function InteractionsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">Historique des interactions</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--bg-border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <InteractionsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Interactions & Activités</h2>
            <p className="text-xs text-[var(--text-secondary)]">Suivi complet des appels, e-mails et réunions réalisés avec les partenaires.</p>
          </div>
        </div>

        <RecentActivities />
      </div>
    </div>
  );
}
