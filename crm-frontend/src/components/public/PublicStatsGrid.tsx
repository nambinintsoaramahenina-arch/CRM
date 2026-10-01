"use client";

import React from 'react';
import {
  ShipIcon,
  ContainerIcon,
  TrendingUpIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  BarChart3Icon,
} from '@/components/ui/Icons';

export const PublicStatsGrid: React.FC = () => {
  const stats = [
    {
      id: 'berth-vessels',
      title: 'Navires à Quai',
      value: '8',
      unit: '/ 12 postes',
      trend: '+12%',
      trendDirection: 'up',
      trendLabel: 'vs moyenne hebdomadaire',
      icon: ShipIcon,
      color: 'blue',
      description: 'Navires actuellement en opération de manutention et déchargement.',
    },
    {
      id: 'container-throughput',
      title: 'Cadence Portuaire Moyenne',
      value: '34.2',
      unit: 'EVP / heure',
      trend: '+8.4%',
      trendDirection: 'up',
      trendLabel: 'au Terminal C3',
      icon: ContainerIcon,
      color: 'cyan',
      description: 'Performance des portiques STS et cavaliers gerbeurs.',
    },
    {
      id: 'waiting-time',
      title: 'Attente Moyenne en Rade',
      value: '1.8',
      unit: 'jours',
      trend: '-22%',
      trendDirection: 'good',
      trendLabel: 'réduction du temps d\'attente',
      icon: ClockIcon,
      color: 'emerald',
      description: 'Optimisation de la programmation des escales par la Capitainerie.',
    },
    {
      id: 'annual-tonnage',
      title: 'Tonnage Global Annuel',
      value: '4.85 M',
      unit: 'Tonnes',
      trend: '+6.1%',
      trendDirection: 'up',
      trendLabel: 'croissance continue',
      icon: BarChart3Icon,
      color: 'indigo',
      description: 'Vrac liquide, vrac solide, conteneurs et marchandises conventionnelles.',
    },
    {
      id: 'connected-partners',
      title: 'Acteurs Logistiques Connectés',
      value: '154',
      unit: 'partenaires',
      trend: '+18',
      trendDirection: 'up',
      trendLabel: 'nouveaux ce trimestre',
      icon: UsersIcon,
      color: 'amber',
      description: 'Consignataires, armateurs, transitaires et autorités douanières.',
    },
    {
      id: 'clearance-rate',
      title: 'Fluidité Formalités Sydonia',
      value: '96.8%',
      unit: 'conformité',
      trend: 'Optimal',
      trendDirection: 'neutral',
      trendLabel: 'interconnexion directe SPAT',
      icon: CheckCircleIcon,
      color: 'teal',
      description: 'Traitement dématérialisé des manifestes et bons à délivrer.',
    },
  ];

  const colorVariants: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    blue: {
      bg: 'bg-blue-50 text-blue-700',
      text: 'text-blue-600',
      border: 'hover:border-blue-300',
      glow: 'group-hover:bg-blue-500/5',
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-700',
      text: 'text-cyan-600',
      border: 'hover:border-cyan-300',
      glow: 'group-hover:bg-cyan-500/5',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
      glow: 'group-hover:bg-emerald-500/5',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
      glow: 'group-hover:bg-indigo-500/5',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
      glow: 'group-hover:bg-amber-500/5',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-700',
      text: 'text-teal-600',
      border: 'hover:border-teal-300',
      glow: 'group-hover:bg-teal-500/5',
    },
  };

  return (
    <section id="stats" className="py-12 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold tracking-wide uppercase mb-2">
              <TrendingUpIcon size={14} className="text-blue-600" />
              <span>Indicateurs de Performance Portuaire</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tableau de Bord des Flux & Activités
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Données consolidées d'exploitation en temps réel pour le Port Autonome de Toamasina.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dernière mise à jour : <strong>Aujourd'hui, il y a 5 min</strong></span>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const style = colorVariants[stat.color] || colorVariants.blue;

            return (
              <div
                key={stat.id}
                className={`group relative bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${style.border} overflow-hidden`}
              >
                {/* Subtle Hover Gradient */}
                <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${style.glow}`} />

                <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${style.bg} border border-black/5 shrink-0`}>
                    <Icon size={24} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      stat.trendDirection === 'good' || stat.trendDirection === 'up'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {stat.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {stat.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 line-clamp-2">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
