import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="py-24 border-y border-border/50 bg-background text-center" id="cta">
      <div className="container max-w-2xl px-4 sm:px-8 text-center mx-auto">
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          <span>{t('cta.headingPrefix')}</span>
          <span className="brand-gradient">{t('cta.headingAccent')}</span>
          <span>{t('cta.headingSuffix')}</span>
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          {t('cta.desc')}
        </p>

        <Link href="/signup">
          <Button size="lg" data-testid="btn-cta-signup" className="rounded-full px-10 h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            {t('cta.btn')}
          </Button>
        </Link>

      </div>
    </section>
  );
}
