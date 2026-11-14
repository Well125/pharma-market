import type { Product, ChatMessage } from "../types";

// O navegador NÃO fala direto com o Gemini: ele chama as rotas /api/*,
// que rodam no servidor (Vercel Functions) e guardam a chave GEMINI_API_KEY.

class MissingApiKeyError extends Error {}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 503 && data?.error === "missing_api_key") {
    throw new MissingApiKeyError(data.message);
  }
  if (!response.ok) {
    throw new Error(data?.message || `Erro ${response.status} ao chamar ${url}`);
  }
  return data as T;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAIRecommendations(
  userPrompt: string,
  products: Product[]
): Promise<string[]> {
  try {
    const { recommendations } = await postJson<{ recommendations: string[] }>(
      "/api/recommendations",
      { prompt: userPrompt, productNames: products.map((p) => p.name) }
    );
    return recommendations;
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      // Sem chave configurada no servidor: devolve uma resposta de exemplo.
      console.warn("GEMINI_API_KEY não configurada no servidor. Usando resposta de exemplo.");
      await delay(1500);
      return ["Analgésico", "Vitamina C", "Xarope para Tosse"];
    }
    console.error("Error calling recommendations API:", error);
    throw new Error("Failed to get AI recommendations.");
  }
}

export async function getPharmacistResponse(
  userPrompt: string,
  _history: ChatMessage[]
): Promise<string> {
  try {
    const { reply } = await postJson<{ reply: string }>("/api/pharmacist", { prompt: userPrompt });
    return reply;
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      console.warn("GEMINI_API_KEY não configurada no servidor. Usando resposta de exemplo.");
      await delay(1500);
      return "Olá! Sou a assistente farmacêutica virtual. Como posso ajudar? Lembre-se, para questões médicas sérias, consulte um profissional de saúde.";
    }
    console.error("Error calling pharmacist API:", error);
    throw new Error("Failed to get response from AI pharmacist.");
  }
}
