import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  Check,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  UserCircle2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useListRegistrationRequests,
  useUpdateRegistrationRequest,
  getListRegistrationRequestsQueryKey,
} from "@workspace/api-client-react";

import { StatusBadge } from "./StatusBadge";

/** Admin tab: review applications from charities wanting to join the platform. */
export function RegistrationRequestsTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { user } = useAuth();
  const qc = useQueryClient();

  const registrationRequests = useListRegistrationRequests({
    query: { enabled: user?.role === "admin" } as never,
  });
  const updateRegistration = useUpdateRegistrationRequest();

  const rows = registrationRequests.data ?? [];
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  async function review(id: number, status: "approved" | "rejected") {
    const promptText =
      status === "approved"
        ? isAr
          ? "ملاحظة (اختياري):"
          : "Note (optional):"
        : isAr
          ? "سبب الرفض:"
          : "Reason for rejection:";
    const note = prompt(promptText) ?? "";
    try {
      await updateRegistration.mutateAsync({
        id,
        data: { status, adminNote: note || undefined },
      });
      qc.invalidateQueries({ queryKey: getListRegistrationRequestsQueryKey() });
      toast.success(
        status === "approved"
          ? isAr
            ? "تمت الموافقة"
            : "Approved"
          : isAr
            ? "تم الرفض"
            : "Rejected",
      );
    } catch {
      toast.error(isAr ? "فشل" : "Failed");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          {isAr ? "طلبات تسجيل الجمعيات" : "Charity registration requests"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {isAr
            ? `${rows.length} طلب · ${pendingCount} قيد المراجعة`
            : `${rows.length} total · ${pendingCount} pending`}
        </span>
      </div>

      <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {rows.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {isAr ? "لا توجد طلبات بعد" : "No requests yet"}
          </div>
        )}

        {rows.map((r) => (
          <div key={r.id} className="p-4" data-testid={`registration-request-${r.id}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2 flex-wrap">
                  {r.orgName}
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.governorate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {r.category}
                  </span>
                  {r.regNumber && <span className="font-en">#{r.regNumber}</span>}
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{r.about}</p>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-border/50">
                  <span className="inline-flex items-center gap-1">
                    <UserCircle2 className="h-3 w-3" />
                    {r.contactName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {r.contactPhone}
                  </span>
                  {r.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {r.email}
                    </span>
                  )}
                </div>
                {r.adminNote && (
                  <p className="text-xs mt-2 italic text-muted-foreground bg-muted/30 rounded p-2">
                    {isAr ? "ملاحظة المشرف:" : "Admin note:"} {r.adminNote}
                  </p>
                )}
                <div className="text-[10px] text-muted-foreground/70 mt-2 font-en">
                  {new Date(r.createdAt).toLocaleString(isAr ? "ar" : "en")}
                </div>
              </div>

              {r.status === "pending" && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid={`btn-approve-reg-${r.id}`}
                    onClick={() => review(r.id, "approved")}
                  >
                    <Check className="h-3.5 w-3.5 me-1" />
                    {isAr ? "موافقة" : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    data-testid={`btn-reject-reg-${r.id}`}
                    onClick={() => review(r.id, "rejected")}
                  >
                    <X className="h-3.5 w-3.5 me-1" />
                    {isAr ? "رفض" : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
