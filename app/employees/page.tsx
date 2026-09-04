"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import StatusBadge from "@/components/ui/StatusBadge";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://emp-management-app-backend.onrender.com";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  status: "Active" | "Inactive";
};

type PageData = {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

type DepartmentBreakdown = {
  name: string;
  count: number;
};

export default function EmployeesPage() {
  return (
    <Suspense fallback={<PageLoadingOverlay label="Loading employees" />}>
      <EmployeesPageContent />
    </Suspense>
  );
}

function EmployeesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [departments, setDepartments] = useState<DepartmentBreakdown[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState(searchParams.getAll("department"));
  const [selectedStatuses, setSelectedStatuses] = useState(searchParams.getAll("status"));
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_BASE_URL}/employees/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load departments");
        return response.json();
      })
      .then((payload: { departments: DepartmentBreakdown[] }) => setDepartments(payload.departments))
      .catch(() => setError("Unable to load departments."));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (debouncedSearch) params.set("search", debouncedSearch);
    selectedDepartments.forEach((item) => params.append("department", item));
    selectedStatuses.forEach((item) => params.append("status", item));
    router.replace(`/employees?${params.toString()}`);

    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unable to load employees");
        const payload = await response.json();
        setData(payload);
        setError(null);
      } catch {
        setError("Unable to load employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, limit, selectedDepartments, selectedStatuses, debouncedSearch, router]);

  const updatePage = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (searchTerm) params.set("search", searchTerm);
    selectedDepartments.forEach((item) => params.append("department", item));
    selectedStatuses.forEach((item) => params.append("status", item));
    router.push(`/employees?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    const token = getToken();
    if (!token) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete employee");
      setData((prev) => prev ? { ...prev, items: prev.items.filter((employee) => employee.id !== employeeToDelete.id) } : prev);
      setEmployeeToDelete(null);
    } catch {
      setError("Unable to delete employee.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-100 px-5 py-8 sm:px-8 lg:px-10">
      <ConfirmModal
        open={Boolean(employeeToDelete)}
        title="Delete employee?"
        message={employeeToDelete ? `This will permanently delete ${employeeToDelete.name}.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Confirm delete"}
        onConfirm={handleDelete}
        onCancel={() => { if (!deleting) setEmployeeToDelete(null); }}
        danger
      />
      {loading ? <PageLoadingOverlay label="Loading employees" /> : null}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Directory</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Employees</h1><p className="mt-2 text-slate-500">Search, review, and manage your team.</p></div>
        <Link href="/employees/new" className="inline-flex w-fit items-center rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 shadow-sm transition hover:bg-cyan-400">+ Add employee</Link>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or email"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus-within:border-cyan-500 [&::-webkit-details-marker]:hidden">
            <span className="truncate">
              {selectedDepartments.length === 0
                ? "All departments"
                : `${selectedDepartments.length} department${selectedDepartments.length === 1 ? "" : "s"} selected`}
            </span>
            <span aria-hidden="true" className="ml-2 text-slate-500">&#9662;</span>
          </summary>
          <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-b border-slate-100 px-2 py-2 font-semibold text-slate-800 hover:bg-cyan-50">
              <input
                type="checkbox"
                checked={departments.length > 0 && selectedDepartments.length === departments.length}
                onChange={(event) => setSelectedDepartments(event.target.checked ? departments.map((item) => item.name) : [])}
                className="h-4 w-4 accent-cyan-500"
              />
              <span>Select all</span>
            </label>
            {departments.map((item) => (
              <label key={item.name} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-cyan-50">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(item.name)}
                  onChange={() => setSelectedDepartments((current) => current.includes(item.name) ? current.filter((department) => department !== item.name) : [...current, item.name])}
                  className="h-4 w-4 accent-cyan-500"
                />
                <span>{item.name} ({item.count})</span>
              </label>
            ))}
          </div>
        </details>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus-within:border-cyan-500 [&::-webkit-details-marker]:hidden">
            <span className="truncate">
              {selectedStatuses.length === 0
                ? "All statuses"
                : `${selectedStatuses.length} status${selectedStatuses.length === 1 ? "" : "es"} selected`}
            </span>
            <span aria-hidden="true" className="ml-2 text-slate-500">&#9662;</span>
          </summary>
          <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-b border-slate-100 px-2 py-2 font-semibold text-slate-800 hover:bg-cyan-50">
              <input
                type="checkbox"
                checked={selectedStatuses.length === 2}
                onChange={(event) => setSelectedStatuses(event.target.checked ? ["Active", "Inactive"] : [])}
                className="h-4 w-4 accent-cyan-500"
              />
              <span>Select all</span>
            </label>
            {["Active", "Inactive"].map((item) => (
              <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-cyan-50">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(item)}
                  onChange={() => setSelectedStatuses((current) => current.includes(item) ? current.filter((statusItem) => statusItem !== item) : [...current, item])}
                  className="h-4 w-4 accent-cyan-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </details>
        <Button onClick={() => { setSearchTerm(""); setSelectedDepartments([]); setSelectedStatuses([]); }} variant="secondary">Clear filters</Button>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-gray-500 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((employee) => (
                <tr key={employee.id} className="border-t border-slate-100 transition hover:bg-cyan-50/40">
                  <td className="px-4 py-3 font-medium">{employee.name}</td>
                  <td className="px-4 py-3">{employee.email}</td>
                  <td className="px-4 py-3">{employee.phone}</td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3">{employee.designation}</td>
                  <td className="px-4 py-3">{new Date(employee.joining_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={employee.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/employees/${employee.id}`} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500">View</Link>
                      <Link href={`/employees/${employee.id}/edit`} className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-400">Edit</Link>
                      <button onClick={() => setEmployeeToDelete(employee)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {(data?.items || []).map((employee) => (
          <article key={employee.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-slate-900">{employee.name}</h2>
                <p className="truncate text-sm text-slate-500">{employee.email}</p>
              </div>
              <StatusBadge status={employee.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-slate-500">Phone</dt><dd className="mt-0.5 font-medium text-slate-800">{employee.phone}</dd></div>
              <div><dt className="text-slate-500">Department</dt><dd className="mt-0.5 font-medium text-slate-800">{employee.department}</dd></div>
              <div><dt className="text-slate-500">Designation</dt><dd className="mt-0.5 font-medium text-slate-800">{employee.designation}</dd></div>
              <div><dt className="text-slate-500">Joining date</dt><dd className="mt-0.5 font-medium text-slate-800">{new Date(employee.joining_date).toLocaleDateString()}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Link href={`/employees/${employee.id}`} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500">View</Link>
              <Link href={`/employees/${employee.id}/edit`} className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-400">Edit</Link>
              <button onClick={() => setEmployeeToDelete(employee)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500">Delete</button>
            </div>
          </article>
        ))}
      </div>

      {data && (
        <div className="mt-4 flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => updatePage(Math.max(1, page - 1))} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
          <span className="text-sm text-slate-600">Page {data.page} of {data.total_pages}</span>
          <button disabled={page >= data.total_pages} onClick={() => updatePage(Math.min(data.total_pages, page + 1))} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      )}
    </main>
  );
}
