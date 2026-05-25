import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Heart, Sprout, Users, Accessibility, BookOpen, Trophy, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { associations } from "@/lib/associations";

const CATS = [
  { key: "charity",     icon: Heart,         color: "text-rose-400" },
  { key: "development", icon: Sprout,        color: "text-emerald-400" },
  { key: "women",       icon: Users,         color: "text-pink-400" },
  { key: "special",     icon: Accessibility, color: "text-sky-400" },
  { key: "culture",     icon: BookOpen,      color: "text-amber-400" },
  { key: "sports",      icon: Trophy,        color: "text-orange-400" },
  { key: "union",       icon: Building2,     color: "text-violet-400" },
];

export function Categories() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of associations) map[a.category] = (map[a.category] ?? 0) + 1;
    return map;
  }, []);

  return (
    <section className="py-20 bg-background" id="categories">
      <div className="container max-w-6xl px-4 sm:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span>{isAr ? "تصفّح حسب " : "Browse by "}</span>
            <span className="brand-gradient">{isAr ? "الفئة" : "category"}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {isAr ? "اختر المجال الذي يلامس قلبك ويستحق دعمك." : "Pick the cause that resonates with you."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATS.map((c, i) => (
            <motion.a
              key={c.key}
              href="#directory"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/50 transition-colors"
              data-testid={`cat-card-${c.key}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted/40 rounded-full px-2.5 py-1 font-en">
                  {counts[c.key] ?? 0}
                </span>
              </div>
              <h3 className="font-bold text-base mb-1">{t(`dir.cats.${c.key}`)}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                {isAr ? "تصفّح" : "Browse"}
                <Arrow className="w-3 h-3" />
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
