
import { GoogleGenAI, Type } from "@google/genai";
import type { Product, ChatMessage } from "../types";

// Safely access process.env
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }
  return '';
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getAIRecommendations(
  userPrompt: string,
  products: Product[]
): Promise<string[]> {
  if (!API_KEY) {
    // Simulate a delay and return a mock response if API key is not available
    await new Promise(resolve => setTimeout(resolve, 1500));
    return ["Analgésico", "Vitamina C", "Xarope para Tosse"];
  }

  const productNames = products.map(p => p.name);

  const model = "gemini-2.5-flash";
  const systemInstruction = `Você é um assistente de farmácia virtual útil. Sua tarefa é recomendar produtos com base nos sintomas do usuário.
    Você SÓ PODE recomendar produtos da lista fornecida.
    NÃO forneça conselhos médicos.
    Responda APENAS com um array JSON de strings, contendo os nomes dos produtos recomendados.
    Se nenhum produto corresponder, retorne um array vazio.`;

  const fullPrompt = `Sintomas do usuário: "${userPrompt}".\n\nLista de produtos disponíveis: ${JSON.stringify(
    productNames
  )}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "O nome de um produto recomendado da lista fornecida.",
          },
        },
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const recommendations: string[] = JSON.parse(jsonText);

    return recommendations;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get AI recommendations.");
  }
}

export async function getPharmacistResponse(
  userPrompt: string,
  history: ChatMessage[]
): Promise<string> {
  if (!API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "Olá! Sou a assistente farmacêutica virtual. Como posso ajudar? Lembre-se, para questões médicas sérias, consulte um profissional de saúde.";
  }
  
  const model = "gemini-2.5-flash";
  const systemInstruction = `Você é um assistente farmacêutico de IA. Seu nome é FarmaBot.
Seja amigável, prestativo e profissional. Forneça informações gerais sobre saúde e bem-estar.
NÃO forneça diagnósticos ou prescrições.
SEMPRE inclua um aviso para que o usuário consulte um médico ou farmacêutico real para aconselhamento médico personalizado.
Mantenha as respostas concisas e fáceis de entender.`;

  // We are not using chat history for now to keep it simple, but this is how you would.
  // const contents = [
  //   ...history.map(msg => ({
  //     role: msg.sender === 'user' ? 'user' : 'model',
  //     parts: [{ text: msg.text }]
  //   })),
  //   { role: 'user', parts: [{ text: userPrompt }] }
  // ];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API for pharmacist chat:", error);
    throw new Error("Failed to get response from AI pharmacist.");
  }
}
