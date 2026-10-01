"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SpatLogo } from '@/components/ui/SpatLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  LogInIcon,
  MenuIcon,
  CloseIcon,
  UsersIcon,
  ContactsIcon,
  InteractionsIcon,
  TasksIcon,
  AnchorIcon,
} from '@/components/ui/Icons';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil',      href: '#accueil',      icon: AnchorIcon },
    { label: 'Fonctionnalités', href: '#features',   icon: TasksIcon },
    { label: 'Contacts',     href: '#contact',      icon: ContactsIcon },
    { label: 'Utilisateurs', href: '#modules',      icon: UsersIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <nav
        className={`w-full px-4 sm:px-8 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--nav-bg)]/95 backdrop-blur-md shadow-xl shadow-black/40 py-2.5 border-b border-[var(--nav-border)]'
            : 'bg-[var(--nav-bg)] py-3.5 border-b border-[var(--nav-border)]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-3" id="nav-brand">
            <SpatLogo variant="dark" size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3.5 py-2 text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <link.icon size={14} className="text-cyan-400 opacity-80" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle variant="dark" />

            {/* CTA Se connecter */}
            <Link
              href="/login"
              id="nav-login-btn"
              className="relative group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] shadow-lg shadow-blue-900/30 border border-blue-400/30 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <LogInIcon size={16} className="text-cyan-100 group-hover:translate-x-0.5 transition-transform" />
              <span className="relative z-10 whitespace-nowrap">Se connecter</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              aria-label="Menu"
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 bg-slate-950 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:text-cyan-300 hover:bg-slate-800/70 rounded-xl transition-colors"
                >
                  <link.icon size={16} className="text-cyan-400" />
                  <span>{link.label}</span>
                </a>
              ))}
              <div className="pt-3 border-t border-slate-800/80">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 text-center shadow-md shadow-blue-900/40"
                >
                  <LogInIcon size={16} />
                  <span>Se connecter</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
