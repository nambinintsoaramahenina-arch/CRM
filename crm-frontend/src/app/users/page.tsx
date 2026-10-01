"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsersCrudTable } from '@/components/dashboard/UsersCrudTable';
import { ShieldCheckIcon, ArrowRightIcon } from '@/components/ui/Icons';
import Link from 'next/link';

type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export default function UsersPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedRole = (localStorage.getItem('crm-role') || 'USER') as UserRole;
    setRole(savedRole);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Seuls ADMIN et MANAGER peuvent gérer la liste des utilisateurs
  const canAccess = role === 'ADMIN' || role === 'MANAGER';

  if (!canAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <ShieldCheckIcon size={32} />
        </div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Accès Restreint</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-md">
          Cette page de gestion des utilisateurs est réservée aux Administrateurs et Managers de la SPAT.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all"
        >
          <span>Retour au Tableau de Bord</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">Gestion des utilisateurs</span>
      </div>

      {/* Composant CRUD réutilisable */}
      <UsersCrudTable />
    </div>
  );
}
