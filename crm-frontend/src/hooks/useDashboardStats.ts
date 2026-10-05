"use client";

/**
 * useDashboardStats.ts
 * --------------------
 * Hook React pour charger les statistiques du tableau de bord CRM.
 * Recupere le JWT depuis localStorage, appelle fetchDashboardStats
 * et gere les etats loading / error avec redirection si 401/403.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchDashboardStats, DashboardStats } from "@/services/dashboardService";

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useDashboardStats(isManager = false): UseDashboardStatsReturn {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("crm-token") : null;
      if (!token) {
        router.push("/login");
        return;
      }
      const data = await fetchDashboardStats(token, isManager);
      setStats(data);
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
      setError(e.message || "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  }, [router, isManager]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { stats, loading, error, reload };
}
