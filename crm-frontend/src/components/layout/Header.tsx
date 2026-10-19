"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, BellIcon, SearchIcon, LogInIcon, ShieldCheckIcon, UsersIcon, ProfileIcon, CloseIcon } from '../ui/Icons';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  AdminNotification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/passwordRequestService';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);

    const readStorage = () => {
      const savedRole = localStorage.getItem('crm-role') as UserRole | null;
      const savedName = localStorage.getItem('crm-name') || localStorage.getItem('crm-user') || '';
      const savedToken = localStorage.getItem('crm-token') || '';
      setRole(savedRole);
      setUserName(savedName);
      setToken(savedToken);

      if (savedRole === 'ADMIN' && savedToken) {
        loadNotifications(savedToken);
      }
    };

    readStorage();

    window.addEventListener('storage', readStorage);
    return () => window.removeEventListener('storage', readStorage);
  }, [pathname]);

  const loadNotifications = async (jwtToken: string) => {
    try {
      const list = await fetchNotifications(jwtToken);
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.lue).length);
    } catch {
      // ignore
    }
  };

  // Fermer le menu notification si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    try {
      await markNotificationAsRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Tableau de bord';
    if (pathname.startsWith('/users'))        return 'Gestion des utilisateurs';
    if (pathname.startsWith('/contacts'))     return 'Contacts';
    if (pathname.startsWith('/interactions')) return 'Interactions';
    if (pathname.startsWith('/tasks'))        return 'Tâches';
    if (pathname.startsWith('/history'))      return 'Historique des activités';
    if (pathname.startsWith('/profile'))      return 'Mon Profil';
    if (pathname.startsWith('/login'))        return 'Connexion';
    if (pathname.startsWith('/admin/password-requests')) return 'Demandes de réinitialisation';
    return 'CRM SPAT';
  };

  const getRoleDisplay = () => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'MANAGER') return 'Manager';
    return 'Agent';
  };

  const getInitials = () => {
    if (!userName) return role === 'ADMIN' ? 'AD' : role === 'MANAGER' ? 'MG' : 'CL';
    return userName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('crm-token');
    localStorage.removeItem('crm-user');
    localStorage.removeItem('crm-role');
    localStorage.removeItem('crm-name');
    router.push('/login');
  };

  if (!isClient) return null;

  return (
    <header className="h-16 lg:h-20 bg-[var(--bg-surface)] border-b border-[var(--bg-border)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Gauche : Hamburger (Mobile) + Titre de page */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] lg:hidden transition-colors"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon size={22} />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] font-medium hidden sm:block">
            Société du Port à gestion Autonome de Toamasina
          </p>
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

        {/* Notifications Popover (réservé exclusivement à l'administrateur) */}
        {role === 'ADMIN' && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                if (token) {
                  loadNotifications(token);
                }
                setShowNotifMenu(!showNotifMenu);
              }}
              className="relative p-2.5 text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Notifications"
            >
              <BellIcon size={20} />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-slate-400/40" />
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] shadow-2xl z-50 overflow-hidden animate-fade-down">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-border)] bg-[var(--bg-surface-2)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--bg-border)]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3.5 transition-colors cursor-pointer ${
                          n.lue
                            ? 'hover:bg-[var(--bg-surface-2)] opacity-75'
                            : 'bg-cyan-500/5 hover:bg-cyan-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              n.lue ? 'bg-slate-300 dark:bg-slate-700' : 'bg-cyan-500'
                            }`}
                          />
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                              <span>
                                {n.dateCreation
                                  ? new Date(n.dateCreation).toLocaleString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                              <Link
                                href="/admin/password-requests"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowNotifMenu(false);
                                }}
                                className="text-cyan-600 font-bold hover:underline"
                              >
                                Gérer &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-center">
                  <Link
                    href="/admin/password-requests"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                  >
                    Voir toutes les demandes de mot de passe &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

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
