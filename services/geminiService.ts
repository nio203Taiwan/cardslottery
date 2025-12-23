import { GoogleGenAI } from "@google/genai";
import { ProcessedImage } from "../types";

// Using the Flash model as it is efficient for multimodal tasks (text + images)
// As per guidelines, 'gemini flash' maps to 'gemini-flash-latest' but 'gemini-3-flash-preview' is recommended for basic tasks.
// Since we are doing multimodal analysis, gemini-3-flash-preview is suitable.
const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeCards = async (card1: ProcessedImage, card2: ProcessedImage): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY not found in environment variables.");
      return "請設定 API Key 以啟用 AI 判讀功能。 (Please set API Key to enable AI analysis)";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Helper to strip the data:image/jpeg;base64, prefix
    const getBase64 = (dataUrl: string) => dataUrl.split(',')[1];

    const prompt = `
      這是一個聖誕節的感恩卡抽獎活動。
      請針對這兩張圖片進行判讀：
      1. 如果圖片上有手寫文字，請試著辨識並唸出來（如果是真心話或感謝詞）。
      2. 描述一下這兩張卡片的氛圍或裝飾風格。
      3. 給這兩位寫卡片的人（或收卡片的人）一句溫暖的聖誕祝福。
      
      請用溫馨、歡樂的語氣回答，回應長度大約 150 字左右即可。
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: getBase64(card1.dataUrl)
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: getBase64(card2.dataUrl)
            }
          }
        ]
      }
    });

    return response.text || "AI 似乎在忙著過聖誕節，暫時無法回應。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 連線發生錯誤，請稍後再試。";
  }
};