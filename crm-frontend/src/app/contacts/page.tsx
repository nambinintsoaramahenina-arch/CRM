"use client";

import React from 'react';
import Link from 'next/link';
import { ContactsIcon, ArrowRightIcon } from '@/components/ui/Icons';

export default function ContactsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">Gestion des contacts</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--bg-border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <ContactsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Gestion des Contacts</h2>
            <p className="text-xs text-[var(--text-secondary)]">Annuaire centralisé des personnes et organisations partenaires de la SPAT.</p>
          </div>
        </div>

        <div className="p-8 text-center border-2 border-dashed border-[var(--bg-border)] rounded-2xl space-y-3">
          <p className="text-sm font-bold text-[var(--text-primary)]">Module Contacts Ready</p>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            Ce module permet de consulter et d'administrer les fiches partenaires et contacts d'affaires du Port de Toamasina.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all">
            <span>Retour au tableau de bord</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
