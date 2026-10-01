"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, BellIcon, SearchIcon, LogInIcon, ShieldCheckIcon, UsersIcon, ProfileIcon } from '../ui/Icons';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const readStorage = () => {
      const savedRole = localStorage.getItem('crm-role') as UserRole | null;
      const savedName = localStorage.getItem('crm-name') || localStorage.getItem('crm-user') || '';
      setRole(savedRole);
      setUserName(savedName);
    };

    readStorage();

    // Écoute les changements de localStorage entre onglets ou après connexion/déconnexion
    window.addEventListener('storage', readStorage);
    return () => window.removeEventListener('storage', readStorage);
  }, [pathname]);

  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Tableau de bord';
    if (pathname.startsWith('/users'))        return 'Gestion des utilisateurs';
    if (pathname.startsWith('/contacts'))     return 'Contacts';
    if (pathname.startsWith('/interactions')) return 'Interactions';
    if (pathname.startsWith('/tasks'))        return 'Tâches';
    if (pathname.startsWith('/history'))      return 'Historique des activités';
    if (pathname.startsWith('/profile'))      return 'Mon Profil';
    if (pathname.startsWith('/login'))        return 'Connexion';
    return 'CRM SPAT';
  };

  const getRoleDisplay = () => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'MANAGER') return 'Manager';
    return 'Client';
  };

  const getInitials = () => {
    if (!userName) return role === 'ADMIN' ? 'AD' : role === 'MANAGER' ? 'MG' : 'CL';
    return userName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('crm-token');
    localStorage.removeItem('crm-role');
    localStorage.removeItem('crm-name');
    localStorage.removeItem('crm-user');
    setRole(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-8 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--bg-border)] transition-all">
      {/* Gauche : burger + titre */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface-2)] lg:hidden focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon size={22} />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 uppercase tracking-wider">
            <span>SPAT</span>
            <span className="text-[var(--bg-border)]">•</span>
            <span>Port de Toamasina</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Droite : recherche, notif, thème, user dynamique / déconnexion */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Barre de recherche (desktop) */}
        <div className="relative hidden md:block">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher…"
            className="w-52 pl-10 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Notifications"
        >
          <BellIcon size={20} />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
        </button>

        {/* ThemeToggle */}
        <ThemeToggle variant="light" />

        {/* Séparateur */}
        <div className="h-7 w-[1px] bg-[var(--bg-border)] hidden sm:block" />

        {/* Utilisateur connecté ou Bouton Connexion */}
        {role ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                {getInitials()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {getRoleDisplay()}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium truncate max-w-[120px]">
                  {userName}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Déconnexion"
            >
              <LogInIcon size={16} className="rotate-180" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          >
            <LogInIcon size={16} />
            <span className="hidden sm:inline">Se connecter</span>
          </Link>
        )}
      </div>
    </header>
  );
};
