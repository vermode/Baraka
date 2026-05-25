import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: number;
  from: "bot" | "user";
  title?: string;
  steps?: string[];
  footer?: string;
  text?: string;
}

const QUICK_REPLIES_AR = [
  "كيف أتبرع؟",
  "كيف أسجل جمعيتي؟",
  "هل المنصة مجانية؟",
  "كيف أطلب مساعدة؟",
];

const QUICK_REPLIES_EN = [
  "How do I donate?",
  "How do I register my charity?",
  "Is the platform free?",
  "How do I request help?",
];

type BotReply = { title: string; steps: string[]; footer?: string };

const BOT_RESPONSES_AR: Record<string, BotReply> = {
  "كيف أتبرع؟": {
    title: "خطوات التبرع عبر بركة:",
    steps: [
      "افتح صفحة «الجمعيات» أو لوحة المتبرع، ثم اختر الجمعية أو الحالة التي تريد دعمها.",
      "اضغط زر «تبرّع» المجاور للجمعية لفتح نافذة التبرع.",
      "اختر نوع التبرع: مالي، طعام، ملابس، أو غير ذلك.",
      "للتبرع المالي اختر طريقة الدفع: بطاقة ائتمان، محفظة (زين كاش / أورانج موني / أمنية كاش)، أو نقداً عند الاستلام.",
      "أكّد المبلغ وأرسل التبرع — ستصلك إشعار وإيصال فوري.",
    ],
    footer: "كل دينار يصل للجمعية مباشرة، بدون أي عمولة.",
  },
  "كيف أسجل جمعيتي؟": {
    title: "خطوات تسجيل جمعيتك:",
    steps: [
      "انزل إلى قسم «سجّل جمعيتك» في أسفل الصفحة الرئيسية.",
      "املأ اسم الجمعية، المحافظة، الفئة، رقم تسجيل وزارة التنمية (إن وُجد)، ونبذة عن نشاطكم.",
      "أدخل بيانات شخص التواصل: الاسم، رقم الهاتف، والبريد الإلكتروني.",
      "اضغط «إرسال» — يصل الطلب لفريق المراجعة فوراً.",
      "نتواصل معك خلال ٣–٥ أيام عمل لتأكيد التوثيق وتفعيل صفحة جمعيتك.",
    ],
    footer: "بعد التفعيل تستطيع إضافة الحملات والمستفيدين واستقبال التبرعات.",
  },
  "هل المنصة مجانية؟": {
    title: "نعم، بركة مجانية بالكامل:",
    steps: [
      "لا توجد أي رسوم اشتراك على المتبرعين.",
      "لا توجد أي رسوم اشتراك على الجمعيات.",
      "لا نأخذ أي عمولة من مبلغ التبرع — ١٠٠٪ يصل للجمعية.",
      "تكاليف التشغيل تُغطى من تبرعات داعمين ومتطوعين فقط.",
    ],
  },
  "كيف أطلب مساعدة؟": {
    title: "خطوات تقديم طلب مساعدة:",
    steps: [
      "انتقل إلى قسم «تحتاج مساعدة؟» في الصفحة الرئيسية.",
      "أدخل اسمك ورقم هاتفك والمحافظة.",
      "اختر نوع المساعدة المطلوبة: مالية، غذاء، طبية، تعليم، سكن، أو رعاية أيتام.",
      "اكتب وصفاً واضحاً لحالتك حتى يستطيع الفريق توجيهك للجمعية المناسبة.",
      "اضغط «إرسال» — يصل طلبك لفريق بركة وستظهر رسالة «الطلب قيد المراجعة».",
      "يتواصل معك أحد ممثلينا خلال ٤٨ ساعة لتأكيد التفاصيل.",
    ],
    footer: "بياناتك سرّية ولا يطّلع عليها إلا فريق المراجعة المعتمد.",
  },
};

const BOT_RESPONSES_EN: Record<string, BotReply> = {
  "How do I donate?": {
    title: "How to donate on Baraka:",
    steps: [
      "Open the «Charities» page or your donor dashboard and pick a charity or case.",
      "Click the «Donate» button next to the charity to open the donation dialog.",
      "Choose donation type: money, food, clothes, or other.",
      "For money donations, pick a payment method: credit card, mobile wallet (Zain Cash / Orange Money / Umniah Cash), or cash on pickup.",
      "Confirm the amount and submit — you'll get an instant notification and receipt.",
    ],
    footer: "Every JOD reaches the charity directly — zero commission.",
  },
  "How do I register my charity?": {
    title: "How to register your charity:",
    steps: [
      "Scroll down to the «Register Your Charity» section on the homepage.",
      "Fill in your organization name, governorate, category, ministry registration number (if available), and a short description.",
      "Provide the contact person's name, phone number, and email.",
      "Click «Submit» — the request reaches the review team instantly.",
      "We contact you within 3–5 business days to verify documents and activate your charity page.",
    ],
    footer: "Once activated, you can add campaigns, beneficiaries, and receive donations.",
  },
  "Is the platform free?": {
    title: "Yes, Baraka is 100% free:",
    steps: [
      "No subscription fees for donors.",
      "No subscription fees for charities.",
      "We take zero commission — 100% of your donation reaches the charity.",
      "Operating costs are covered by sponsor donations and volunteers only.",
    ],
  },
  "How do I request help?": {
    title: "How to submit a help request:",
    steps: [
      "Go to the «Need Help?» section on the homepage.",
      "Enter your name, phone number, and governorate.",
      "Pick the type of aid you need: financial, food, medical, education, housing, or orphan care.",
      "Write a clear description of your situation so the team can match you to the right charity.",
      "Click «Submit» — your request reaches the Baraka team and a «Request under review» message appears.",
      "A representative contacts you within 48 hours to confirm the details.",
    ],
    footer: "Your data is confidential and only seen by the approved review team.",
  },
};

const FALLBACK_AR = "شكراً لتواصلك! للاستفسارات الأخرى يمكنك التواصل مع فريق بركة عبر البريد الإلكتروني. هل يمكنني مساعدتك بشيء آخر؟";
const FALLBACK_EN = "Thanks for reaching out! For other inquiries you can contact the Baraka team via email. Can I help you with something else?";

export function ChatBot() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMsg = isAr
    ? "مرحباً! أنا مساعد بركة الذكي. كيف يمكنني مساعدتك اليوم؟"
    : "Hello! I'm Baraka's smart assistant. How can I help you today?";

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: Date.now(), from: "bot", text: welcomeMsg }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const responses = isAr ? BOT_RESPONSES_AR : BOT_RESPONSES_EN;
      const reply = responses[text];
      const botMsg: Message = reply
        ? { id: Date.now() + 1, from: "bot", title: reply.title, steps: reply.steps, footer: reply.footer }
        : { id: Date.now() + 1, from: "bot", text: isAr ? FALLBACK_AR : FALLBACK_EN };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 900);
  };

  const quickReplies = isAr ? QUICK_REPLIES_AR : QUICK_REPLIES_EN;
  const showQuickReplies = messages.length <= 1;

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        data-testid="btn-chatbot-toggle"
        whileHover={{ scale: 1.10 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 overflow-hidden border-2 border-primary/40"
        style={{
          background: "linear-gradient(135deg, hsl(171 68% 18%), hsl(171 68% 10%))",
        }}
        aria-label={isAr ? "افتح المساعد الذكي" : "Open smart assistant"}
      >
        <img src="/chatbot-logo.png" alt="" className="w-14 h-14 object-contain" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            data-testid="chatbot-window"
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/20 to-primary/5">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-primary/30"
                  style={{
                    background: "linear-gradient(135deg, hsl(171 68% 18%), hsl(171 68% 10%))",
                  }}
                >
                  <img src="/chatbot-logo.png" alt="" className="w-9 h-9 object-contain" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">
                    {isAr ? "مساعد بركة" : "Baraka Assistant"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {isAr ? "متاح الآن" : "Online now"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                data-testid="btn-chatbot-close"
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? (isAr ? "justify-start" : "justify-end") : (isAr ? "justify-end" : "justify-start")}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.steps ? (
                      <div className="space-y-1.5">
                        {msg.title && <p className="font-bold text-foreground">{msg.title}</p>}
                        <ol className={`space-y-1.5 ${isAr ? "pr-1" : "pl-1"}`}>
                          {msg.steps.map((step, i) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                                {i + 1}
                              </span>
                              <span className="flex-1">{step}</span>
                            </li>
                          ))}
                        </ol>
                        {msg.footer && (
                          <p className="text-xs text-muted-foreground pt-1 border-t border-border/40 mt-2">
                            {msg.footer}
                          </p>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showQuickReplies && !typing && (
                <div className={`flex flex-wrap gap-2 pt-1 ${isAr ? "justify-end" : "justify-start"}`}>
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      data-testid={`btn-quick-reply-${q}`}
                      className="text-xs rounded-full border border-primary/50 text-primary bg-primary/10 px-3 py-1.5 hover:bg-primary/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border px-3 py-3 flex items-center gap-2 bg-background/50">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder={isAr ? "اكتب رسالتك..." : "Type your message..."}
                data-testid="input-chatbot-message"
                className="flex-1 bg-muted rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/40 transition-colors"
                dir={isAr ? "rtl" : "ltr"}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || typing}
                data-testid="btn-chatbot-send"
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
