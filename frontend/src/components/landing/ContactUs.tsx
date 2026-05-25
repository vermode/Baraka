import { motion } from "framer-motion";
import { MapPin, Phone, User, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactUs() {
  const { t } = useLanguage();

  const items = [
    {
      icon: MapPin,
      title: t("contact.addressTitle"),
      value: t("contact.addressValue"),
    },
    {
      icon: Phone,
      title: t("contact.phoneTitle"),
      value: t("contact.phoneValue"),
    },
    {
      icon: User,
      title: t("contact.directorTitle"),
      value: t("contact.directorValue"),
    },
    {
      icon: Mail,
      title: t("contact.emailTitle"),
      value: "maan.uvs1971@gmail.com",
    },
    {
      icon: Clock,
      title: t("contact.hoursTitle"),
      value: t("contact.hoursValue"),
    },
  ];

  return (
    <section
      className="py-24 bg-background text-center border-t border-border/50"
      id="contact"
    >
      <div className="container max-w-6xl px-4 sm:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="brand-gradient">{t("contact.heading")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.desc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-5">
            {items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-4 text-start p-5 rounded-2xl border border-border/50 bg-transparent"
              >
                <div className="w-11 h-11 shrink-0 rounded-full bg-transparent text-primary flex items-center justify-center">
                  <it.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1 text-foreground">
                    {it.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {it.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden border border-border/50 h-full min-h-[400px] shadow-md"
          >
            <iframe
              src="https://www.google.com/maps?q=Civil+Defense+Ma%27an+Jordan&hl=ar&z=16&output=embed"
              className="w-full h-full min-h-[400px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="معان، حي السطح، مقابل الدفاع المدني"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
