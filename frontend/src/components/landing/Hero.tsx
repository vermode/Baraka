import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, ArrowRight, ArrowLeft, HandCoins } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { t, lang } = useLanguage();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ["0%", "35%"]);

  return (
    <section className="py-20 md:py-28 overflow-hidden relative">
      {/* Parallax background image */}
      <motion.div
        aria-hidden="true"
        style={{
          y: bgY,
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: 0.13,
          zIndex: 0,
          position: "absolute",
          inset: "-30% 0",
        }}
      />
      <div className="container max-w-screen-2xl px-4 sm:px-8 relative" style={{ zIndex: 1 }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('hero.badge')}</span>
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-center tracking-tight leading-tight max-w-4xl mx-auto"
        >
          <span>{t('hero.titlePrefix')}</span>
          <span className="brand-gradient">{t('hero.titleBrand')}</span>
          <span className="text-[var(--color-accent-green)]">{t('hero.titleDot')}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-center mt-6 mx-auto text-lg md:text-xl max-w-[36rem]"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" className="w-full sm:w-auto text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8" asChild>
            <a href="#directory">
              <ArrowIcon className="w-5 h-5" />
              <span>{t('hero.ctaPrimary')}</span>
            </a>
          </Button>
          <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base gap-2 rounded-full px-8" asChild>
            <a href="#help">
              <HandCoins className="w-5 h-5" />
              <span>{t('hero.ctaSecondary')}</span>
            </a>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
