"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Breakdown = { name: string; count: number };
type Stats = { total: number; active: number; inactive: number; departments: Breakdown[]; designations: Breakdown[] };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/employees/stats/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load summary");
        const payload = await response.json();
        setStats({ departments: [], designations: [], ...payload });
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <div className="p-8 text-red-600">{error} <Link href="/login" className="ml-2 text-blue-600 underline">Login</Link></div>;
  }

  const currentStats = stats ?? { total: 0, active: 0, inactive: 0, departments: [], designations: [] };

  return (
    <main className="relative min-h-screen bg-slate-100 px-5 py-8 sm:px-8 lg:px-10">
      {loading ? <PageLoadingOverlay label="Loading dashboard" /> : null}
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Employee dashboard</h1>
        <p className="mt-2 text-slate-500">A clear view of your people, teams, and activity.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total employees" value={currentStats.total} accent="blue" />
        <StatCard label="Active employees" value={currentStats.active} accent="green" />
        <StatCard label="Inactive employees" value={currentStats.inactive} accent="red" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <BreakdownPanel title="Departments" items={currentStats.departments} accent="cyan" />
        <BreakdownPanel title="Designations" items={currentStats.designations} accent="amber" />
      </div>
    </main>
  );
}

function StatCard({ label, value, accent = "blue" }: { label: string; value: number; accent?: "blue" | "green" | "red" }) {
  const tones = {
    blue: "bg-white text-blue-700 ring-blue-100",
    green: "bg-white text-emerald-700 ring-emerald-100",
    red: "bg-white text-rose-700 ring-rose-100",
  };

  return (
    <div className={`rounded-xl border border-slate-200 p-6 shadow-sm ring-1 ${tones[accent]}`}>
      <p className="text-sm uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function BreakdownPanel({ title, items, accent }: { title: string; items: Breakdown[]; accent: "cyan" | "amber" }) {
  const color = accent === "cyan" ? "#06b6d4" : "#f59e0b";
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Distribution</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{total} people</span>
      </div>
      {items.length ? <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const share = total ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.name} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${share * 3.6}deg, #e2e8f0 0deg)` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900">{item.count}</div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{String(index + 1).padStart(2, "0")}</p>
                <p className="truncate font-semibold text-slate-800" title={item.name}>{item.name}</p>
                <p className="text-xs text-slate-500">{share}% of team</p>
              </div>
            </div>
          );
        })}
      </div> : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No employee data yet.</p>}
    </section>
  );
}
