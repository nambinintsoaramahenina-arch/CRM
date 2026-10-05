"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HistoryIcon, InteractionsIcon } from "../ui/Icons";
import {
  fetchRecentActivities,
  RecentActivityDTO,
} from "@/services/dashboardService";
import {
  TYPE_INTERACTION_CONFIG,
  TypeInteraction,
  formatInteractionDate,
  timeAgo,
} from "@/services/interactionService";

// Skeleton ligne de la timeline
const SkeletonActivity = () => (
  <div className="relative group animate-pulse">
    <div className="absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-surface-2)] ring-4 ring-[var(--bg-surface)]" />
    <div className="flex flex-col gap-1.5">
      <div className="h-3 w-40 bg-[var(--bg-surface-2)] rounded" />
      <div className="h-2.5 w-64 bg-[var(--bg-surface-2)] rounded" />
      <div className="h-2.5 w-24 bg-[var(--bg-surface-2)] rounded mt-1" />
    </div>
  </div>
);

// Icone generique basee sur le type d'interaction
const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
  const paths: Record<string, string> = {
    APPEL:
      "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    EMAIL:
      "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    REUNION:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    RENDEZ_VOUS:
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    MESSAGE:
      "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    AUTRE:
      "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  };
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[type] ?? paths.AUTRE} />
    </svg>
  );
};

// Badge erreur compact
const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
    <span className="font-medium truncate">{message}</span>
    <button
      onClick={onRetry}
      className="shrink-0 font-bold hover:underline transition"
    >
      Réessayer
    </button>
  </div>
);

export const RecentActivities: React.FC = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<RecentActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("crm-token") : null;
      if (!token) {
        router.push("/login");
        return;
      }
      const data = await fetchRecentActivities(token, 6);
      setActivities(data);
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 401 || e.status === 403) {
        localStorage.removeItem("crm-token");
        localStorage.removeItem("crm-role");
        localStorage.removeItem("crm-name");
        localStorage.removeItem("crm-user");
        router.push("/login");
        return;
      }
      setError(e.message || "Impossible de charger les activites recentes");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--bg-border)] shadow-[var(--card-shadow)] flex flex-col gap-5">
      {/* En-tete */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--bg-border)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <HistoryIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">
              Interactions Recentes
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {loading
                ? "Chargement..."
                : `${activities.length} derniere${activities.length !== 1 ? "s" : ""} interaction${activities.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          title="Rafraichir"
          className="text-[11px] font-bold text-cyan-600 hover:text-cyan-500 cursor-pointer transition-colors disabled:opacity-40"
        >
          {loading ? "..." : "Rafraichir"}
        </button>
      </div>

      {/* Erreur */}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Timeline */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--bg-border)] before:rounded-full">
        {loading ? (
          <>
            <SkeletonActivity />
            <SkeletonActivity />
            <SkeletonActivity />
            <SkeletonActivity />
            <SkeletonActivity />
          </>
        ) : activities.length === 0 && !error ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--bg-surface-2)] text-[var(--text-muted)] mb-3">
              <InteractionsIcon size={20} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Aucune interaction enregistree.
            </p>
          </div>
        ) : (
          activities.map((act) => {
            const typeKey = act.type as TypeInteraction;
            const cfg =
              TYPE_INTERACTION_CONFIG[typeKey] ?? TYPE_INTERACTION_CONFIG.AUTRE;
            return (
              <div key={act.id} className="relative group">
                {/* Dot + icone */}
                <div
                  className={`absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[var(--bg-surface)] ${cfg.bg} ${cfg.color}`}
                >
                  <TypeIcon type={act.type} size={12} />
                </div>

                {/* Contenu */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors">
                    {cfg.label} — {act.contactNomComplet}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] px-1.5 py-0.5 rounded-md">
                      {formatInteractionDate(act.date)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {timeAgo(act.date)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {(act.objet || act.description) && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed truncate max-w-xs">
                    {act.objet
                      ? `Objet : ${act.objet}`
                      : act.description}
                  </p>
                )}

                {/* Entreprise et responsable */}
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  {act.contactEntreprise && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {act.contactEntreprise}
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)]">Par :</span>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--bg-border)] px-2 py-0.5 rounded-md">
                    {act.utilisateurNomComplet}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
