import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useListAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useListOrganizations,
  getListAnnouncementsQueryKey,
} from "@workspace/api-client-react";

const EMPTY_FORM = { title: "", body: "", kind: "news", organizationId: "" as string | number };

/** Admin tab: post and delete news / alerts. */
export function AnnouncementsTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const qc = useQueryClient();

  const announcements = useListAnnouncements();
  const orgs = useListOrganizations();
  const createAnn = useCreateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function handlePublish() {
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        body: form.body,
        kind: form.kind,
      };
      if (form.organizationId) {
        payload.organizationId = parseInt(String(form.organizationId), 10);
      }
      await createAnn.mutateAsync({ data: payload as never });
      qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      toast.success(isAr ? "تم النشر" : "Published");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error(isAr ? "فشل" : "Failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(isAr ? "حذف هذا الإعلان؟" : "Delete?")) return;
    await deleteAnn.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
    toast.success(isAr ? "تم الحذف" : "Deleted");
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold">
          {isAr ? "الإعلانات والتنبيهات" : "Announcements & alerts"}
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 me-1" />
              {isAr ? "جديد" : "New"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isAr ? "إعلان جديد" : "New announcement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{isAr ? "العنوان" : "Title"}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>{isAr ? "المحتوى" : "Body"}</Label>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isAr ? "النوع" : "Kind"}</Label>
                  <select
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  >
                    <option value="news">{isAr ? "خبر" : "News"}</option>
                    <option value="alert">{isAr ? "تنبيه" : "Alert"}</option>
                  </select>
                </div>
                <div>
                  <Label>
                    {isAr ? "الجمعية (اختياري)" : "Organization (optional)"}
                  </Label>
                  <select
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={form.organizationId as string}
                    onChange={(e) =>
                      setForm({ ...form, organizationId: e.target.value })
                    }
                  >
                    <option value="">—</option>
                    {(orgs.data ?? []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handlePublish}
                className="bg-primary text-primary-foreground"
              >
                {isAr ? "نشر" : "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {(announcements.data ?? []).map((a) => (
          <div key={a.id} className="p-4 flex items-start gap-3">
            <Megaphone
              className={`h-5 w-5 ${
                a.kind === "alert" ? "text-amber-500" : "text-primary"
              } shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.body}</div>
              <div className="text-[11px] text-muted-foreground/70 mt-1">
                {a.organizationName ?? (isAr ? "عام" : "global")} ·{" "}
                {new Date(a.createdAt).toLocaleDateString(isAr ? "ar" : "en")}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
