import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  Building2,
  FileCheck2,
  HandCoins,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetStats,
  useListOrganizations,
  useListBeneficiaries,
  useListDonations,
  useListAnnouncements,
  useListUsers,
  useListHelpRequests,
  useListRegistrationRequests,
} from "@workspace/api-client-react";

import { StatBox } from "./admin/StatBox";
import { OrganizationsTab } from "./admin/OrganizationsTab";
import { BeneficiariesTab } from "./admin/BeneficiariesTab";
import { DonationsTab } from "./admin/DonationsTab";
import { AnnouncementsTab } from "./admin/AnnouncementsTab";
import { UsersTab } from "./admin/UsersTab";
import { HelpRequestsTab } from "./admin/HelpRequestsTab";
import { RegistrationRequestsTab } from "./admin/RegistrationRequestsTab";

/**
 * Admin control panel — the shell. Everything tab-specific lives in
 * `./admin/*Tab.tsx`. This file is intentionally light: it just guards access,
 * shows the top stat row, and routes between the seven tabs.
 *
 * Each tab fetches its own data via React Query hooks; the queries here are
 * only used to render the count badges on the tab triggers. React Query
 * dedupes by key, so the tabs share the cache automatically — no double fetch.
 */
export default function Admin() {
  const { lang } = useLanguage();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const isAr = lang === "ar";

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  // Cache-shared queries used only for the tab badge counts.
  const stats = useGetStats();
  const orgs = useListOrganizations();
  const beneficiaries = useListBeneficiaries();
  const announcements = useListAnnouncements();
  const adminOnly = { query: { enabled: user?.role === "admin" } as never };
  const donations = useListDonations(adminOnly);
  const users = useListUsers(adminOnly);
  const helpRequests = useListHelpRequests(adminOnly);
  const registrationRequests = useListRegistrationRequests(adminOnly);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {isAr ? "جارٍ التحقق..." : "Verifying..."}
      </div>
    );
  }

  const pendingHelp =
    helpRequests.data?.filter((r) => r.status === "pending").length ?? 0;
  const pendingReg =
    registrationRequests.data?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-1 container mx-auto max-w-screen-2xl px-4 sm:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-extrabold">
              {isAr ? "لوحة التحكم" : "Admin Control Panel"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "إدارة الجمعيات والمستفيدين والمتبرعين والإعلانات."
                : "Manage organizations, beneficiaries, donors, and announcements."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatBox
            icon={Building2}
            label={isAr ? "جمعيات" : "Organizations"}
            value={stats.data?.organizationCount ?? 0}
          />
          <StatBox
            icon={UserCircle2}
            label={isAr ? "مستفيدون" : "Beneficiaries"}
            value={stats.data?.beneficiaryCount ?? 0}
          />
          <StatBox
            icon={Users}
            label={isAr ? "متبرعون" : "Donors"}
            value={stats.data?.donorCount ?? 0}
          />
          <StatBox
            icon={HandCoins}
            label={isAr ? "تبرعات" : "Donations"}
            value={stats.data?.donationCount ?? 0}
          />
          <StatBox
            icon={HandCoins}
            label={isAr ? "إجمالي" : "Total raised"}
            value={`${(stats.data?.totalRaised ?? 0).toLocaleString("en-US")} ${
              isAr ? "د.أ" : "JOD"
            }`}
          />
        </div>

        <Tabs defaultValue="orgs">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="orgs">
              <Building2 className="h-4 w-4 me-1" />
              {isAr ? "الجمعيات" : "Orgs"}
              <CountPill value={orgs.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="beneficiaries">
              <UserCircle2 className="h-4 w-4 me-1" />
              {isAr ? "المستفيدون" : "Beneficiaries"}
              <CountPill value={beneficiaries.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="donations">
              <HandCoins className="h-4 w-4 me-1" />
              {isAr ? "التبرعات" : "Donations"}
              <CountPill value={donations.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <Megaphone className="h-4 w-4 me-1" />
              {isAr ? "الإعلانات" : "Announcements"}
              <CountPill value={announcements.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 me-1" />
              {isAr ? "المستخدمون" : "Users"}
              <CountPill value={users.data?.length ?? 0} />
            </TabsTrigger>
            <TabsTrigger value="help-requests">
              <LifeBuoy className="h-4 w-4 me-1" />
              {isAr ? "طلبات المساعدة" : "Help Requests"}
              <CountPill value={pendingHelp} variant="warning" />
            </TabsTrigger>
            <TabsTrigger value="registration-requests">
              <FileCheck2 className="h-4 w-4 me-1" />
              {isAr ? "طلبات التسجيل" : "Registration Requests"}
              <CountPill value={pendingReg} variant="warning" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orgs">
            <OrganizationsTab />
          </TabsContent>
          <TabsContent value="beneficiaries">
            <BeneficiariesTab />
          </TabsContent>
          <TabsContent value="donations">
            <DonationsTab />
          </TabsContent>
          <TabsContent value="announcements">
            <AnnouncementsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="help-requests">
            <HelpRequestsTab />
          </TabsContent>
          <TabsContent value="registration-requests">
            <RegistrationRequestsTab />
          </TabsContent>
        </Tabs>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Tiny count chip used on tab triggers — primary tint by default, amber when pending. */
function CountPill({ value, variant }: { value: number; variant?: "warning" }) {
  const styles =
    variant === "warning"
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      : "bg-primary/15 text-primary";
  return (
    <span className={`ms-1.5 text-[10px] rounded-full px-1.5 font-en ${styles}`}>
      {value}
    </span>
  );
}
