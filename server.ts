import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: AI Restock recommendation
app.post("/api/ai/analyze-stock", async (req, res) => {
  try {
    const { inventory, transactions } = req.body;
    
    if (!inventory || !Array.isArray(inventory)) {
      return res.status(400).json({ error: "Invalid inventory format" });
    }

    const ai = getAIClient();
    
    // Create a contextually rich prompt for Gemini
    const systemPrompt = `You are an expert Inventory Management and Procurement planning AI assistant.
Your task is to analyze the user's current inventory levels, min/max bounds, and withdrawal rates from transaction history, then calculate optimal restocking suggestions and draft purchase orders.

Generate your response in THAI language.
Analyze carefully:
1. Current Stock vs. Min/Max: Identify items below or close to Min.
2. Withdrawal velocity: Look at transactions (type = 'out' or 'จ่ายออก') to see how fast items are consumed.
3. Calculate suggested order quantity: It should replenish the stock to the Max limit (or adjusted based on withdrawal rate).
4. Provide a clear, professional reasoning in Thai for each item.`;

    const userPrompt = `นี่คือข้อมูลคลังสินค้าปัจจุบัน:
${JSON.stringify(inventory, null, 2)}

ประวัติการทำรายการเข้า-ออกสินค้า (สำหรับประเมินอัตราการเบิกจ่าย):
${JSON.stringify(transactions || [], null, 2)}

กรุณาวิเคราะห์สินค้าที่ต้องการจัดซื้อเร่งด่วน คำนวณปริมาณที่ควรสั่งซื้อ และวิเคราะห์ภาพรวมการเบิกจ่ายสินค้าคลัง`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: "รายการเสนอแนะจัดซื้อสินค้า",
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  currentStock: { type: Type.NUMBER },
                  minLimit: { type: Type.NUMBER },
                  maxLimit: { type: Type.NUMBER },
                  suggestedOrderQty: { type: Type.NUMBER, description: "ปริมาณสั่งซื้อแนะนำเพื่อให้ถึงเกณฑ์ที่เหมาะสม" },
                  priority: { type: Type.STRING, description: "ระดับความเร่งด่วน: 'CRITICAL' (ต่ำกว่า Min มาก), 'WARNING' (ใกล้หมด), 'OPTIMAL' (เพียงพอ)" },
                  reasoning: { type: Type.STRING, description: "เหตุผลวิเคราะห์อย่างละเอียดในภาษาไทย (ประเมินจากยอดเบิกและเกณฑ์ Min-Max)" }
                },
                required: ["productId", "productName", "currentStock", "minLimit", "maxLimit", "suggestedOrderQty", "priority", "reasoning"]
              }
            },
            procurementAnalysis: { 
              type: Type.STRING, 
              description: "บทวิเคราะห์ภาพรวมการจัดซื้อและอัตราการหมุนเวียนสินค้าในภาษาไทยอย่างเป็นทางการและชัดเจน" 
            },
            storageOptimizationAdvice: {
              type: Type.STRING,
              description: "คำแนะนำการจัดสรรพื้นที่จัดเก็บคลังสินค้า (Min-Max Space Management) ในภาษาไทย"
            }
          },
          required: ["recommendations", "procurementAnalysis", "storageOptimizationAdvice"]
        }
      }
    });

    const resultText = response?.text;
    if (!resultText) {
      throw new Error("No response received from Gemini model.");
    }

    const resultJson = JSON.parse(resultText.trim());
    res.json(resultJson);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ 
      error: "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI", 
      details: error.message || error 
    });
  }
});

// Serve frontend and start server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
