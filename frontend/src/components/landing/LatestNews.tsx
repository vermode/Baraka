import { useLanguage } from "@/contexts/LanguageContext";
import { useListAnnouncements } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Megaphone, AlertCircle, Calendar } from "lucide-react";

export function LatestNews() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { data, isLoading } = useListAnnouncements();
  const items = (data ?? []).slice(0, 3);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="py-20 bg-muted/10 border-y border-border/40" id="news">
      <div className="container max-w-6xl px-4 sm:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span>{isAr ? "آخر " : "Latest "}</span>
            <span className="brand-gradient">{isAr ? "الأخبار والتنبيهات" : "news & alerts"}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {isAr ? "تابع نشاطات المنصة والحملات الجديدة." : "Stay up to date with the latest platform activity."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((a, i) => {
            const isAlert = a.kind === "alert";
            const Icon = isAlert ? AlertCircle : Megaphone;
            return (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-border/60 bg-card p-5"
                data-testid={`news-card-${a.id}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAlert ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${isAlert ? "bg-amber-500/15 text-amber-500" : "bg-primary/15 text-primary"}`}>
                      {isAlert ? (isAr ? "تنبيه" : "Alert") : (isAr ? "خبر" : "News")}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-base mb-2 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{a.body}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-3 border-t border-border/40">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(a.createdAt).toLocaleDateString(isAr ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" })}</span>
                  {a.organizationName && (
                    <>
                      <span className="mx-1">·</span>
                      <span>{a.organizationName}</span>
                    </>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
