import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, ShieldCheck, LogOut, Bell,
  Building2, Newspaper, HandCoins, UserCircle2, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  useListNotifications,
  useMarkNotificationRead,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * The signed-in user cluster shown in the header: admin shortcut, notifications
 * popover, and the account dropdown (name, email, navigation, logout).
 * Self-contained — reads auth + notifications itself so any header can drop it in.
 * Renders nothing while logged out.
 */
export function UserMenu() {
  const { lang } = useLanguage();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const isAr = lang === "ar";
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  const notifications = useListNotifications({
    query: {
      queryKey: getListNotificationsQueryKey(),
      enabled: !!user,
      refetchInterval: 30_000,
    },
  });
  const markRead = useMarkNotificationRead();
  const list = notifications.data ?? [];
  const unreadCount = list.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <>
      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-primary"
          onClick={() => setLocation("/admin")}
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">{isAr ? "لوحة التحكم" : "Admin"}</span>
        </Button>
      )}

      {/* Notifications popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 relative"
            data-testid="btn-notifications"
            aria-label={isAr ? "الإشعارات" : "Notifications"}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0" dir={isAr ? "rtl" : "ltr"}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="font-bold text-sm">{isAr ? "الإشعارات" : "Notifications"}</div>
            {unreadCount > 0 && (
              <span className="text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5">
                {unreadCount} {isAr ? "جديد" : "new"}
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {list.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {isAr ? "لا توجد إشعارات بعد" : "No notifications yet"}
              </div>
            )}
            {list.slice(0, 12).map((n) => (
              <button
                key={n.id}
                onClick={async () => {
                  if (!n.read) {
                    await markRead.mutateAsync({ id: n.id });
                    qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
                  }
                }}
                className={`w-full text-start p-3 hover:bg-muted/30 ${n.read ? "opacity-70" : ""}`}
                data-testid={`notification-${n.id}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read
                    ? <Bell className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    : <span className="h-3.5 w-3.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.createdAt).toLocaleString(isAr ? "ar" : "en")}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Account dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 ps-2 transition-colors"
            data-testid="btn-user-menu"
            aria-label={isAr ? "قائمة المستخدم" : "User menu"}
          >
            <div className="hidden md:flex flex-col text-xs leading-tight text-end">
              <span className="font-semibold text-foreground truncate max-w-[140px]">{user.name}</span>
              <span className="text-muted-foreground truncate max-w-[140px]">{user.email}</span>
            </div>
            <span className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="font-semibold truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation("/app")} data-testid="menu-dashboard">
            <LayoutDashboard className="h-4 w-4 me-2" />
            {isAr ? "لوحتي" : "Dashboard"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/")} data-testid="menu-orgs">
            <Building2 className="h-4 w-4 me-2" />
            {isAr ? "الجمعيات" : "Associations"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/")} data-testid="menu-news">
            <Newspaper className="h-4 w-4 me-2" />
            {isAr ? "الأخبار" : "News"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('[data-testid="btn-notifications"]');
              btn?.click();
            }}
            data-testid="menu-notifications"
          >
            <Bell className="h-4 w-4 me-2" />
            {isAr ? "الإشعارات" : "Notifications"}
            {unreadCount > 0 && (
              <span className="ms-auto text-[10px] rounded-full bg-primary text-primary-foreground px-1.5">
                {unreadCount}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/app")} data-testid="menu-donations">
            <HandCoins className="h-4 w-4 me-2" />
            {isAr ? "تبرعاتي" : "My Donations"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/track?type=donation")} data-testid="menu-track">
            <KeyRound className="h-4 w-4 me-2" />
            {isAr ? "تتبّع تبرعي" : "Track my donation"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/app")} data-testid="menu-profile">
            <UserCircle2 className="h-4 w-4 me-2" />
            {isAr ? "الملف الشخصي" : "Profile"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout.mutate(undefined, { onSuccess: () => setLocation("/") })}
            data-testid="menu-logout"
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 me-2" />
            {isAr ? "تسجيل الخروج" : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
