"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import { getToken } from "@/lib/auth";

const API_BASE_URL = "https://emp-management-app-backend.onrender.com";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  status: "Active" | "Inactive";
};

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE_URL}/employees/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        setForm({ ...data, joining_date: data.joining_date.split("T")[0] });
      })
      .catch(() => router.push("/employees"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const onChange = (key: keyof FormValues, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    if (!form) return false;
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!/^(\d{10,})$/.test(form.phone.replace(/\D/g, ""))) nextErrors.phone = "Enter a valid phone number";
    if (!form.department.trim()) nextErrors.department = "Department is required";
    if (!form.designation.trim()) nextErrors.designation = "Designation is required";
    if (!form.joining_date) nextErrors.joining_date = "Joining date is required";
    if (!["Active", "Inactive"].includes(form.status)) nextErrors.status = "Status is invalid";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form || !validate()) return;
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/employees/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 409) {
        setErrors({ email: "Employee with this email already exists." });
        return;
      }
      if (response.status === 422) {
        const nextErrors: Record<string, string> = {};
        for (const item of payload.detail || []) {
          const key = item.loc[item.loc.length - 1];
          nextErrors[key] = item.msg;
        }
        setErrors(nextErrors);
        return;
      }
      setErrors({ form: payload.detail || "Unable to update employee" });
      return;
    }

    router.push("/employees");
  };

  if (loading || !form) return <main className="relative min-h-screen bg-slate-100"><PageLoadingOverlay label="Loading employee data" /></main>;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Edit Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Name</span><input value={form.name} onChange={(e) => onChange("name", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.name ? <span className="text-red-600">{errors.name}</span> : null}</label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Email</span><input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.email ? <span className="text-red-600">{errors.email}</span> : null}</label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Phone</span><input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.phone ? <span className="text-red-600">{errors.phone}</span> : null}</label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Department</span><input value={form.department} onChange={(e) => onChange("department", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.department ? <span className="text-red-600">{errors.department}</span> : null}</label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Designation</span><input value={form.designation} onChange={(e) => onChange("designation", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.designation ? <span className="text-red-600">{errors.designation}</span> : null}</label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Joining Date</span><input type="date" value={form.joining_date} onChange={(e) => onChange("joining_date", e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />{errors.joining_date ? <span className="text-red-600">{errors.joining_date}</span> : null}</label>
        </div>
        <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Status</span><select value={form.status} onChange={(e) => onChange("status", e.target.value as "Active" | "Inactive")} className="w-full rounded-md border border-slate-300 px-3 py-2"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>{errors.status ? <span className="text-red-600">{errors.status}</span> : null}</label>
        {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}
        <div className="flex gap-3">
          <Button type="submit">Update Employee</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/employees")}>Cancel</Button>
        </div>
      </form>
    </main>
  );
}
