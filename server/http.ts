// Utilitários HTTP usados pelas Vercel Functions e pelo servidor de desenvolvimento do Vite.
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ApiResult } from "./gemini.js";

const MAX_BODY_BYTES = 100_000;

// Na Vercel o corpo JSON já chega em req.body; no Vite precisamos ler o stream.
export async function readJsonBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return safeParse(req.body);
    return req.body;
  }
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES) return null;
  }
  return safeParse(raw);
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function sendResult(res: ServerResponse, result: ApiResult): void {
  res.statusCode = result.status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(result.body));
}
