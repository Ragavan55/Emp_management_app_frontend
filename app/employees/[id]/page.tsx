"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import StatusBadge from "@/components/ui/StatusBadge";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/employees/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setEmployee(data))
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="relative min-h-screen bg-slate-100"><PageLoadingOverlay label="Loading employee" /></main>;
  if (!employee) return <div className="p-8 text-red-600">Employee not found.</div>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Employee Details</h1>
        <div className="flex gap-3">
          <Link href={`/employees/${employee.id}/edit`} className="rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-400">Edit</Link>
          <Link href="/employees" className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50">Back</Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{employee.name}</h2>
            <p className="text-slate-500">{employee.designation}</p>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <dl className="grid gap-6 md:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Email</dt><dd className="mt-1 font-medium">{employee.email}</dd></div>
          <div><dt className="text-sm text-slate-500">Phone</dt><dd className="mt-1 font-medium">{employee.phone}</dd></div>
          <div><dt className="text-sm text-slate-500">Department</dt><dd className="mt-1 font-medium">{employee.department}</dd></div>
          <div><dt className="text-sm text-slate-500">Joining Date</dt><dd className="mt-1 font-medium">{new Date(employee.joining_date).toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </main>
  );
}
