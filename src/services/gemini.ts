import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. General Chatbot using Gemini 3 Pro Preview
export const sendChatMessage = async (
  message: string, 
  history: {role: 'user' | 'model', parts: {text: string}[]}[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are the AI assistant for Latam Predict, a prediction market platform. Help users understand markets, betting concepts, and probabilities. Be concise, professional, and helpful.",
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Ocurrió un error al conectar con el asistente.";
  }
};

// 2. Search Grounding for Market Research using Gemini 3 Flash Preview
export interface SearchResult {
  answer: string;
  sources: Array<{uri: string, title: string}>;
}

export const researchMarketTopic = async (topic: string): Promise<SearchResult> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the latest news and information relevant to this prediction market question: "${topic}". Summarize the current consensus or key events affecting the outcome.`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const answer = response.text || "No se encontró información relevante.";
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ uri: web.uri, title: web.title }));

    return { answer, sources };
  } catch (error) {
    console.error("Search error:", error);
    return { answer: "Error al buscar información.", sources: [] };
  }
};

// 3. Fast Market Analysis using Gemini 2.5 Flash Lite
export const analyzeMarketFast = async (marketTitle: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Mapped from gemini-2.5-flash-lite
      contents: `Analyze this prediction market question briefly: "${marketTitle}". Provide 3 bullet points on factors that could influence the "Yes" outcome and 3 for "No". Keep it very short.`,
      config: {
        temperature: 0.3,
      }
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Analysis unavailable at this moment.";
  }
};