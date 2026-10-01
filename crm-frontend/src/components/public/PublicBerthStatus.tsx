"use client";

import React from 'react';
import {
  AnchorIcon,
  ContainerIcon,
  CheckCircleIcon,
  ShipIcon,
  ClockIcon,
  AlertCircleIcon,
} from '@/components/ui/Icons';

export const PublicBerthStatus: React.FC = () => {
  const berths = [
    {
      id: 'c3',
      name: 'Quai C3 (Extension Portuaire)',
      type: 'Terminal Conteneurs Hauturier (STS)',
      depth: '14.00 m',
      length: '470 m',
      currentVessel: 'MSC AGADIR (Libéria)',
      status: 'Occupé',
      cranes: '2 Portiques STS + 4 RTG actifs',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'c2',
      name: 'Quai C2',
      type: 'Terminal Conteneurs / Polyvalent',
      depth: '12.00 m',
      length: '210 m',
      currentVessel: 'CMA CGM TAMATAVE (France)',
      status: 'Occupé',
      cranes: '1 Grue Mobile Gottwald',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'c1',
      name: 'Quai C1',
      type: 'Cabotage & Marchandises Diverses',
      depth: '8.50 m',
      length: '180 m',
      currentVessel: 'OCEAN DIAMOND II (Madagascar)',
      status: 'Occupé',
      cranes: 'Manutention terre/bord',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'mole-b',
      name: 'Môle B',
      type: 'Terminal Vrac Solide & Céréalier',
      depth: '10.50 m',
      length: '200 m',
      currentVessel: 'PACIFIC SPIRIT (Panama)',
      status: 'Occupé',
      cranes: 'Silos & Trémies déchargement',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'mole-a',
      name: 'Môle A',
      type: 'Poste Polyvalent & Conventionnel',
      depth: '9.00 m',
      length: '160 m',
      currentVessel: 'Libre - Prochain : 18h00',
      status: 'Disponible',
      cranes: 'Grues sur pneus prêtes',
      badgeColor: 'bg-cyan-500',
    },
    {
      id: 'oil-berth',
      name: 'Appontement Pétrolier',
      type: 'Vrac Liquide & Hydrocarbures',
      depth: '12.50 m',
      length: '240 m',
      currentVessel: 'PETRO TOAMASINA (Bahamas)',
      status: 'En manœuvre',
      cranes: 'Bras de chargement pétrolier',
      badgeColor: 'bg-blue-500',
    },
  ];

  return (
    <section id="terminals" className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold uppercase tracking-wider mb-2">
              <AnchorIcon size={14} className="text-cyan-700" />
              <span>Infrastructures Portuaires SPAT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              État d'Occupation des Quais & Postes d'Amarrage
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Aperçu en temps réel de la capacité d'accueil et des opérations en cours sur les terminaux du Port de Toamasina.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              Occupé en cours (5)
            </span>
            <span className="flex items-center gap-1 text-cyan-600">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block" />
              Poste Disponible (1)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {berths.map((berth) => (
            <div
              key={berth.id}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-extrabold text-base text-slate-900">{berth.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      berth.status === 'Disponible'
                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                        : berth.status === 'En manœuvre'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${berth.badgeColor}`} />
                    {berth.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-500 mb-4">{berth.type}</p>

                <div className="space-y-2.5 text-xs bg-white rounded-2xl p-4 border border-slate-200/60 shadow-inner">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Navire affecté :</span>
                    <strong className="text-slate-900 font-bold text-right truncate max-w-[180px]">
                      {berth.currentVessel}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Tirant d'eau admissible :</span>
                    <span className="font-mono font-bold text-blue-700">{berth.depth}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Longueur de quai :</span>
                    <span className="font-mono text-slate-800">{berth.length}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ContainerIcon size={13} className="text-cyan-600 shrink-0" />
                    <span>{berth.cranes}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Code Poste : SPAT-{berth.id.toUpperCase()}</span>
                <span className="text-emerald-600 font-semibold">ISPS Level 1</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
