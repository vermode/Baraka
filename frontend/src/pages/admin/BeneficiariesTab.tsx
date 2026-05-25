import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit3, Plus, Search, Trash2, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useListBeneficiaries,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
  useListOrganizations,
  getListBeneficiariesQueryKey,
  type Beneficiary,
} from "@workspace/api-client-react";

import { BenForm } from "./BenForm";

/** Admin tab: list / create / edit / delete beneficiaries. */
export function BeneficiariesTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const qc = useQueryClient();

  const beneficiaries = useListBeneficiaries();
  // The form's organization picker needs the org list. React Query dedupes this
  // call with the OrganizationsTab's own hook, so it's effectively free.
  const orgs = useListOrganizations();
  const createBen = useCreateBeneficiary();
  const updateBen = useUpdateBeneficiary();
  const deleteBen = useDeleteBeneficiary();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);

  const list = (beneficiaries.data ?? []).filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) || (b.story ?? "").toLowerCase().includes(q)
    );
  });

  async function handleSave(payload: Record<string, unknown>) {
    try {
      if (editing) {
        await updateBen.mutateAsync({ id: editing.id, data: payload as never });
        toast.success(isAr ? "تم التحديث" : "Updated");
      } else {
        await createBen.mutateAsync({ data: payload as never });
        toast.success(isAr ? "تم الإنشاء" : "Created");
      }
      qc.invalidateQueries({ queryKey: getListBeneficiariesQueryKey() });
      setDialogOpen(false);
      setEditing(null);
    } catch {
      toast.error(isAr ? "فشل" : "Failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(isAr ? "حذف هذا المستفيد؟" : "Delete?")) return;
    await deleteBen.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListBeneficiariesQueryKey() });
    toast.success(isAr ? "تم الحذف" : "Deleted");
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <h2 className="font-bold">{isAr ? "المستفيدون" : "Beneficiaries"}</h2>
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isAr ? "ابحث بالاسم أو القصة..." : "Search by name or story..."
              }
              className="ps-9 h-9"
              data-testid="search-ben"
            />
          </div>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              onClick={() => setEditing(null)}
            >
              <Plus className="h-4 w-4 me-1" />
              {isAr ? "جديد" : "New"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? isAr
                    ? "تعديل"
                    : "Edit"
                  : isAr
                    ? "إضافة مستفيد"
                    : "New beneficiary"}
              </DialogTitle>
            </DialogHeader>
            <BenForm
              initial={editing ?? undefined}
              orgs={orgs.data ?? []}
              submitLabel={
                editing ? (isAr ? "حفظ" : "Save") : isAr ? "إنشاء" : "Create"
              }
              onSubmit={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {list.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {isAr ? "لا توجد نتائج" : "No results"}
          </div>
        )}
        {list.map((b) => (
          <div key={b.id} className="p-4 flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-2">
                {b.name}
                {b.urgent && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                    {isAr ? "عاجل" : "URGENT"}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {b.story}
              </div>
              <div className="text-[11px] text-muted-foreground/70 mt-1">
                {b.raisedAmount} / {b.needAmount} {isAr ? "د.أ" : "JOD"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditing(b);
                setDialogOpen(true);
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
