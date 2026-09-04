import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="block w-full text-sm font-medium text-slate-700">
      {label ? <span className="mb-1.5 block">{label}</span> : null}
      <input
        {...props}
        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""} ${className}`}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
