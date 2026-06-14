import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
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

export function ChatBot() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMsg = isAr
    ? "مرحباً! أنا مساعد بركة الذكي. كيف يمكنني مساعدتك اليوم؟"
    : "Hello! I'm Baraka's smart assistant. How can I help you today?";

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: Date.now(), from: "bot", text: welcomeMsg }]);
    }
  }, [open, messages.length, welcomeMsg]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Scroll to bottom when user sends a message or when loading starts (typing indicator).
    // DO NOT scroll to bottom when a bot message arrives, so the user can read from the top.
    if (loading || (lastMessage && lastMessage.from === "user") || messages.length <= 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Map previous messages to Gemini's expected format, excluding the initial welcome message if we want to save tokens, 
      // but it's simpler to just map all. 
      // Note: we'll just map the conversation history.
      const history = messages.filter(m => m.text !== welcomeMsg).map(m => ({
        role: m.from === "bot" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await res.json();
      
      const botMsg: Message = { id: Date.now() + 1, from: "bot", text: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        from: "bot", 
        text: isAr ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً." : "Sorry, a connection error occurred. Please try again later."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
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
                        ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
                        : "bg-muted text-foreground rounded-bl-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                    }`}
                  >
                    {msg.from === "bot" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {loading && (
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

              {showQuickReplies && !loading && (
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
                disabled={loading}
                data-testid="input-chatbot-message"
                className="flex-1 bg-muted rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/40 transition-colors disabled:opacity-50"
                dir={isAr ? "rtl" : "ltr"}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
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
