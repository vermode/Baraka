import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Link, useLocation } from "wouter";
import { Sun, Moon, ShieldCheck, X, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { associations, type Association } from "@/lib/associations";
import { motion, AnimatePresence } from "framer-motion";

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom building-shaped marker for associations
function createMarker(verified: boolean) {
  const primary = verified ? "#178a7a" : "#6b7280";
  const accent  = verified ? "#c9a84c" : "#9ca3af";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <!-- Drop shadow -->
      <ellipse cx="20" cy="46" rx="10" ry="3" fill="rgba(0,0,0,0.25)"/>
      <!-- Pin tail -->
      <path d="M20 44 L14 30 Q20 34 26 30 Z" fill="${primary}"/>
      <!-- Building body -->
      <rect x="6" y="18" width="28" height="16" rx="1" fill="${primary}"/>
      <!-- Roof / pediment -->
      <polygon points="4,19 20,6 36,19" fill="${accent}"/>
      <!-- Crescent on roof peak -->
      <text x="20" y="13" text-anchor="middle" font-size="7" fill="${primary}">☽</text>
      <!-- Door -->
      <rect x="16" y="25" width="8" height="9" rx="1" fill="${accent}" opacity="0.9"/>
      <!-- Windows -->
      <rect x="8"  y="21" width="5" height="4" rx="0.5" fill="${accent}" opacity="0.8"/>
      <rect x="27" y="21" width="5" height="4" rx="0.5" fill="${accent}" opacity="0.8"/>
      <!-- Columns -->
      <rect x="9"  y="19" width="1.5" height="15" fill="${accent}" opacity="0.5"/>
      <rect x="29.5" y="19" width="1.5" height="15" fill="${accent}" opacity="0.5"/>
    </svg>`;
  return L.divIcon({
    className: "",
    html: `<div style="filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));line-height:0">${svg}</div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -46],
  });
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

interface AssocPopupProps {
  assoc: Association;
  isAr: boolean;
  t: (key: string) => string;
  labels: { verified: string; donate: string };
  onClose: () => void;
}

function MarkerWithPopup({ assoc, isAr, t, labels, onClose }: AssocPopupProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.openPopup();
    }
  }, [assoc.id]);

  return (
    <Marker
      ref={markerRef}
      position={[assoc.lat, assoc.lng]}
      icon={createMarker(assoc.verified)}
      eventHandlers={{ popupclose: onClose }}
    >
      <Popup
        className="baraka-popup"
        maxWidth={340}
        minWidth={300}
        autoClose={false}
        closeOnClick={false}
        offset={[0, -44]}
      >
        <div dir={isAr ? "rtl" : "ltr"} style={{ padding: "18px 20px 16px", minWidth: 300 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 40 48">
                <ellipse cx="20" cy="46" rx="10" ry="3" fill="rgba(0,0,0,0.18)"/>
                <path d="M20 44 L14 30 Q20 34 26 30 Z" fill={assoc.verified ? "#178a7a" : "#6b7280"}/>
                <rect x="6" y="18" width="28" height="16" rx="1" fill={assoc.verified ? "#178a7a" : "#6b7280"}/>
                <polygon points="4,19 20,6 36,19" fill={assoc.verified ? "#c9a84c" : "#9ca3af"}/>
                <text x="20" y="13" textAnchor="middle" fontSize="7" fill={assoc.verified ? "#178a7a" : "#6b7280"}>☽</text>
                <rect x="16" y="25" width="8" height="9" rx="1" fill={assoc.verified ? "#c9a84c" : "#9ca3af"} opacity={0.9}/>
                <rect x="8" y="21" width="5" height="4" rx="0.5" fill={assoc.verified ? "#c9a84c" : "#9ca3af"} opacity={0.8}/>
                <rect x="27" y="21" width="5" height="4" rx="0.5" fill={assoc.verified ? "#c9a84c" : "#9ca3af"} opacity={0.8}/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 6, color: "hsl(var(--foreground))" }}>
                {assoc.name}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{
                  display: "inline-block",
                  background: "hsl(var(--primary) / 0.12)",
                  color: "hsl(var(--primary))",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 10px",
                }}>
                  {t(`dir.cats.${assoc.category}`)}
                </span>
                <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  {t(`govs.${assoc.gov}`)}
                </span>
                {assoc.verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "hsl(var(--primary))", fontWeight: 600 }}>
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    {labels.verified}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: "hsl(var(--muted-foreground))",
                lineHeight: 0,
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "hsl(var(--border))", marginBottom: 12 }} />

          {/* Description */}
          <p style={{ fontSize: 13, lineHeight: 1.65, color: "hsl(var(--muted-foreground))", marginBottom: 14 }}>
            {assoc.desc}
          </p>

          {/* Donate button */}
          <button
            onClick={() => navigate("/login")}
            data-testid={`btn-popup-donate-${assoc.id}`}
            style={{
              width: "100%",
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              border: "none",
              borderRadius: 12,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {labels.donate}
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isAr = lang === "ar";
  const [selected, setSelected] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const selectedAssoc = associations.find((a) => a.id === selected);

  const labels = {
    title: isAr ? "خريطة الجمعيات" : "Charity Map",
    subtitle: isAr ? "اكتشف الجمعيات الأردنية الموثّقة على الخريطة" : "Explore verified Jordanian charities on the map",
    home: isAr ? "الرئيسية" : "Home",
    list: isAr ? "القائمة" : "List",
    verified: isAr ? "موثّقة" : "Verified",
    donate: isAr ? "تبرّع الآن" : "Donate Now",
    clickHint: isAr ? "اختر جمعية من القائمة لعرض تفاصيلها على الخريطة" : "Select a charity from the list to see it on the map",
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* Header */}
      <header className="shrink-0 z-[1001] w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center" data-testid="link-logo-map">
              <img src="/logo.png" alt="البركة" className="h-16 w-auto object-contain" />
            </Link>
            <span className="hidden sm:block text-border">|</span>
            <span className="hidden sm:block text-sm font-semibold text-foreground">{labels.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-muted/50 p-1">
              <button onClick={() => setLang("ar")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === "ar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="btn-lang-ar-map">عربي</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="btn-lang-en-map">EN</button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full w-8 h-8" data-testid="btn-theme-map">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Link href="/">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm" data-testid="btn-home-map">{labels.home}</Button>
            </Link>
            <Button variant="outline" size="sm" className="sm:hidden" onClick={() => setPanelOpen((v) => !v)} data-testid="btn-panel-toggle">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body: map + side panel */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Side panel */}
        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.aside
              key="panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="h-full shrink-0 border-e border-border bg-card overflow-hidden z-10 hidden sm:flex flex-col"
              style={{ minWidth: 0 }}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">{labels.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{labels.subtitle}</p>
                  </div>
                  <button onClick={() => setPanelOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50" data-testid="btn-close-panel">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="divide-y divide-border/40">
                  {associations.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a.id === selected ? null : a.id)}
                      data-testid={`btn-assoc-${a.id}`}
                      className={`w-full text-start px-4 py-3.5 hover:bg-muted/40 transition-colors ${selected === a.id ? "bg-primary/10 border-s-2 border-primary" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 40 48" className="mt-0.5 shrink-0">
                          <path d="M20 44 L14 30 Q20 34 26 30 Z" fill={a.verified ? "#178a7a" : "#6b7280"}/>
                          <rect x="6" y="18" width="28" height="16" rx="1" fill={a.verified ? "#178a7a" : "#6b7280"}/>
                          <polygon points="4,19 20,6 36,19" fill={a.verified ? "#c9a84c" : "#9ca3af"}/>
                          <rect x="16" y="25" width="8" height="9" rx="1" fill={a.verified ? "#c9a84c" : "#9ca3af"} opacity={0.9}/>
                          <rect x="8" y="21" width="5" height="4" rx="0.5" fill={a.verified ? "#c9a84c" : "#9ca3af"} opacity={0.8}/>
                          <rect x="27" y="21" width="5" height="4" rx="0.5" fill={a.verified ? "#c9a84c" : "#9ca3af"} opacity={0.8}/>
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{a.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{t(`govs.${a.gov}`)}</span>
                            {a.verified && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-primary">
                                <ShieldCheck className="h-3 w-3" />
                                {labels.verified}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle panel button (desktop, when closed) */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            data-testid="btn-open-panel"
            className="absolute top-4 start-4 z-[999] bg-card border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground shadow-md hover:bg-muted/50 hidden sm:flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            {labels.list}
          </button>
        )}

        {/* Map */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={[31.2, 36.5]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {selectedAssoc && (
              <MarkerWithPopup
                key={selectedAssoc.id}
                assoc={selectedAssoc}
                isAr={isAr}
                t={t}
                labels={labels}
                onClose={() => setSelected(null)}
              />
            )}
            {selectedAssoc && <FlyTo lat={selectedAssoc.lat} lng={selectedAssoc.lng} />}
          </MapContainer>

          {/* Hint */}
          {!selectedAssoc && (
            <div className="absolute top-4 start-1/2 -translate-x-1/2 z-[999] bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 text-xs text-muted-foreground shadow-md pointer-events-none">
              {labels.clickHint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
