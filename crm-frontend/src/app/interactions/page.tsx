"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InteractionsIcon } from "@/components/ui/Icons";
import { InteractionsCrudTable } from "@/components/dashboard/InteractionsCrudTable";

type UserRole = "ADMIN" | "MANAGER" | "USER";

export default function InteractionsPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("USER");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("crm-token");
    if (!token) {
      router.push("/login");
      return;
    }
    const rawRole = localStorage.getItem("crm-role");
    const parsedRole: UserRole =
      rawRole === "ADMIN" || rawRole === "MANAGER" || rawRole === "USER"
        ? rawRole
        : "USER";
    setRole(parsedRole);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isManager = role === "ADMIN" || role === "MANAGER";

  return (
    <div className="space-y-6 pb-12">
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <Link
          href="/dashboard"
          className="hover:text-cyan-500 transition-colors"
        >
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">
          Historique des interactions
        </span>
      </div>

      {/* En-tete de la page */}
      <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--bg-border)] shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <InteractionsIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Interactions & Activites
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Suivi complet des appels, e-mails et reunions avec vos contacts.
              {isManager && (
                <span className="ml-1 text-cyan-500 font-semibold">
                  Vous pouvez creer, modifier et supprimer des interactions.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tableau CRUD dynamique */}
        <InteractionsCrudTable isManager={isManager} />
      </div>
    </div>
  );
}
