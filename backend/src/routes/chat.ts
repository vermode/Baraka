import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables. Chatbot will not function correctly.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");



const systemInstruction = `اسمك "نشمي"، وأنت المساعد الذكي الخاص بمنصة "بركة" الخيرية في الأردن. 
تحدث دائماً بلهجة أردنية ودودة ومختصرة. 
مهمتك الوحيدة والأساسية هي مساعدة المستخدمين فقط في كيفية التبرع أو تقديم طلبات المساعدة عبر الموقع. 
القاعدة الذهبية: ممنوع منعاً باتاً الإجابة على أي سؤال خارج نطاق منصة بركة (حتى لو كان سؤالاً عاماً، علمياً، أو ترفيهياً). 
إذا سألك المستخدم عن أي شيء خارج هذا النطاق، اعتذر فوراً وأخبره: "اعذرني، أنا مبرمج بس عشان أخدمكم في منصة بركة الخيرية، ما بقدر أجاوبك على هاد الموضوع."`;

const model = genAI.getGenerativeModel({ 
  model: "gemini-3.5-flash",
  systemInstruction: systemInstruction // هون إحنا ربطنا القوانين بالموديل فعلياً
});

router.post("/chat", async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // history should be in the format expected by Gemini: { role: "user" | "model", parts: [{ text: string }] }[]
    const chatSession = model.startChat({
      history: history || [],
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error("Gemini API Error:", error);
    req.log?.error(error, "Gemini API Error");
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;
