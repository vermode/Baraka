import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ChatBot } from "@/components/ChatBot";
import { DonateDialog } from "@/components/DonateDialog";
import {
  useListOrganizations,
  useListAnnouncements,
  useListNotifications,
  useListMyDonations,
  useListApprovedHelpRequests,
  useGetStats,
  useMarkNotificationRead,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Bell, BellRing, HandCoins, ShieldCheck, MapPin, Megaphone, AlertTriangle,
  Building2, TrendingUp, Users, BadgeCheck, Search, LifeBuoy, KeyRound,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function StatCard({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-2xl font-extrabold text-foreground">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ms-1">{suffix}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { lang } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const orgs = useListOrganizations();
  const announcements = useListAnnouncements();
  const notifications = useListNotifications({ query: { enabled: !!user } as any });
  const myDonations = useListMyDonations({ query: { enabled: !!user } as any });
  const approvedRequests = useListApprovedHelpRequests({ query: { enabled: !!user } as any });
  const stats = useGetStats();
  const markRead = useMarkNotificationRead();

  const filteredOrgs = useMemo(() => {
    const list = orgs.data ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  }, [orgs.data, search]);

  const mappable = (orgs.data ?? []).filter((o) => o.lat != null && o.lng != null);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">{isAr ? "يلزم تسجيل الدخول" : "Login required"}</h2>
          <p className="text-muted-foreground mb-4">{isAr ? "سجّل الدخول للوصول إلى لوحتك" : "Please sign in to access your dashboard"}</p>
          <a href="/login"><Button>{isAr ? "تسجيل الدخول" : "Sign in"}</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1">
        {/* Welcome + stats */}
        <section className="container mx-auto max-w-screen-2xl px-4 sm:px-8 pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {isAr ? "متبرع موثّق" : "Verified donor"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
              {isAr ? `أهلاً ${user.name}` : `Welcome, ${user.name}`}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? "هذه لوحتك. تبرّع، تابع تبرعاتك، واقرأ آخر الإعلانات." : "Your dashboard. Donate, track your contributions, and stay up to date."}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={HandCoins} label={isAr ? "إجمالي التبرعات" : "Total raised"} value={stats.data?.totalRaised ?? 0} suffix={isAr ? "د.أ" : "JOD"} />
            <StatCard icon={Users} label={isAr ? "المتبرعون" : "Donors"} value={stats.data?.donorCount ?? 0} />
            <StatCard icon={Building2} label={isAr ? "الجمعيات" : "Organizations"} value={stats.data?.organizationCount ?? 0} />
            <StatCard icon={TrendingUp} label={isAr ? "تبرعاتك" : "Your donations"} value={myDonations.data?.length ?? 0} />
          </div>
        </section>

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Left: organizations */}
          <section className="lg:col-span-2 space-y-6">
            {/* Promo banner */}
            <div className="rounded-3xl overflow-hidden border border-border bg-gradient-to-r from-primary/15 to-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <img src="/logo.png" alt="" className="h-20 w-auto object-contain" />
              <div className="flex-1 text-center sm:text-start">
                <h2 className="text-xl sm:text-2xl font-extrabold mb-1">
                  {isAr ? "حملة الشتاء الدافئ" : "Warm Winter Campaign"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "ساهم بتدفئة أسر معان والمحافظات الجنوبية هذا الشتاء. كل دينار يصنع فرقاً." : "Help warm families in Ma'an and southern Jordan this winter. Every JOD counts."}
                </p>
              </div>
            </div>

            {/* Organizations list */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{isAr ? "الجمعيات الخيرية" : "Charities"}</h2>
                </div>
                <div className="relative">
                  <Search className="h-4 w-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isAr ? "ابحث..." : "Search..."}
                    className="ps-9 w-56"
                  />
                </div>
              </div>
              <div className="divide-y divide-border">
                {orgs.isLoading && <div className="p-5 text-muted-foreground text-sm">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>}
                {filteredOrgs.map((org) => (
                  <div key={org.id} className="p-5 flex items-start gap-4 hover:bg-muted/30">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{org.name}</h3>
                        {org.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {org.governorate}</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted/50">{org.category}</span>
                      </div>
                    </div>
                    <DonateDialog org={org} />
                  </div>
                ))}
                {!orgs.isLoading && filteredOrgs.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">{isAr ? "لا توجد نتائج" : "No results"}</div>
                )}
              </div>
            </div>

            {/* Approved help requests — donate directly to a person in need */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{isAr ? "حالات بحاجة للمساعدة" : "People who need help"}</h2>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {(approvedRequests.data ?? []).length === 0 && (
                  <div className="p-5 text-center text-muted-foreground text-sm">{isAr ? "لا توجد حالات حالياً" : "No cases right now"}</div>
                )}
                {(approvedRequests.data ?? []).map((r) => (
                  <div key={r.id} className="p-5 flex items-start gap-4 hover:bg-muted/30">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <LifeBuoy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{r.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.governorate}</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted/50">{r.aidType}</span>
                      </div>
                    </div>
                    <DonateDialog helpRequest={{ id: r.id, name: r.name }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{isAr ? "خريطة الجمعيات" : "Charity map"}</h2>
              </div>
              <div className="h-80">
                <MapContainer center={[30.5, 35.7]} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mappable.map((o) => (
                    <Marker key={o.id} position={[o.lat!, o.lng!]} icon={markerIcon}>
                      <Popup>
                        <strong>{o.name}</strong>
                        <br />
                        <span className="text-xs">{o.governorate}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </section>

          {/* Right: notifications + announcements + my donations */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{isAr ? "إشعاراتي" : "Notifications"}</h3>
                {notifications.data && notifications.data.filter(n => !n.read).length > 0 && (
                  <span className="ms-auto text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {notifications.data.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {(notifications.data ?? []).length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">{isAr ? "لا توجد إشعارات" : "No notifications"}</div>
                )}
                {(notifications.data ?? []).map((n) => (
                  <button
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        await markRead.mutateAsync({ id: n.id });
                        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
                      }
                    }}
                    className={`w-full text-start p-3 hover:bg-muted/30 ${n.read ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read ? <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <span className="h-4 w-4 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.body}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{isAr ? "الإعلانات والتنبيهات" : "Alerts & announcements"}</h3>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {(announcements.data ?? []).length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">{isAr ? "لا توجد إعلانات" : "No announcements"}</div>
                )}
                {(announcements.data ?? []).map((a) => (
                  <div key={a.id} className="p-3">
                    <div className="flex items-start gap-2">
                      {a.kind === "alert" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      ) : (
                        <Megaphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.body}</div>
                        {a.organizationName && (
                          <div className="text-[11px] text-muted-foreground/80 mt-1">— {a.organizationName}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <HandCoins className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{isAr ? "تبرعاتي الأخيرة" : "My recent donations"}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {(myDonations.data ?? []).length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground text-center">{isAr ? "لم تتبرع بعد" : "No donations yet"}</div>
                )}
                {(myDonations.data ?? []).map((d) => (
                  <div key={d.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{d.organizationName ?? (isAr ? "تبرع عام" : "General donation")}</div>
                        <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString(isAr ? "ar" : "en")}</div>
                      </div>
                      <div className="text-sm font-bold text-primary shrink-0">{d.amount} {isAr ? "د.أ" : "JOD"}</div>
                    </div>
                    {d.otp && (
                      <div className="mt-2 text-[11px] font-mono inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded px-2 py-1">
                        {isAr ? "رمز التتبع:" : "Tracking code:"} {d.otp}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {d.deliveredConfirmed ? (
                        <span className="text-[11px] text-green-600">
                          {isAr ? "✓ أكّد المستفيد الاستلام" : "✓ Recipient confirmed receipt"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600">
                          {isAr ? "⏳ بانتظار تأكيد الاستلام" : "⏳ Awaiting receipt confirmation"}
                        </span>
                      )}
                      {d.otp && (
                        <Link href={`/track?type=donation&otp=${d.otp}`}>
                          <button className="text-[11px] inline-flex items-center gap-1 text-primary hover:underline" data-testid={`link-track-${d.id}`}>
                            <KeyRound className="h-3 w-3" />
                            {isAr ? "تتبع" : "Track"}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <ChatBot />
    </div>
  );
}
