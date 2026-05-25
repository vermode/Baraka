import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, Users, TrendingUp } from "lucide-react";

export function Trust() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-muted/10" id="trust">
      <div className="container max-w-4xl px-4 sm:px-8 mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            <span>{t('trust.headingPrefix')}</span>
            <span className="brand-gradient">{t('trust.headingAccent')}</span>
            <span>{t('trust.headingSuffix')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('trust.desc')}
          </p>
        </motion.div>

        {/* Centered image */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative max-w-2xl mx-auto mb-10"
        >
          <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-muted relative shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200"
              alt="Community trust"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-transparent rounded-2xl shadow-xl p-4 border border-border/50 w-60 text-center backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-primary mx-auto">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-foreground">{t('trust.statValue')}</div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('trust.statDesc')}</p>
          </motion.div>
        </motion.div>

        {/* Trust badges row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid sm:grid-cols-3 gap-6"
        >
          {[
            { icon: ShieldCheck, label: t('trust.b1') ?? "تحقق رسمي" },
            { icon: Users,       label: t('trust.b2') ?? "مجتمع موثوق" },
            { icon: TrendingUp,  label: t('trust.b3') ?? "شفافية كاملة" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center p-5 rounded-2xl border border-border/50 bg-transparent">
              <div className="w-11 h-11 rounded-full bg-transparent flex items-center justify-center text-primary mx-auto">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
