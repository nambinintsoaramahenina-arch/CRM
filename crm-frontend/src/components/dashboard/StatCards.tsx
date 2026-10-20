"use client";

import React from "react";
import { UsersIcon, ContactsIcon, InteractionsIcon, TasksIcon } from "../ui/Icons";
import { useDashboardStats } from "@/hooks/useDashboardStats";

type UserRole = "ADMIN" | "MANAGER" | "USER";

interface StatCardsProps {
  role?: UserRole;
}

const SkeletonCard = () => (
  <div className="relative bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-[var(--bg-surface-2)] rounded" />
        <div className="h-10 w-16 bg-[var(--bg-surface-2)] rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-2)]" />
    </div>
    <div className="pt-3 border-t border-[var(--bg-border)] space-y-2">
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-[var(--bg-surface-2)] rounded-lg" />
        <div className="h-5 w-20 bg-[var(--bg-surface-2)] rounded-lg" />
      </div>
      <div className="h-3 w-40 bg-[var(--bg-surface-2)] rounded" />
    </div>
  </div>
);


interface CardData {
  title: string;
  total: string | number;
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  iconBg: string;
  subDetails: { label: string; value: string; color: string }[];
  description: string;
  adminOnly?: boolean;
}

const StatCardItem = ({ stat }: { stat: CardData }) => {
  const IconComponent = stat.icon;
  return (
    <div className="group relative bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`}
      />
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {stat.title}
          </p>
          <h3 className="text-4xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
            {stat.total}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-200`}
        >
          <IconComponent size={22} />
        </div>
      </div>
      <div className="pt-3 border-t border-[var(--bg-border)] space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {stat.subDetails.map((sub, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${sub.color}`}
            >
              <span className="font-normal opacity-80">{sub.label} :</span>
              <span>{sub.value}</span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] truncate">
          {stat.description}
        </p>
      </div>
    </div>
  );
};

export const StatCards: React.FC<StatCardsProps> = ({ role = "USER" }) => {
  const isManager = role === "ADMIN" || role === "MANAGER";
  const { stats, loading } = useDashboardStats(isManager);

  const buildStats = (): CardData[] => {
    const cards: CardData[] = [];

    if (isManager) {
      const total = stats?.users.total ?? 0;
      const actifs = stats?.users.actifs ?? 0;
      const inactifs = stats?.users.inactifs ?? 0;
      cards.push({
        title: "Utilisateurs",
        total,
        icon: UsersIcon,
        gradient: "from-blue-600 to-blue-800",
        iconBg: "bg-blue-100 text-blue-700",
        subDetails: [
          {
            label: "Actifs",
            value: String(actifs),
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          },
          {
            label: "Inactifs",
            value: String(inactifs),
            color: "text-slate-600 bg-slate-100 border-slate-200",
          },
        ],
        description: "Agents et administrateurs portuaires",
        adminOnly: true,
      });
    }

    // Contacts
    const cTotal = stats?.contacts.total ?? 0;
    const cNew = stats?.contacts.newThisMonth ?? 0;
    cards.push({
      title: "Contacts",
      total: cTotal,
      icon: ContactsIcon,
      gradient: "from-indigo-600 to-indigo-800",
      iconBg: "bg-indigo-100 text-indigo-700",
      subDetails: [
        {
          label: `+${cNew} ce mois`,
          value: "Clients & Partenaires",
          color: "text-blue-700 bg-blue-50 border-blue-200",
        },
      ],
      description: "Compagnies, transitaires, consignataires",
    });

    // Interactions
    const iTotal = stats?.interactions.total ?? 0;
    const byType = stats?.interactions.byType ?? {};
    const topType = Object.entries(byType).sort(([, a], [, b]) => b - a)[0];
    cards.push({
      title: "Interactions",
      total: iTotal,
      icon: InteractionsIcon,
      gradient: "from-cyan-600 to-cyan-800",
      iconBg: "bg-cyan-100 text-cyan-700",
      subDetails: topType
        ? [
            {
              label: "Type principal",
              value: topType[0],
              color: "text-cyan-700 bg-cyan-50 border-cyan-200",
            },
          ]
        : [
            {
              label: "Aucune",
              value: "interaction",
              color: "text-slate-600 bg-slate-100 border-slate-200",
            },
          ],
      description: "Echanges, appels et requetes traites",
    });

    // Tâches connectées à /api/tasks (PostgreSQL)
    const tTotal = stats?.tasks.total ?? 0;
    const tRetard = stats?.tasks.enRetard ?? 0;
    const tTerminees = stats?.tasks.terminees ?? 0;
    cards.push({
      title: "Taches",
      total: tTotal,
      icon: TasksIcon,
      gradient: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-100 text-amber-700",
      subDetails: [
        {
          label: "En retard",
          value: String(tRetard),
          color: "text-rose-700 bg-rose-50 border-rose-200",
        },
        {
          label: "Terminees",
          value: String(tTerminees),
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        },
      ],
      description: "Suivi des operations et dossiers en cours",
    });

    return cards;
  };

  const statCards = buildStats();
  const cols = isManager ? 4 : 3;
  const gridClass =
    cols === 4
      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {statCards.map((stat) => (
        <StatCardItem key={stat.title} stat={stat} />
      ))}
    </div>
  );
};
