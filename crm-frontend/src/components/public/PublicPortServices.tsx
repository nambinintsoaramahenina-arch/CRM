"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShipIcon,
  ContainerIcon,
  ShieldCheckIcon,
  FileTextIcon,
  UsersIcon,
  ArrowRightIcon,
  CompassIcon,
  TruckIcon,
} from '@/components/ui/Icons';

export const PublicPortServices: React.FC = () => {
  const services = [
    {
      id: 'consignees',
      title: 'Espace Armateurs & Consignataires',
      description:
        'Notification électronique des avis d\'arrivée (ETA), transmission des manifestes et réservation des postes d\'amarrage.',
      icon: ShipIcon,
      badge: 'Accès Métier',
      color: 'blue',
      linkText: 'Accéder au Guichet Consignation',
      href: '/login',
    },
    {
      id: 'forwarders',
      title: 'Transitaires & Déclarants en Douane',
      description:
        'Suivi du statut de dédouanement Sydonia, vérification des bons à délivrer (BAD) et programmation des enlèvements.',
      icon: ContainerIcon,
      badge: 'Logistique',
      color: 'cyan',
      linkText: 'Suivi des Conteneurs & Titres',
      href: '/login',
    },
    {
      id: 'pilotage',
      title: 'Capitainerie, Pilotage & Remorquage',
      description:
        'Demandes de services nautiques en temps réel : pilotes côtiers, remorqueurs d\'assistance et équipes de lamanage 24/7.',
      icon: CompassIcon,
      badge: 'Opérations',
      color: 'indigo',
      linkText: 'Portail des Services Nautiques',
      href: '/login',
    },
    {
      id: 'trucking',
      title: 'Transporteurs & Gestion des Portes',
      description:
        'Prise de rendez-vous pour les camions au Terminal conteneurs (TOS), suivi des flux de sorties et réduction des temps d\'attente.',
      icon: TruckIcon,
      badge: 'Fluidité',
      color: 'amber',
      linkText: 'Système de Rendez-vous Camions',
      href: '/login',
    },
    {
      id: 'security',
      title: 'Sûreté Portuaire & Badges ISPS',
      description:
        'Demande de laissez-passer, autorisations de circulation pour personnes et véhicules dans les zones sous douane.',
      icon: ShieldCheckIcon,
      badge: 'Sécurité',
      color: 'emerald',
      linkText: 'Gestion des Accès Portuaires',
      href: '/login',
    },
    {
      id: 'tarifs',
      title: 'Tarifs & Réglementation SPAT',
      description:
        'Consultation des barèmes officiels des droits de port, redevances de stationnement et guide d\'exploitation nautique.',
      icon: FileTextIcon,
      badge: 'Réglementation',
      color: 'teal',
      linkText: 'Consulter les Barèmes Officiels',
      href: '/login',
    },
  ];

  return (
    <section id="services" className="py-14 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Nautical Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <UsersIcon size={14} className="text-cyan-300" />
              <span>Services Communautaires Portuaires</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Espaces & Services aux Acteurs Portuaires
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Une gamme complète de modules numériques pour simplifier et accélérer les formalités maritimes au Port de Toamasina.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0"
          >
            <span>Connexion Espace Pro</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-cyan-400 border border-blue-400/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
                    {srv.description}
                  </p>
                </div>

                <Link
                  href={srv.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-3 border-t border-slate-700/60 transition-colors"
                >
                  <span>{srv.linkText}</span>
                  <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
