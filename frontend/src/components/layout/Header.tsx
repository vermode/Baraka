import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Map } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center" data-testid="link-logo">
          <img src="/logo.png" alt="البركة" className="h-20 w-auto object-contain" />
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center rounded-full bg-muted/50 p-1">
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === 'ar' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="btn-lang-ar"
            >
              عربي
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="btn-lang-en"
            >
              EN
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full w-8 h-8"
            data-testid="btn-theme-toggle"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">{t('nav.theme')}</span>
          </Button>

          <Link href="/map">
            <Button variant="ghost" className="hidden sm:inline-flex gap-1.5" data-testid="btn-map">
              <Map className="h-4 w-4" />
              {t('nav.map')}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex" data-testid="btn-login">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90" data-testid="btn-signup">
              {t('nav.signup')}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="btn-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t bg-background px-4 py-4 flex flex-col gap-2">
          <a
            href="#directory"
            className="flex w-full items-center py-2 text-sm font-medium hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('hero.ctaPrimary')}
          </a>
          <a
            href="#help"
            className="flex w-full items-center py-2 text-sm font-medium hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('hero.ctaSecondary')}
          </a>
          <Link
            href="/login"
            className="flex w-full items-center py-2 text-sm font-medium hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="link-mobile-login"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/map"
            className="flex w-full items-center py-2 text-sm font-medium hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="link-mobile-map"
          >
            {t('nav.map')}
          </Link>
          <Link href="/signup" className="w-full">
            <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="btn-mobile-signup">
              {t('nav.signup')}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
