import { useLanguage } from "@/contexts/LanguageContext";
import { SITE } from "@/lib/site";
import { Facebook, Instagram, Youtube, Mail, Phone, MessageCircle, Users } from "lucide-react";
import { FaXTwitter, FaTiktok, FaWhatsapp } from "react-icons/fa6";

export function SiteFooter() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="border-t bg-muted/20 py-12 md:py-14 mt-auto">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-start">
        {/* Brand + supervisors */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src="/logo.png" alt="البركة" className="h-16 w-auto object-contain" />
          <p className="text-sm text-muted-foreground max-w-xs">
            {isAr
              ? "منصة الجمعيات الخيرية الموثوقة في جنوب الأردن."
              : "Trusted charity platform for southern Jordan."}
          </p>
          <div className="mt-3 w-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 justify-center md:justify-start">
              <Users className="h-4 w-4 text-primary" />
              {isAr ? "المشرف على المشروع" : "Project Supervisor"}
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {SITE.supervisors.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {isAr ? "تواصل معنا" : "Contact Us"}
          </h3>
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Mail className="h-4 w-4" /> {SITE.email}
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            dir="ltr"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <FaWhatsapp className="h-4 w-4 text-[#25D366]" /> {SITE.whatsapp}
          </a>
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            {isAr ? "صفحتنا على فيسبوك" : "Our Facebook page"}
          </a>
        </div>

        {/* Social icons + copyright */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            {isAr ? "تابعنا على" : "Follow us"}
          </h3>
          <div className="flex items-center gap-3">
            <a href={SITE.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
            </a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <Instagram className="h-4 w-4 text-[#E4405F]" />
            </a>
            <a href={SITE.twitter} target="_blank" rel="noreferrer" aria-label="X" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <FaXTwitter className="h-4 w-4" />
            </a>
            <a href={SITE.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <Youtube className="h-4 w-4 text-[#FF0000]" />
            </a>
            <a href={SITE.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <FaTiktok className="h-4 w-4" />
            </a>
            <a href={SITE.whatsappLink} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isAr ? "© 2026 بركة. جميع الحقوق محفوظة." : "© 2026 Baraka. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
