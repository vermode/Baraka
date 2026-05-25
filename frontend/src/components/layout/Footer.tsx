import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-muted/20 py-12 md:py-16">
      <div className="container max-w-screen-2xl px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center">
        
        <div className="flex flex-col items-center md:items-start gap-2">
          <a href="#" className="flex items-center">
            <img src="/logo.png" alt="البركة" className="h-20 w-auto object-contain" />
          </a>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] inline-block"></span>
            {t('footer.location')}
          </div>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">{t('footer.about')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('footer.forOrgs')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
        </nav>

        <p className="text-sm text-muted-foreground text-center md:text-end">
          {t('footer.copy')}
        </p>

      </div>
    </footer>
  );
}
