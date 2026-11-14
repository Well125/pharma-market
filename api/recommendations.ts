// Vercel Function: POST /api/recommendations
import type { IncomingMessage, ServerResponse } from "node:http";
import { recommendProducts } from "../server/gemini.js";
import { sendResult, readJsonBody } from "../server/http.js";

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendResult(res, { status: 405, body: { error: "method_not_allowed" } });
  }
  const body = await readJsonBody(req);
  return sendResult(res, await recommendProducts(body));
}
