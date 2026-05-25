import { useLanguage } from "@/contexts/LanguageContext";
import { useGetStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { HandCoins, Users, Building2, UserCircle2, Heart } from "lucide-react";

export function LiveImpact() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { data } = useGetStats();

  const items = [
    { icon: HandCoins,    value: `${(data?.totalRaised ?? 0).toLocaleString("en-US")} ${isAr ? "د.أ" : "JOD"}`, label: isAr ? "إجمالي المتبرَّع" : "Total raised" },
    { icon: Heart,        value: (data?.donationCount ?? 0).toLocaleString("en-US"), label: isAr ? "تبرع تم" : "Donations" },
    { icon: Users,        value: (data?.donorCount ?? 0).toLocaleString("en-US"), label: isAr ? "متبرع نشط" : "Active donors" },
    { icon: Building2,    value: (data?.organizationCount ?? 0).toLocaleString("en-US"), label: isAr ? "جمعية موثّقة" : "Verified charities" },
    { icon: UserCircle2,  value: (data?.beneficiaryCount ?? 0).toLocaleString("en-US"), label: isAr ? "حالة مستفيدة" : "Beneficiary cases" },
  ];

  return (
    <section className="py-16 bg-muted/10 border-y border-border/40" id="impact">
      <div className="container max-w-6xl px-4 sm:px-8 mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {isAr ? "أرقام مباشرة" : "Live numbers"}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-4">
            <span className="brand-gradient">{isAr ? "أثرك الحقيقي" : "Your real impact"}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            {isAr ? "تُحدَّث هذه الأرقام مع كل تبرع جديد على المنصة." : "These numbers update with every new donation on the platform."}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-2xl border border-border/60 bg-card p-5 text-center"
              data-testid={`live-stat-${i}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <it.icon className="w-5 h-5" />
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-foreground font-en">{it.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{it.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
