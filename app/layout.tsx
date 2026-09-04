import type { Metadata } from "next";
import "./globals.css";
import AppNavigation from "@/components/AppNavigation";

export const metadata: Metadata = {
  title: "Employee Management",
  description: "Mini employee management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <AppNavigation />
        <div className="md:pr-16">{children}</div>
      </body>
    </html>
  );
}
