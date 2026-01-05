
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[], query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const txSummary = transactions.map(tx => ({
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    peer: tx.peerName,
    date: tx.timestamp.toISOString()
  }));

  const systemPrompt = `You are Kora AI, a friendly financial assistant for the Kora Digital Wallet.
  You have access to the user's recent transactions: ${JSON.stringify(txSummary)}.
  Provide concise, helpful advice or answer queries about their spending.
  Keep it modern, sleek, and encouraging. Use markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a bit of trouble connecting to my neural net. Could you try asking me again in a moment?";
  }
};

export const analyzeSpending = async (transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const txSummary = transactions.map(tx => ({
    amount: tx.amount,
    category: tx.category,
    type: tx.type
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Analyze this spending data and provide three short, actionable bullet points to save money.",
      config: {
        systemInstruction: `Analyze the user's transactions: ${JSON.stringify(txSummary)}. Provide output as a JSON object with a 'tips' array of strings.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["tips"]
        }
      }
    });

    return JSON.parse(response.text).tips;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return ["Limit your small, frequent purchases.", "Check for recurring subscriptions you don't use.", "Consider setting a budget for the 'Food' category."];
  }
};
