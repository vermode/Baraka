import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, HandCoins, Search, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useListDonations } from "@workspace/api-client-react";

import { downloadCsv } from "./csv";

/**
 * Admin tab: read-only list of every donation, plus a top-donors leaderboard.
 * (Donations are never edited or deleted from the admin panel — they're
 * historical records.)
 */
export function DonationsTab() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { user } = useAuth();

  // Only fetch when an admin is viewing, mirroring the original page behaviour.
  const donations = useListDonations({
    query: { enabled: user?.role === "admin" } as never,
  });

  const [query, setQuery] = useState("");

  const list = (donations.data ?? []).filter((d) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (d.donorName ?? "").toLowerCase().includes(q) ||
      (d.organizationName ?? "").toLowerCase().includes(q) ||
      (d.message ?? "").toLowerCase().includes(q)
    );
  });

  // Top 5 donors by total amount. Memo'd so we don't recompute on every render.
  const topDonors = useMemo(() => {
    const totals = new Map<string, { name: string; total: number; count: number }>();
    for (const d of donations.data ?? []) {
      const key = d.donorName ?? "—";
      const prev = totals.get(key) ?? { name: key, total: 0, count: 0 };
      prev.total += d.amount;
      prev.count += 1;
      totals.set(key, prev);
    }
    return Array.from(totals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [donations.data]);

  function exportCsv() {
    const rows = list.map((d) => ({
      id: d.id,
      donor: d.donorName ?? "",
      organization: d.organizationName ?? "",
      amount: d.amount,
      message: d.message ?? "",
      createdAt: d.createdAt,
    }));
    downloadCsv("donations.csv", rows);
    toast.success(isAr ? "تم تصدير الملف" : "CSV downloaded");
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <h2 className="font-bold">{isAr ? "جميع التبرعات" : "All donations"}</h2>
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isAr
                    ? "ابحث بالمتبرع، الجمعية، الرسالة..."
                    : "Search donor, charity, message..."
                }
                className="ps-9 h-9"
                data-testid="search-don"
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            data-testid="btn-export-donations"
            onClick={exportCsv}
          >
            <Download className="h-4 w-4 me-1" />
            {isAr ? "تصدير CSV" : "Export CSV"}
          </Button>
        </div>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {list.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد تبرعات" : "No donations"}
            </div>
          )}
          {list.map((d) => (
            <div key={d.id} className="p-4 flex items-center gap-3">
              <HandCoins className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">
                  {d.donorName ?? "—"} → {d.organizationName ?? (isAr ? "عام" : "general")}
                </div>
                {d.message && (
                  <div className="text-xs text-muted-foreground">"{d.message}"</div>
                )}
                <div className="text-[11px] text-muted-foreground/70 mt-1">
                  {new Date(d.createdAt).toLocaleString(isAr ? "ar" : "en")}
                </div>
              </div>
              <div className="text-lg font-extrabold text-primary">
                {d.amount} {isAr ? "د.أ" : "JOD"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold">{isAr ? "أبرز المتبرعين" : "Top donors"}</h2>
        </div>
        <div className="divide-y divide-border">
          {topDonors.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد بيانات" : "No data yet"}
            </div>
          )}
          {topDonors.map((td, i) => (
            <div
              key={td.name + i}
              className="p-4 flex items-center gap-3"
              data-testid={`top-donor-${i}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  i === 0
                    ? "bg-amber-500/20 text-amber-500"
                    : i === 1
                      ? "bg-zinc-400/20 text-zinc-400"
                      : i === 2
                        ? "bg-orange-700/20 text-orange-500"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{td.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {td.count} {isAr ? "تبرع" : "donations"}
                </div>
              </div>
              <div className="font-extrabold text-primary font-en">
                {td.total.toLocaleString("en-US")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
