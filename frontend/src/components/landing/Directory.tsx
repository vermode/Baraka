import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Search, ShieldCheck, MapPin, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { associations } from "@/lib/associations";

export function Directory() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = ["all", "charity", "development", "women", "special", "culture", "sports", "union"];

  const filtered = useMemo(() => {
    return associations.filter(a => {
      const matchSearch = a.name.includes(search) || t(`dir.cats.${a.category}`).includes(search);
      const matchFilter = filter === "all" || a.category === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter, t]);

  return (
    <section className="py-20 bg-muted/5" id="directory">
      <div className="container max-w-screen-2xl px-4 sm:px-8 mx-auto">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span>{t('dir.headingPrefix')}</span>
            <span className="brand-gradient">{t('dir.headingAccent')}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{t('dir.desc')}</p>
        </div>

        <div className="mb-8 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type="text" 
              placeholder={t('dir.searchPlaceholder')}
              className="ps-10 h-12 rounded-xl bg-background border-border/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === cat 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background border border-border/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                {t(`dir.cats.${cat}`)}
              </button>
            ))}
          </div>

          <div className="text-sm text-muted-foreground font-medium text-center">
            {filtered.length} {t('dir.headingPrefix')}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border border-dashed rounded-2xl">
            {t('dir.empty')}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col p-6 hover:shadow-md transition-shadow border-border/50 bg-transparent">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-3">
                      {t(`dir.cats.${org.category}`)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{org.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{org.desc}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t(`govs.${org.gov}`)}</span>
                      {org.verified && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border mx-1"></span>
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/map">
                        <Button size="sm" variant="ghost" className="rounded-full px-3 gap-1.5 text-muted-foreground hover:text-primary" data-testid={`btn-map-${org.id}`}>
                          <Map className="w-3.5 h-3.5" />
                          {t('nav.map')}
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5" data-testid={`btn-donate-${org.id}`}>
                          {t('dir.donate')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
