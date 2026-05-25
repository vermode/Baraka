import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The 1 → 2 progress indicator shown at the top of the donate dialog.
 * Purely presentational — takes the current step and renders accordingly.
 */
export function Stepper({ step }: { step: 1 | 2 }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const dotClass = (active: boolean) =>
    `h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    }`;

  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="flex items-center gap-2 flex-1">
        <span className={dotClass(step >= 1)}>
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
        </span>
        <span className="text-xs font-medium">{isAr ? "الدفع" : "Payment"}</span>
      </div>
      <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-xs font-medium">{isAr ? "نوع التبرع" : "Type"}</span>
        <span className={dotClass(step >= 2)}>2</span>
      </div>
    </div>
  );
}
