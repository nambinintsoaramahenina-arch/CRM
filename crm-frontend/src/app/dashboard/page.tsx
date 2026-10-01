"use client";

import React, { useEffect, useState } from "react";
import { fetchUsers } from "@/services/userServices";
import { useRouter } from "next/navigation";
import { StatCards } from "@/components/dashboard/StatCards";
import { TasksOverview } from "@/components/dashboard/TasksOverview";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { UsersCrudTable } from "@/components/dashboard/UsersCrudTable";
import {
  LogInIcon,
  BellIcon,
  UsersIcon,
  ShieldCheckIcon,
  ProfileIcon,
} from "@/components/ui/Icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

// ─── Types
type UserRole = "ADMIN" | "MANAGER" | "USER";

interface SessionInfo {
  role: UserRole;
  name: string;
  email: string;
}

// ─── Couleurs et labels de rôle
const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.FC<{ size?: number; className?: string }>;
  }
> = {
  ADMIN: {
    label: "Admin",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
    icon: ShieldCheckIcon,
  },
  MANAGER: {
    label: "Manager",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800",
    icon: UsersIcon,
  },
  USER: {
    label: "Client",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800",
    icon: ProfileIcon,
  },
};

/**
 * Tableau de bord CRM SPAT
 * Contenu dynamique adapté au rôle (Admin, Manager ou Client).
 * Inclut le tableau CRUD utilisateurs uniquement pour l'ADMIN.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Vérification stricte du token de sécurité au chargement
    const token = localStorage.getItem("crm-token");
    if (!token) {
      router.push("/login");
      return;
    }

    const rawRole = localStorage.getItem("crm-role");
    const role: UserRole =
      rawRole === "ADMIN" || rawRole === "MANAGER" || rawRole === "USER"
        ? rawRole
        : "USER";

    const name = localStorage.getItem("crm-name") || "Utilisateur";
    const email = localStorage.getItem("crm-user") || "";
    setSession({ role, name, email });
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("crm-token");
    localStorage.removeItem("crm-role");
    localStorage.removeItem("crm-name");
    localStorage.removeItem("crm-user");
    router.push("/login");
  };

  if (!ready || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const role = session.role;
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG["USER"];
  const RoleIcon = cfg.icon;
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER" || isAdmin;

  const roleDisplayTitle =
    role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "Client";
  const initials = roleDisplayTitle.slice(0, 2).toUpperCase();

  return (
    // Ajout d'un padding global (`p-6 sm:p-8`) pour que la page ne soit plus collée aux bords
    <div className="p-6 sm:p-8 space-y-8 pb-8">
      {/* ═══════════════════════════════════════════════
          BANNIÈRE DE BIENVENUE
      ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0">
              {initials}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Tableau de bord CRM
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Bienvenue,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  {roleDisplayTitle}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}
                >
                  <RoleIcon size={12} />
                  {cfg.label}
                </span>
                {session.email && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({session.email})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ThemeToggle variant="dark" />

            <button
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 transition-all"
              aria-label="Notifications"
            >
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </button>

            {isManager && (
              <Link
                href="/users"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold transition-all"
              >
                <UsersIcon size={15} />
                <span>Page Utilisateurs</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              id="logout-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all"
            >
              <LogInIcon size={15} className="rotate-180" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          KPI — STATISTIQUES (filtrées par rôle)
      ═══════════════════════════════════════════════ */}
      <section aria-label="Statistiques clés">
        <StatCards role={role} />
      </section>

      {/* ═══════════════════════════════════════════════
          TABLEAU DE CRUD UTILISATEURS (ADMIN UNIQUEMENT)
      ═══════════════════════════════════════════════ */}
      {isAdmin && (
        <section aria-label="Gestion des utilisateurs Admin">
          <UsersCrudTable />
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          TÂCHES + INTERACTIONS RÉCENTES
      ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksOverview />
        <RecentActivities />
      </section>

      {!isAdmin && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-secondary)] text-xs">
          <ShieldCheckIcon size={16} className="text-cyan-500 shrink-0 mt-0.5" />
          <p>
            Certaines fonctionnalités (gestion complète des utilisateurs,
            statistiques d'administration) sont réservées aux rôles{" "}
            <strong>ADMIN</strong> et <strong>MANAGER</strong>.
          </p>
        </div>
      )}
    </div>
  );
}