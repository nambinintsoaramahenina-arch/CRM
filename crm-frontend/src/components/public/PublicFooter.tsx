"use client";

import React from 'react';
import Link from 'next/link';
import { SpatLogo } from '@/components/ui/SpatLogo';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
  AnchorIcon,
  UsersIcon,
  ContactsIcon,
  TasksIcon,
} from '@/components/ui/Icons';

export const PublicFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-200 border-t border-slate-800">
      {/* Corps principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Col 1 : Identité SPAT */}
          <div className="lg:col-span-4 space-y-5">
            <SpatLogo variant="dark" size="lg" />
            <p className="text-slate-400 text-sm leading-relaxed">
              La <strong className="text-slate-200">Société du Port à gestion Autonome de Toamasina (SPAT)</strong> est l'autorité portuaire du premier port de Madagascar.
            </p>
          </div>

          {/* Col 2 : Plan du site CRM */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
              <AnchorIcon size={17} className="text-cyan-400" />
              <span>Application CRM</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              {[
                { label: 'Tableau de bord', href: '/dashboard', icon: AnchorIcon },
                { label: 'Gestion des utilisateurs', href: '/dashboard', icon: UsersIcon },
                { label: 'Contacts & Organisations', href: '/dashboard', icon: ContactsIcon },
                { label: 'Tâches & Activités', href: '/dashboard', icon: TasksIcon },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-cyan-400 hover:translate-x-1 inline-flex items-center gap-2 transition-all"
                  >
                    <item.icon size={13} className="text-cyan-400/70 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 : Accès & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldCheckIcon size={17} className="text-cyan-400" />
              <span>Accès Sécurisé</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/login" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all font-semibold text-white">
                  Connexion à la plateforme
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                  Tableau de bord ADMIN
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                  Espace MANAGER
                </Link>
              </li>
            </ul>

            {/* Coordonnées */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPinIcon size={15} className="text-cyan-400 shrink-0" />
                <span>Boulevard Ratsimilaho, BP 492 — Toamasina (501)</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon size={15} className="text-cyan-400 shrink-0" />
                <span>+261 20 53 321 55</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon size={15} className="text-cyan-400 shrink-0" />
                <a href="mailto:contact@port-toamasina.com" className="hover:text-cyan-400 transition-colors">
                  contact@port-toamasina.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de copyright */}
      <div className="border-t border-slate-900 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>SPAT — Port Autonome de Toamasina</strong>. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Mentions Légales</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
