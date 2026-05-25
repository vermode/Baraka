import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_AR = [
  { q: "هل منصة بركة مجانية فعلاً؟", a: "نعم، بركة مجانية بالكامل للمتبرعين والجمعيات. لا نأخذ أي عمولة على التبرعات — ١٠٠٪ من المبلغ يصل للجمعية مباشرة." },
  { q: "كيف أتأكد أن الجمعية موثّقة؟", a: "كل جمعية تظهر على المنصة تمر بعملية تحقق مكوّنة من ٥٠ نقطة تشمل الترخيص الرسمي، الصحة المالية، والشفافية. الجمعيات الموثّقة تحمل شارة خضراء." },
  { q: "ما هي طرق التبرع المتاحة؟", a: "حالياً يمكنك التبرع مباشرة عبر المنصة بعد إنشاء حساب مجاني. نعمل على إضافة مزيد من طرق الدفع قريباً." },
  { q: "كيف أُسجِّل جمعيتي على بركة؟", a: "املأ نموذج «سجل جمعيتك» في أسفل الصفحة الرئيسية، وسيتواصل معك فريقنا خلال ٣–٥ أيام عمل لاستكمال عملية التحقق." },
  { q: "هل بياناتي وتبرعاتي آمنة؟", a: "نعم، نستخدم تشفيراً متقدماً لكلمات المرور والجلسات. لا نشارك بياناتك مع أي طرف ثالث، وكل تبرع يُسجَّل بأمان تام." },
  { q: "كيف أطلب مساعدة لشخص يحتاج؟", a: "استخدم نموذج «تحتاج مساعدة؟» في الصفحة الرئيسية واملأ التفاصيل. سيتواصل معك فريقنا خلال ٤٨ ساعة لتوصيلك بأنسب جمعية." },
];

const FAQ_EN = [
  { q: "Is Baraka really free?", a: "Yes. Baraka is completely free for both donors and charities. We take 0% commission — 100% of every donation reaches the charity." },
  { q: "How do you verify charities?", a: "Every charity on the platform goes through a 50-point verification covering official licensing, financial health, and transparency. Verified charities carry a green badge." },
  { q: "What donation methods are available?", a: "You can donate directly through the platform after creating a free account. More payment methods are coming soon." },
  { q: "How do I register my charity?", a: "Fill out the «Register Your Charity» form at the bottom of the home page. Our team will contact you within 3–5 business days to complete verification." },
  { q: "Is my data and donation secure?", a: "Yes. We use strong password and session encryption. We never share your data with third parties, and every donation is recorded securely." },
  { q: "How do I request help for someone in need?", a: "Use the «Need Help?» form on the home page and submit the details. Our team will reach out within 48 hours to match you with the right charity." },
];

export function FAQ() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const items = isAr ? FAQ_AR : FAQ_EN;

  return (
    <section className="py-24 bg-background" id="faq">
      <div className="container max-w-3xl px-4 sm:px-8 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 text-primary items-center justify-center mb-6 mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span>{isAr ? "أسئلة " : "Frequently asked "}</span>
            <span className="brand-gradient">{isAr ? "شائعة" : "questions"}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {isAr ? "كل ما تحتاج معرفته عن منصة بركة." : "Everything you need to know about Baraka."}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border/60 rounded-2xl px-6 md:px-8 py-2"
        >
          <Accordion type="single" collapsible className="w-full">
            {items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`}>
                <AccordionTrigger className="text-base font-bold hover:no-underline text-start py-5">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
