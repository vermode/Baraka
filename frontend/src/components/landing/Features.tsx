import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Features() {
  const { t } = useLanguage();

  const features = [
    { icon: ShieldCheck, title: t('features.f1Title'), desc: t('features.f1Desc') },
    { icon: Globe,       title: t('features.f2Title'), desc: t('features.f2Desc') },
    { icon: Heart,       title: t('features.f3Title'), desc: t('features.f3Desc') },
  ];

  return (
    <section className="py-24" id="features">
      <div className="container max-w-5xl px-4 sm:px-8 mx-auto">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span>{t('features.heading') ?? "لماذا "}</span>
            <span className="brand-gradient">{t('features.headingAccent') ?? "بركة؟"}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('features.desc') ?? "منصة متكاملة تجمع الشفافية والأمان والتأثير الحقيقي في مكان واحد."}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="p-8 h-full bg-transparent hover:bg-white/5 transition-colors border-border/50 shadow-sm hover:shadow-md text-center">
                <div className="w-14 h-14 rounded-2xl bg-transparent flex items-center justify-center text-primary mb-6 mx-auto">
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
