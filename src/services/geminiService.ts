import { GoogleGenAI, Type } from "@google/genai";
import { TRADABLE_STOCKS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StockAnalysis {
  ticker: string;
  name: string;
  trend: "上昇" | "下降" | "横ばい";
  score: number; // 0-100
  summary: string;
}

export async function analyzeStock(query: string): Promise<StockAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `企業名または銘柄コード "${query}" について、最新の市場トレンドに基づいた分析と、短期的な予測（上昇傾向、下降傾向、横ばい）を教えてください。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            name: { type: Type.STRING },
            trend: { type: Type.STRING, enum: ["上昇", "下降", "横ばい"] },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          },
          required: ["ticker", "name", "trend", "score", "summary"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("分析中にエラーが発生しました。");
  }
}

export async function analyzeAllStocks(): Promise<StockAnalysis[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const stockList = TRADABLE_STOCKS.map(s => `${s.name} (${s.ticker})`).join(", ");
  const prompt = `以下の銘柄リストの全てについて、現在の市場環境に基づいた分析と、短期的な予測（上昇傾向、下降傾向、横ばい）を教えてください。また、その中から特に推奨する銘柄をいくつか選んでください。
  
  銘柄リスト: ${stockList}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              name: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ["上昇", "下降", "横ばい"] },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING }
            },
            required: ["ticker", "name", "trend", "score", "summary"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("全銘柄の分析中にエラーが発生しました。");
  }
}

export async function analyzeSellTiming(ticker: string): Promise<StockAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `銘柄コード "${ticker}" について、現在の市場環境に基づき、売却すべきタイミングや判断基準について分析してください。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            name: { type: Type.STRING },
            trend: { type: Type.STRING, enum: ["上昇", "下降", "横ばい"] },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          },
          required: ["ticker", "name", "trend", "score", "summary"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("売却タイミングの分析中にエラーが発生しました。");
  }
}

export async function getStockRecommendation(): Promise<StockAnalysis[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const stockList = TRADABLE_STOCKS.map(s => `${s.name} (${s.ticker})`).join(", ");
  const prompt = `以下の銘柄リストの中から、現在の市場環境でトレードに適している（買うべき）銘柄をいくつか選び、その理由を初心者にも分かりやすく説明してください。
  
  銘柄リスト: ${stockList}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              name: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ["上昇", "下降", "横ばい"] },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING }
            },
            required: ["ticker", "name", "trend", "score", "summary"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("推奨銘柄の選定中にエラーが発生しました。");
  }
}
