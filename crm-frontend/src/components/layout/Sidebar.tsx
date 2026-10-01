"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SpatLogo } from '../ui/SpatLogo';
import {
  DashboardIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
  HistoryIcon,
  ProfileIcon,
  CloseIcon
} from '../ui/Icons';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: DashboardIcon },
  { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
  { name: 'Contacts', href: '/contacts', icon: ContactsIcon },
  { name: 'Interactions', href: '/interactions', icon: InteractionsIcon },
  { name: 'Tâches', href: '/tasks', icon: TasksIcon, badge: '87' },
  { name: 'Historique', href: '/history', icon: HistoryIcon },
  { name: 'Profil', href: '/profile', icon: ProfileIcon },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const pathname = usePathname();

  const isCurrentActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--bg-surface)] border-r border-[var(--bg-border)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--bg-border)]">
            <Link href="/dashboard" className="flex items-center group">
              <SpatLogo />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] lg:hidden"
              aria-label="Fermer le menu"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Menu Principal
            </div>

            {navItems.map((item) => {
              const active = isCurrentActive(item.href);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-900/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent
                      size={18}
                      className={active ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-cyan-500'}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer note/status */}
          <div className="p-4 border-t border-[var(--bg-border)] bg-[var(--bg-surface-2)]/60 m-3 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-[var(--text-primary)]">Port de Toamasina</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Plateforme CRM SPAT v2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
