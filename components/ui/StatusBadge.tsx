type StatusBadgeProps = {
  status: "Active" | "Inactive";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const palette =
    status === "Active"
      ? "bg-green-100 text-green-700 ring-green-600/20"
      : "bg-red-100 text-red-700 ring-red-600/20";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${palette}`}>
      {status}
    </span>
  );
}
