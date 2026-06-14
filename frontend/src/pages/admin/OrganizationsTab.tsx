import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/lib/errors";
import { BadgeCheck, Building2, Edit3, Plus, Search, Trash2 } from "lucide-react";

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
  useListOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  getListOrganizationsQueryKey,
  type Organization,
} from "@workspace/api-client-react";

import { OrgForm } from "./OrgForm";

/** Admin tab: list / create / edit / delete charities. */
export function OrganizationsTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const qc = useQueryClient();

  const orgs = useListOrganizations();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);

  const list = (orgs.data ?? []).filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      (o.description ?? "").toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      o.governorate.toLowerCase().includes(q)
    );
  });

  async function handleSave(payload: Record<string, unknown>) {
    try {
      if (editing) {
        await updateOrg.mutateAsync({ id: editing.id, data: payload as never });
        notifySuccess(isAr ? "تم التحديث" : "Updated");
      } else {
        await createOrg.mutateAsync({ data: payload as never });
        notifySuccess(isAr ? "تم الإنشاء" : "Created");
      }
      qc.invalidateQueries({ queryKey: getListOrganizationsQueryKey() });
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      notifyError(err, lang);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(isAr ? "حذف هذه الجمعية؟" : "Delete this organization?")) return;
    await deleteOrg.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListOrganizationsQueryKey() });
    notifySuccess(isAr ? "تم الحذف" : "Deleted");
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <h2 className="font-bold">{isAr ? "الجمعيات" : "Organizations"}</h2>
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث بالاسم، الفئة، المحافظة..."
                  : "Search by name, category, governorate..."
              }
              className="ps-9 h-9"
              data-testid="search-orgs"
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
              {isAr ? "جديدة" : "New"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? isAr
                    ? "تعديل جمعية"
                    : "Edit organization"
                  : isAr
                    ? "إضافة جمعية"
                    : "New organization"}
              </DialogTitle>
            </DialogHeader>
            <OrgForm
              initial={editing ?? undefined}
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
        {list.map((o) => (
          <div key={o.id} className="p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-2">
                {o.name}
                {o.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {o.description}
              </div>
              <div className="text-[11px] text-muted-foreground/70 mt-1">
                {o.governorate} · {o.category}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditing(o);
                setDialogOpen(true);
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
