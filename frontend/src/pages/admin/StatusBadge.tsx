import { useLanguage } from "@/contexts/LanguageContext";

type Status = "pending" | "approved" | "rejected" | string;

/**
 * Pill-shaped badge showing approval status — shared by the help-requests and
 * registration-requests tabs so they look identical and stay in sync.
 */
export function StatusBadge({ status }: { status: Status }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const styles =
    status === "approved"
      ? "bg-green-500/15 text-green-600 dark:text-green-400"
      : status === "rejected"
        ? "bg-destructive/15 text-destructive"
        : "bg-amber-500/15 text-amber-600 dark:text-amber-400";

  const label =
    status === "approved"
      ? isAr
        ? "موافَق"
        : "Approved"
      : status === "rejected"
        ? isAr
          ? "مرفوض"
          : "Rejected"
        : isAr
          ? "قيد المراجعة"
          : "Pending";

  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles}`}>{label}</span>;
}
