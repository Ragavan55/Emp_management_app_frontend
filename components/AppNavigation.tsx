"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/employees", label: "View employees", icon: "employees" },
];

function NavIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "employees") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" {...common}><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="3" /><path d="M16 4.5a3 3 0 0 1 0 5.8M17 15.2a3.5 3.5 0 0 1 3 3.5V20" /></svg>;
  }
  if (name === "logout") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" {...common}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" {...common}><path d="M3 11.5L12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5M9 20v-5h6v5" /></svg>;
}

export default function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login") return null;

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearToken();
      setMobileOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-lg shadow-slate-200/70 md:hidden"
      >
        <span aria-hidden="true" className="text-2xl leading-none">☰</span>
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-slate-200 bg-white px-3 py-5 text-slate-900 shadow-2xl shadow-slate-300/30 transition-[width,transform] duration-200 md:w-[4.5rem] md:overflow-hidden md:hover:w-72 ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
        onMouseLeave={(event) => {
          if (window.innerWidth < 768) return;
          event.currentTarget.blur();
        }}
      >
        <div className="mb-10 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-200">EM</span>
          <span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-800">Employee Management</span>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1.5">
          {navigationItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-cyan-50 font-semibold text-cyan-800 ring-1 ring-cyan-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-cyan-500 text-slate-950" : "bg-slate-100 text-slate-500"}`}><NavIcon name={item.icon} /></span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 text-left text-sm font-medium text-slate-500 transition-colors hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><NavIcon name="logout" /></span>
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </aside>
    </>
  );
}
