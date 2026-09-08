"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; form?: string }>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_RE.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await api.post("/auth/signup", {
        name: name.trim() || null,
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      router.push("/login?created=1");
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Could not create account" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Name (optional)" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} autoComplete="email" />

          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} autoComplete="new-password" />

          <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} autoComplete="new-password" />

          {errors.form ? <p className="text-sm text-amber-700">{errors.form}</p> : null}

          <Button type="submit" loading={loading} disabled={loading} className="w-full">{loading ? "Creating account..." : "Create account"}</Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">Log in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}