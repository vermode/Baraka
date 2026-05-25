import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Search, Trash2, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useListUsers,
  useDeleteUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";

import { downloadCsv } from "./csv";

/** Admin tab: list every registered user, with a delete button (except self). */
export function UsersTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { user } = useAuth();
  const qc = useQueryClient();

  const users = useListUsers({
    query: { enabled: user?.role === "admin" } as never,
  });
  const deleteUser = useDeleteUser();

  const [query, setQuery] = useState("");

  const list = (users.data ?? []).filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? "").toLowerCase().includes(q)
    );
  });

  async function handleDelete(id: number) {
    if (!confirm(isAr ? "حذف هذا المستخدم؟" : "Delete user?")) return;
    await deleteUser.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    toast.success(isAr ? "تم الحذف" : "Deleted");
  }

  function exportCsv() {
    const rows = list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone ?? "",
      createdAt: u.createdAt,
    }));
    downloadCsv("users.csv", rows);
    toast.success(isAr ? "تم تصدير الملف" : "CSV downloaded");
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <h2 className="font-bold">{isAr ? "المستخدمون" : "Users"}</h2>
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isAr ? "ابحث بالاسم، البريد، الهاتف..." : "Search name, email, phone..."
              }
              className="ps-9 h-9"
              data-testid="search-users"
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          data-testid="btn-export-users"
          onClick={exportCsv}
        >
          <Download className="h-4 w-4 me-1" />
          {isAr ? "تصدير CSV" : "Export CSV"}
        </Button>
      </div>

      <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {list.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {isAr ? "لا توجد نتائج" : "No results"}
          </div>
        )}
        {list.map((u) => (
          <div key={u.id} className="p-4 flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">
                {u.name}
                {u.role === "admin" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary ms-1">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {u.email}
                {u.phone ? ` · ${u.phone}` : ""}
              </div>
            </div>
            {u.id !== user?.id && (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
