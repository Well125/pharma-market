// Lógica do Gemini que roda SOMENTE no servidor (Vercel Functions ou servidor de dev do Vite).
// A chave fica em process.env.GEMINI_API_KEY e nunca é enviada ao navegador.
import { GoogleGenAI, Type } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const MAX_PROMPT_LENGTH = 1000;
const MAX_PRODUCTS = 200;
const MAX_PRODUCT_NAME_LENGTH = 150;

export interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

function readPrompt(body: unknown): string | null {
  const prompt = (body as { prompt?: unknown } | null)?.prompt;
  if (typeof prompt !== "string") return null;
  const trimmed = prompt.trim();
  if (!trimmed || trimmed.length > MAX_PROMPT_LENGTH) return null;
  return trimmed;
}

function readProductNames(body: unknown): string[] | null {
  const names = (body as { productNames?: unknown } | null)?.productNames;
  if (!Array.isArray(names) || names.length === 0 || names.length > MAX_PRODUCTS) return null;
  if (!names.every((n) => typeof n === "string" && n.length > 0 && n.length <= MAX_PRODUCT_NAME_LENGTH)) {
    return null;
  }
  return names as string[];
}

const missingKey: ApiResult = {
  status: 503,
  body: { error: "missing_api_key", message: "GEMINI_API_KEY não configurada no servidor." },
};

const badRequest = (message: string): ApiResult => ({
  status: 400,
  body: { error: "bad_request", message },
});

const upstreamError: ApiResult = {
  status: 502,
  body: { error: "ai_error", message: "Falha ao consultar a IA." },
};

export async function recommendProducts(body: unknown): Promise<ApiResult> {
  const prompt = readPrompt(body);
  if (!prompt) return badRequest(`Envie "prompt" com até ${MAX_PROMPT_LENGTH} caracteres.`);
  const productNames = readProductNames(body);
  if (!productNames) return badRequest(`Envie "productNames" com até ${MAX_PRODUCTS} nomes.`);

  const ai = getClient();
  if (!ai) return missingKey;

  const systemInstruction = `Você é um assistente de farmácia virtual útil. Sua tarefa é recomendar produtos com base nos sintomas do usuário.
    Você SÓ PODE recomendar produtos da lista fornecida.
    NÃO forneça conselhos médicos.
    Responda APENAS com um array JSON de strings, contendo os nomes dos produtos recomendados.
    Se nenhum produto corresponder, retorne um array vazio.`;

  const fullPrompt = `Sintomas do usuário: "${prompt}".\n\nLista de produtos disponíveis: ${JSON.stringify(productNames)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
      config: {
        systemInstruction,
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

    const parsed: unknown = JSON.parse((response.text ?? "[]").trim());
    // Garante que só voltam nomes que existem na lista enviada.
    const allowed = new Set(productNames);
    const recommendations = Array.isArray(parsed)
      ? parsed.filter((n): n is string => typeof n === "string" && allowed.has(n))
      : [];

    return { status: 200, body: { recommendations } };
  } catch (error) {
    console.error("Erro ao chamar o Gemini (recomendações):", error);
    return upstreamError;
  }
}

export async function pharmacistReply(body: unknown): Promise<ApiResult> {
  const prompt = readPrompt(body);
  if (!prompt) return badRequest(`Envie "prompt" com até ${MAX_PROMPT_LENGTH} caracteres.`);

  const ai = getClient();
  if (!ai) return missingKey;

  const systemInstruction = `Você é um assistente farmacêutico de IA. Seu nome é FarmaBot.
Seja amigável, prestativo e profissional. Forneça informações gerais sobre saúde e bem-estar.
NÃO forneça diagnósticos ou prescrições.
SEMPRE inclua um aviso para que o usuário consulte um médico ou farmacêutico real para aconselhamento médico personalizado.
Mantenha as respostas concisas e fáceis de entender.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { systemInstruction, temperature: 0.7 },
    });

    return { status: 200, body: { reply: response.text ?? "" } };
  } catch (error) {
    console.error("Erro ao chamar o Gemini (chat):", error);
    return upstreamError;
  }
}

export const routes: Record<string, (body: unknown) => Promise<ApiResult>> = {
  "/api/recommendations": recommendProducts,
  "/api/pharmacist": pharmacistReply,
};
